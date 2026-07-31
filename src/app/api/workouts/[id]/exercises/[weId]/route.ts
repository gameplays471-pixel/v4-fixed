import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, substituteExerciseSchema } from "@/lib/validation";

/**
 * Substitui o exercício de UM item do treino (mantendo séries, reps,
 * descanso, notas etc. do slot), sem tocar nos demais exercícios nem
 * recriar os registros — diferente do PUT /api/workouts/[id], que
 * recria todos os WorkoutExercise (e portanto muda seus ids). Isso
 * importa porque essa rota também é chamada durante um treino ativo,
 * onde os ids dos exercícios já estão em uso como chave do progresso
 * (sets marcados, cronômetro etc.) — trocar o id no meio do treino
 * quebraria esse estado.
 *
 * Usada tanto no menu de treinos (adequar o treino à academia/gosto do
 * aluno antes de treinar) quanto no treino ativo (trocar na hora, se a
 * academia não tiver o equipamento).
 */
export const PATCH = withErrorHandling<{ params: Promise<{ id: string; weId: string }> }>(
  "Substitute workout exercise",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);
    const { id, weId } = await params;

    const workout = await db.workout.findFirst({ where: { id, userId: user.id } });
    if (!workout) throw notFound("Treino não encontrado");

    const workoutExercise = await db.workoutExercise.findFirst({ where: { id: weId, workoutId: id } });
    if (!workoutExercise) throw notFound("Exercício não encontrado neste treino");

    const parsed = await parseBody(req, substituteExerciseSchema, "PATCH /api/workouts/[id]/exercises/[weId]");
    if (!parsed.success) return parsed.response;
    const { exerciseId } = parsed.data;

    const newExercise = await db.exercise.findUnique({ where: { id: exerciseId } });
    if (!newExercise) throw notFound("Exercício não encontrado");

    const updated = await db.workoutExercise.update({
      where: { id: weId },
      data: { exerciseId },
      include: { exercise: true },
    });

    return NextResponse.json({ workoutExercise: updated });
  }
);
