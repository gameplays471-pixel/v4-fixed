import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, coachChatSchema, coachSaveWorkoutSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { streamGroqChat, consumeGroqStream, type GroqMessage } from "@/lib/groq";
import {
  DUVIDAS_SYSTEM_PROMPT,
  buildTreinadorSystemPrompt,
  PROPOSE_WORKOUT_TOOL,
  PROPOSE_WORKOUT_TOOL_NAME,
} from "@/lib/coach-prompts";

// Precisa do runtime Node (Prisma, streaming manual) — não roda em edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protege o consumo de créditos da Groq: um usuário não deveria mandar mais
// que ~30 mensagens em 10 minutos numa conversa normal com o coach.
const CHAT_RATE_LIMIT = { limit: 30, windowMs: 10 * 60 * 1000 };

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function buildExerciseCatalogText(): Promise<string> {
  const exercises = await db.exercise.findMany({
    select: { slug: true, name: true, muscleGroup: true, category: true, equipmentType: true, level: true },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });

  if (exercises.length === 0) return "(nenhum exercício cadastrado no momento)";

  const byGroup = new Map<string, typeof exercises>();
  for (const ex of exercises) {
    const list = byGroup.get(ex.muscleGroup) || [];
    list.push(ex);
    byGroup.set(ex.muscleGroup, list);
  }

  const lines: string[] = [];
  for (const [group, list] of byGroup) {
    lines.push(`### ${group}`);
    for (const ex of list) {
      lines.push(`- ${ex.name} → slug: \`${ex.slug}\` (${ex.category}${ex.equipmentType ? `, ${ex.equipmentType}` : ""}, ${ex.level})`);
    }
  }
  return lines.join("\n");
}

function buildKnownProfileText(user: {
  name: string;
  sex: string | null;
  birthDate: Date | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
}): string {
  const parts: string[] = [`- Nome: ${user.name}`];
  if (user.sex) parts.push(`- Sexo: ${user.sex}`);
  if (user.birthDate) {
    const ageMs = Date.now() - new Date(user.birthDate).getTime();
    const age = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    parts.push(`- Idade: ~${age} anos`);
  }
  if (user.weight) parts.push(`- Peso: ${user.weight} kg`);
  if (user.height) parts.push(`- Altura: ${user.height} cm`);
  if (user.goal) parts.push(`- Objetivo cadastrado no perfil: ${user.goal}`);
  return parts.join("\n");
}

export const POST = withErrorHandling("POST /api/coach/chat", async (req: NextRequest) => {
  const user = await requireUser(req);

  const rl = await checkRateLimit(`coach-chat:${user.id}`, CHAT_RATE_LIMIT);
  if (!rl.allowed) return rateLimitResponse(rl);

  const parsed = await parseBody(req, coachChatSchema, "POST /api/coach/chat");
  if (!parsed.success) return parsed.response;
  const { mode, messages } = parsed.data;

  let systemPrompt: string;
  let tools: typeof PROPOSE_WORKOUT_TOOL[] | undefined;

  if (mode === "treinador") {
    const [catalogText, fullUser] = await Promise.all([
      buildExerciseCatalogText(),
      db.user.findUnique({
        where: { id: user.id },
        select: { name: true, sex: true, birthDate: true, weight: true, height: true, goal: true },
      }),
    ]);
    systemPrompt = buildTreinadorSystemPrompt({
      exerciseCatalogText: catalogText,
      knownProfileText: fullUser ? buildKnownProfileText(fullUser) : undefined,
    });
    tools = [PROPOSE_WORKOUT_TOOL];
  } else {
    systemPrompt = DUVIDAS_SYSTEM_PROMPT;
    tools = undefined;
  }

  const groqMessages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content } as GroqMessage)),
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (chunk: string) => controller.enqueue(encoder.encode(chunk));

      try {
        const groqRes = await streamGroqChat({
          messages: groqMessages,
          tools,
          toolChoice: tools ? "auto" : undefined,
        });

        await consumeGroqStream(groqRes, {
          onTextDelta: (delta) => enqueue(sseEvent("text", { delta })),
          onToolCall: (call) => {
            if (call.name !== PROPOSE_WORKOUT_TOOL_NAME) return;
            try {
              const args = JSON.parse(call.arguments);
              const validated = coachSaveWorkoutSchema.safeParse(args);
              if (!validated.success) {
                logger.warn("POST /api/coach/chat — tool call inválida", {
                  userId: user.id,
                  issues: validated.error.issues,
                });
                return;
              }
              enqueue(sseEvent("workout_proposal", validated.data));
            } catch (e) {
              logger.warn("POST /api/coach/chat — falha ao parsear tool call", {
                userId: user.id,
                error: e instanceof Error ? e.message : String(e),
              });
            }
          },
        });

        enqueue(sseEvent("done", {}));
      } catch (e) {
        logger.error("POST /api/coach/chat — erro no streaming da Groq", {
          userId: user.id,
          error: e instanceof Error ? e.message : String(e),
        });
        enqueue(sseEvent("error", { message: "Não foi possível falar com o PersoGem agora. Tente de novo em instantes." }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});
