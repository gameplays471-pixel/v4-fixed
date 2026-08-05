import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseBody } from "@/lib/validation";
import { loadPersoGemPrompt } from "@/lib/persogem/prompts";
import {
  callPersoGemLLM,
  extractJsonObject,
  type ChatMessage,
} from "@/lib/persogem/client";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 90;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});

const exerciseInSchema = z.object({
  slug: z.string().trim().min(1).max(150),
  targetSets: z.coerce.number().int().positive().max(50).optional(),
  targetReps: z.coerce.number().int().positive().max(2000).optional(),
  restSeconds: z.coerce.number().int().nonnegative().max(3600).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
  targetDurationSec: z.coerce.number().int().positive().max(86400).optional().nullable(),
  targetDistanceKm: z.coerce.number().positive().max(1000).optional().nullable(),
  targetIntensity: z.string().trim().max(50).optional().nullable(),
});

const workoutInSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional().nullable(),
  defaultRest: z.coerce.number().int().nonnegative().max(3600).optional(),
  color: z.string().trim().max(30).optional().nullable(),
  exercises: z.array(exerciseInSchema).min(1).max(40),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(50).optional(),
  payload: z
    .object({
      workouts: z.array(workoutInSchema).min(1).max(14),
    })
    .optional(),
});

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

async function resolveWorkoutsFromChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userId: string
) {
  const system =
    loadPersoGemPrompt("sql") +
    `\n\n## Tarefa agora\nCom base no histórico, devolva APENAS um JSON no formato { "workouts": [ ... ] } ` +
    `usando só slugs da lista. User.id da sessão (não precisa no JSON): ${userId}. Sem SQL.`;

  const llmMessages: ChatMessage[] = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content:
        'Com base no treino discutido acima, gere agora o JSON final { "workouts": [...] } para gravar no GEMgym. Só o JSON.',
    },
  ];

  const reply = await callPersoGemLLM(llmMessages, { temperature: 0.3, maxTokens: 4096 });
  const raw = extractJsonObject(reply);
  const parsed = z
    .object({ workouts: z.array(workoutInSchema).min(1).max(14) })
    .safeParse(raw);
  if (!parsed.success) {
    throw new Error("JSON de treinos inválido gerado pelo modelo");
  }
  return parsed.data.workouts;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const parsed = await parseBody(req, bodySchema, "POST /api/persogem/apply-workout");
  if (!parsed.success) return parsed.response;

  try {
    let workouts = parsed.data.payload?.workouts;
    if (!workouts?.length) {
      if (!parsed.data.messages?.length) {
        return NextResponse.json(
          { error: "Envie o histórico do chat ou um payload.workouts" },
          { status: 400 }
        );
      }
      workouts = await resolveWorkoutsFromChat(parsed.data.messages, user.id);
    }

    const allSlugs = [...new Set(workouts.flatMap((w) => w.exercises.map((e) => e.slug)))];
    const exercises = await db.exercise.findMany({
      where: { slug: { in: allSlugs } },
      select: { id: true, slug: true, name: true },
    });
    const bySlug = new Map(exercises.map((e) => [e.slug, e]));

    const missing = allSlugs.filter((s) => !bySlug.has(s));
    if (missing.length) {
      return NextResponse.json(
        {
          error: "Alguns exercícios não existem no banco",
          missingSlugs: missing,
        },
        { status: 422 }
      );
    }

    const created: Array<{
  id: string;
  name: string;
  exercises: unknown[];
  // add other fields you actually use if needed
}> = [];
    for (let i = 0; i < workouts.length; i++) {
      const w = workouts[i];
      const workout = await db.workout.create({
        data: {
          // Sempre da sessão — nunca confia em id vindo do cliente/LLM
          userId: user.id,
          name: w.name,
          description: w.description || null,
          defaultRest: w.defaultRest ?? 90,
          color: w.color || COLORS[i % COLORS.length],
          isTemplate: false,
          exercises: {
            create: w.exercises.map((ex, idx) => ({
              exerciseId: bySlug.get(ex.slug)!.id,
              order: idx + 1,
              targetSets: ex.targetSets ?? 3,
              targetReps: ex.targetReps ?? 10,
              restSeconds: ex.restSeconds ?? 90,
              notes: ex.notes || null,
              targetDurationSec: ex.targetDurationSec ?? null,
              targetDistanceKm: ex.targetDistanceKm ?? null,
              targetIntensity: ex.targetIntensity ?? null,
            })),
          },
        },
        include: {
          exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
        },
      });
      created.push(workout);
    }

    return NextResponse.json({
      ok: true,
      count: created.length,
      workouts: created.map((w) => ({
        id: w.id,
        name: w.name,
        exercises: w.exercises.length,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    logger.warn("PersoGem apply-workout falhou", {
      route: "POST /api/persogem/apply-workout",
      error: msg,
    });

    if (msg.includes("API key")) {
      return NextResponse.json(
        { error: "Configure GROQ_API_KEY para gerar a estrutura do treino." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Não foi possível gravar os treinos. " + msg },
      { status: 502 }
    );
  }
}
