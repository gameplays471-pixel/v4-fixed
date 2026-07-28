import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, workoutSchema } from "@/lib/validation";

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Get workout",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);

    const { id } = await params;
    const workout = await db.workout.findFirst({
      where: { id, userId: user.id },
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

    const existing = await db.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      throw notFound("Treino não encontrado");
    }

    const parsed = await parseBody(req, workoutSchema, "POST/PUT /api/workouts");
    if (!parsed.success) return parsed.response;
    const { name, description, defaultRest, color, exercises } = parsed.data;

    // Atualizar treino + recriar exercícios numa única transação: antes
    // eram 3 chamadas separadas (update, deleteMany, createMany). Se o
    // createMany falhasse (ex.: um exerciseId inválido que a validação de
    // shape não pega, pois só checa "string não-vazia", não se o exercício
    // existe — violação de FK), o deleteMany anterior já tinha apagado os
    // exercícios antigos, e o treino ficava salvo sem NENHUM exercício,
    // sem rollback possível. A transação garante tudo-ou-nada.
    const updated = await db.$transaction(async (tx) => {
      await tx.workout.update({
        where: { id },
        data: {
          name,
          description: description || null,
          defaultRest: defaultRest ?? 90,
          color: color || null,
        },
      });

      await tx.workoutExercise.deleteMany({ where: { workoutId: id } });

      if (exercises && exercises.length > 0) {
        await tx.workoutExercise.createMany({
          data: exercises.map((ex, i) => ({
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
          })),
        });
      }

      return tx.workout.findUnique({
        where: { id },
        include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
      });
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
