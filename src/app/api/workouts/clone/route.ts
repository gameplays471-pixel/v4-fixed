import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, notFound, requireUser, withErrorHandling } from "@/lib/api-error";

// Clona um treino compartilhado (via link público /w/[slug]) pra dentro da
// conta do usuário logado — copia nome/config e todos os exercícios com seus
// alvos (sets/reps/descanso/duração/distância/intensidade). O treino
// original nunca é alterado; a cópia é 100% independente a partir daqui.
export const POST = withErrorHandling("Clone shared workout", async (req: NextRequest) => {
  const user = await requireUser(req);

  const body = await req.json().catch(() => ({}));
  const { slug } = body;
  if (!slug || typeof slug !== "string") {
    throw badRequest("Link de compartilhamento inválido");
  }

  const source = await db.workout.findUnique({
    where: { shareSlug: slug },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  if (!source) throw notFound("Treino não encontrado ou link inválido");

  const cloned = await db.$transaction(async (tx) => {
    const workout = await tx.workout.create({
      data: {
        userId: user.id,
        name: source.name,
        description: source.description,
        defaultRest: source.defaultRest,
        color: source.color,
        // shareSlug propositalmente omitido: a cópia é privada até o
        // próprio usuário decidir compartilhá-la de novo.
      },
    });

    if (source.exercises.length > 0) {
      await tx.workoutExercise.createMany({
        data: source.exercises.map((ex) => ({
          workoutId: workout.id,
          exerciseId: ex.exerciseId,
          order: ex.order,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          targetDurationSec: ex.targetDurationSec,
          targetDistanceKm: ex.targetDistanceKm,
          targetIntensity: ex.targetIntensity,
        })),
      });
    }

    return tx.workout.findUnique({
      where: { id: workout.id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    });
  });

  return NextResponse.json({ workout: cloned });
});
