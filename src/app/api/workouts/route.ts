import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, workoutSchema } from "@/lib/validation";

export const GET = withErrorHandling("Get workouts", async (req: NextRequest) => {
  const user = await requireUser(req);

  const workouts = await db.workout.findMany({
    // Templates do admin não aparecem na lista do usuário — só cópias atribuídas.
    where: { userId: user.id, isTemplate: false },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { sessions: true } },
    },
    // Ativos primeiro, depois finalizados; dentro de cada grupo, mais
    // recente primeiro. Front separa em abas usando o campo `active`.
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ workouts });
});

export const POST = withErrorHandling("Create workout", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, workoutSchema, "POST/PUT /api/workouts");
  if (!parsed.success) return parsed.response;
  const { name, description, defaultRest, color, exercises } = parsed.data;

  const workout = await db.workout.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      defaultRest: defaultRest ?? 90,
      color: color || null,
      exercises: {
        create: (exercises || []).map((ex, i) => ({
          exerciseId: ex.exerciseId,
          order: i + 1,
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
    include: { exercises: { include: { exercise: true } } },
  });

  return NextResponse.json({ workout });
});
