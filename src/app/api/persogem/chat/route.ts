import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { parseBody } from "@/lib/validation";
import { loadPersoGemPrompt, type PersoGemMode } from "@/lib/persogem/prompts";
import { callPersoGemLLM, type ChatMessage } from "@/lib/persogem/client";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});

const bodySchema = z.object({
  mode: z.enum(["treinador", "sql", "duvidas"]).default("duvidas"),
  messages: z.array(messageSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const parsed = await parseBody(req, bodySchema, "POST /api/persogem/chat");
  if (!parsed.success) return parsed.response;

  const { mode, messages } = parsed.data;
  const systemPrompt = loadPersoGemPrompt(mode as PersoGemMode);

  const sessionHint =
    mode === "sql"
      ? `\n\n## Sessão atual do app\n- Usuário logado: ${user.name} (${user.email})\n- User.id da sessão: \`${user.id}\`\n- Preferir JSON estruturado para o app gravar sozinho; SQL só se pedido explicitamente.\n`
      : mode === "treinador"
        ? `\n\n## Sessão atual\n- Aluno logado: ${user.name}. Ao finalizar a ficha, oriente a usar **Salvar no app** (o ID já está na sessão).\n`
        : "";

  const llmMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt + sessionHint },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const reply = await callPersoGemLLM(llmMessages);
    return NextResponse.json({
      reply,
      mode,
      sessionUserId: user.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    logger.warn("PersoGem chat falhou", { route: "POST /api/persogem/chat", error: msg });

    if (msg.includes("API key")) {
      return NextResponse.json(
        {
          error:
            "PersoGem ainda não configurado. Defina GROQ_API_KEY (ou OPENAI_API_KEY) no ambiente.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Não consegui responder agora. Tente de novo em instantes." },
      { status: 502 }
    );
  }
}
