import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, parseIntParam, sessionSchema } from "@/lib/validation";

// Listar sessões do usuário
export const GET = withErrorHandling("Get sessions", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ sessions: [] });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseIntParam(searchParams.get("limit"), { default: 50, min: 1, max: 200 });

  const sessions = await db.workoutSession.findMany({
    where: { userId: user.id },
    include: {
      sets: {
        include: {
          // Precisa pra montar o card de compartilhamento a partir do
          // histórico (agrupamento por músculo no manequim, detecção de
          // "Cardio") — o SessionSet por si só só guarda o nome do
          // exercício em texto, não o grupo muscular/categoria.
          exercise: { select: { muscleGroup: true, category: true, secondaryMuscles: true } },
        },
      },
      workout: true,
    },
    orderBy: { startedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ sessions });
});

// Criar nova sessão (finalizar treino)
export const POST = withErrorHandling("Create session", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, sessionSchema, "POST /api/sessions");
  if (!parsed.success) return parsed.response;
  const { workoutId, workoutName, startedAt, endedAt, durationSec, sets, notes } = parsed.data;

  let totalVolume = 0;
  for (const s of sets) {
    totalVolume += s.weight * s.reps;
  }

  // Detectar PRs
  const prUpdates: Array<{
    exerciseId: string;
    exerciseName: string;
    weight: number;
    reps: number;
    restSeconds: number;
    isPR: boolean;
    rir?: number | null;
    durationSec?: number | null;
    distanceKm?: number | null;
    avgBpm?: number | null;
    intensity?: string | null;
  }> = [];

  // Detectar PRs — consulta o maior peso já registrado para o mesmo exercício
  // pelo usuário atual (via relação session -> userId). Exercícios de cardio
  // (identificados pela presença de durationSec) não entram nessa comparação,
  // já que não fazem sentido como "recorde de peso".
  for (const s of sets) {
    const isCardio = s.durationSec != null;
    let isNewPR = false;

    if (!isCardio) {
      const previousMax = await db.sessionSet.findFirst({
        where: {
          exerciseId: s.exerciseId,
          session: { userId: user.id },
        },
        orderBy: { weight: "desc" },
        select: { weight: true },
      });
      isNewPR = !previousMax || s.weight > previousMax.weight;
    }

    prUpdates.push({
      exerciseId: s.exerciseId,
      exerciseName: s.exerciseName,
      weight: s.weight,
      reps: s.reps,
      restSeconds: s.restSeconds || 90,
      isPR: isNewPR,
      rir: s.rir,
      durationSec: s.durationSec,
      distanceKm: s.distanceKm,
      avgBpm: s.avgBpm,
      intensity: s.intensity,
    });
  }

  const session = await db.workoutSession.create({
    data: {
      userId: user.id,
      workoutId: workoutId || null,
      workoutName,
      startedAt,
      endedAt: endedAt || new Date(),
      durationSec: durationSec || 0,
      totalVolume,
      notes: notes || null,
      sets: {
        create: prUpdates.map((s, i) => ({
          exerciseId: s.exerciseId,
          exerciseName: s.exerciseName,
          setNumber: i + 1,
          weight: s.weight,
          reps: s.reps,
          rir: s.rir ?? null,
          restSeconds: s.restSeconds || 90,
          durationSec: s.durationSec ?? null,
          distanceKm: s.distanceKm ?? null,
          avgBpm: s.avgBpm ?? null,
          intensity: s.intensity ?? null,
        })),
      },
    },
    include: { sets: true },
  });

  // Marcar PRs nas sets criadas
  for (let i = 0; i < prUpdates.length; i++) {
    if (prUpdates[i].isPR) {
      await db.sessionSet.update({
        where: { id: session.sets[i].id },
        data: { isPR: true },
      });
    }
  }

  return NextResponse.json({ session });
});
