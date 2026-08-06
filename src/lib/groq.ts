// Cliente para a API da Groq (chat/completions), usada pelo PersoGem
// (coach de treino em IA — ver src/lib/coach-prompts.ts).
//
// A Groq expõe uma API compatível com o formato OpenAI em
// https://api.groq.com/openai/v1 — por isso não usamos um SDK dedicado,
// só `fetch` puro (menos uma dependência, e dá controle total do streaming
// SSE, que repassamos pro cliente já reformatado em src/app/api/coach/chat).
//
// Modelo: configurável via GROQ_MODEL (env). Default: openai/gpt-oss-120b —
// recomendado pela própria Groq após a depreciação do llama-3.3-70b-versatile
// (jun/2026), com bom suporte a tool calling e 131k de contexto.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export type GroqRole = "system" | "user" | "assistant" | "tool";

export interface GroqMessage {
  role: GroqRole;
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

export interface GroqTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface StreamGroqChatOptions {
  messages: GroqMessage[];
  tools?: GroqTool[];
  toolChoice?: "auto" | "none";
  temperature?: number;
  maxTokens?: number;
}

/**
 * Abre a conexão de streaming com a Groq e devolve a `Response` crua
 * (ainda no formato SSE/OpenAI). Quem chama é responsável por ler
 * `response.body` e traduzir os eventos — ver `readGroqStream` abaixo,
 * usado em src/app/api/coach/chat/route.ts.
 */
export async function streamGroqChat(opts: StreamGroqChatOptions): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY não configurada no ambiente");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 2048,
      ...(opts.tools && opts.tools.length > 0
        ? { tools: opts.tools, tool_choice: opts.toolChoice ?? "auto" }
        : {}),
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 500)}`);
  }

  return res;
}

export interface AccumulatedToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface GroqStreamHandlers {
  onTextDelta?: (delta: string) => void;
  /** Chamado quando uma tool call termina de chegar (todos os deltas acumulados). */
  onToolCall?: (call: AccumulatedToolCall) => void;
}

/**
 * Lê o corpo SSE (formato OpenAI: `data: {...}\n\n`, terminado em
 * `data: [DONE]`) e acumula deltas de texto e de tool calls, disparando
 * os callbacks conforme os dados chegam / terminam.
 */
export async function consumeGroqStream(res: Response, handlers: GroqStreamHandlers): Promise<void> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // Tool calls chegam em pedaços (delta.tool_calls[i].function.arguments é
  // uma string parcial a cada chunk) — acumulamos por índice até o fim.
  const toolCallsByIndex = new Map<number, { id: string; name: string; arguments: string }>();

  const flushLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") return;

    let json: any;
    try {
      json = JSON.parse(payload);
    } catch {
      return; // linha incompleta/corrompida — ignora
    }

    const choice = json?.choices?.[0];
    if (!choice) return;

    const delta = choice.delta || {};

    if (typeof delta.content === "string" && delta.content.length > 0) {
      handlers.onTextDelta?.(delta.content);
    }

    if (Array.isArray(delta.tool_calls)) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        const existing = toolCallsByIndex.get(idx) || { id: "", name: "", arguments: "" };
        if (tc.id) existing.id = tc.id;
        if (tc.function?.name) existing.name = tc.function.name;
        if (typeof tc.function?.arguments === "string") existing.arguments += tc.function.arguments;
        toolCallsByIndex.set(idx, existing);
      }
    }

    if (choice.finish_reason === "tool_calls" || choice.finish_reason === "stop") {
      for (const call of toolCallsByIndex.values()) {
        if (call.name) handlers.onToolCall?.(call);
      }
      toolCallsByIndex.clear();
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // última linha pode estar incompleta
    for (const line of lines) flushLine(line);
  }
  if (buffer) flushLine(buffer);
}
