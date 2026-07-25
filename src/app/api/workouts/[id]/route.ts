import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Get workout",
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    const workout = await db.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!workout) {
      throw notFound("Treino não encontrado");
    }

    return NextResponse.json({ workout });
  }
);

export const PUT = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Update workout",
  async (req, { params }) => {
    const user = await requireUser(req);

    const { id } = await params;
    const body = await req.json();
    const { name, description, defaultRest, color, exercises } = body;

    const existing = await db.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      throw notFound("Treino não encontrado");
    }

    // Atualizar treino
    await db.workout.update({
      where: { id },
      data: {
        name,
        description: description || null,
        defaultRest: defaultRest ?? 90,
        color: color || null,
      },
    });

    // Deletar exercícios antigos e recriar
    await db.workoutExercise.deleteMany({ where: { workoutId: id } });

    if (exercises && exercises.length > 0) {
      await db.workoutExercise.createMany({
        data: exercises.map(
          (ex: { exerciseId: string; targetSets: number; targetReps: number; restSeconds: number; notes?: string; targetDurationSec?: number; targetDistanceKm?: number; targetIntensity?: string }, i: number) => ({
            workoutId: id,
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
      });
    }

    const updated = await db.workout.findUnique({
      where: { id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ workout: updated });
  }
);

export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Delete workout",
  async (req, { params }) => {
    const user = await requireUser(req);

    const { id } = await params;
    const existing = await db.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      throw notFound("Treino não encontrado");
    }

    await db.workout.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
);
