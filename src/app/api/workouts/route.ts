import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling("Get workouts", async (req: NextRequest) => {
  const user = await requireUser(req);

  const workouts = await db.workout.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ workouts });
});

export const POST = withErrorHandling("Create workout", async (req: NextRequest) => {
  const user = await requireUser(req);

  const body = await req.json();
  const { name, description, defaultRest, color, exercises } = body;

  if (!name) {
    throw badRequest("Nome é obrigatório");
  }

  const workout = await db.workout.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      defaultRest: defaultRest ?? 90,
      color: color || null,
      exercises: {
        create: (exercises || []).map(
          (ex: { exerciseId: string; targetSets: number; targetReps: number; restSeconds: number; notes?: string; targetDurationSec?: number; targetDistanceKm?: number; targetIntensity?: string }, i: number) => ({
            exerciseId: ex.exerciseId,
            order: i + 1,
            targetSets: ex.targetSets ?? 3,
            targetReps: ex.targetReps ?? 10,
            restSeconds: ex.restSeconds ?? 90,
            notes: ex.notes || null,
            targetDurationSec: ex.targetDurationSec ?? null,
            targetDistanceKm: ex.targetDistanceKm ?? null,
            targetIntensity: ex.targetIntensity ?? null,
          })
        ),
      },
    },
    include: { exercises: { include: { exercise: true } } },
  });

  return NextResponse.json({ workout });
});
