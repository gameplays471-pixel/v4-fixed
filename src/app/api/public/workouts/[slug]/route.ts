import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, withErrorHandling } from "@/lib/api-error";

// Prévia pública de um treino compartilhado — sem autenticação. Só expõe o
// necessário pra montar a prévia + permitir clonar (nome de quem criou,
// nunca e-mail ou qualquer outro dado pessoal).
export const GET = withErrorHandling<{ params: Promise<{ slug: string }> }>(
  "Get public workout",
  async (_req: NextRequest, { params }) => {
    const { slug } = await params;

    const workout = await db.workout.findUnique({
      where: { shareSlug: slug },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
        user: { select: { name: true } },
      },
    });

    if (!workout) throw notFound("Treino não encontrado ou link inválido");

    return NextResponse.json({
      workout: {
        id: workout.id,
        name: workout.name,
        description: workout.description,
        defaultRest: workout.defaultRest,
        color: workout.color,
        ownerName: workout.user.name,
        exercises: workout.exercises,
      },
    });
  }
);
