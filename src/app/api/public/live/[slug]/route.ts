import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, withErrorHandling } from "@/lib/api-error";

// Prévia pública (sem autenticação) do progresso ao vivo de um treino.
// Pensada pra ser consultada por polling a cada poucos segundos — por isso
// devolve só o essencial (nome de quem treina, nada pessoal como e-mail).
export const GET = withErrorHandling<{ params: Promise<{ slug: string }> }>(
  "Get live workout snapshot",
  async (_req: NextRequest, { params }) => {
    const { slug } = await params;

    const live = await db.liveWorkoutSession.findUnique({
      where: { slug },
      include: { user: { select: { name: true } } },
    });

    if (!live) throw notFound("Essa transmissão terminou ou o link não é mais válido");

    let snapshot: unknown = {};
    try {
      snapshot = JSON.parse(live.snapshot);
    } catch {
      snapshot = {};
    }

    return NextResponse.json({
      workoutName: live.workoutName,
      ownerName: live.user.name,
      startedAt: live.startedAt,
      updatedAt: live.updatedAt,
      snapshot,
    });
  }
);
