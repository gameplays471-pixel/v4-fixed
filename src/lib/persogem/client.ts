export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callPersoGemLLM(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = groqKey || openAiKey;

  if (!apiKey) {
    throw new Error(
      "Nenhuma API key configurada. Defina GROQ_API_KEY (recomendado) ou OPENAI_API_KEY."
    );
  }

  const baseUrl = (
    process.env.PERSOGEM_BASE_URL?.trim() ||
    (groqKey ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1")
  ).replace(/\/$/, "");

  const model =
    process.env.PERSOGEM_MODEL?.trim() ||
    (groqKey ? "llama-3.3-70b-versatile" : "gpt-4o-mini");

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM error ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Resposta vazia do modelo");
  return content;
}

/** Extrai o primeiro objeto JSON {...} de uma resposta do modelo. */
export function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Nenhum JSON encontrado na resposta");
  return JSON.parse(raw.slice(start, end + 1));
}
