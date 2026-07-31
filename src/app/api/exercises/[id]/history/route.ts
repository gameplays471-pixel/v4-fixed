import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";

/**
 * Histórico de carga por exercício (máx peso e reps por dia).
 * Usado no gráfico "última vez" do histórico / detalhe.
 */
export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Get exercise history",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);
    const { id: exerciseId } = await params;

    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
      select: { id: true, name: true, muscleGroup: true },
    });
    if (!exercise) throw notFound("Exercício não encontrado");

    const { searchParams } = new URL(req.url);
    const days = Math.min(365, Math.max(14, parseInt(searchParams.get("days") || "90", 10) || 90));
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    type Row = {
      day: Date;
      max_weight: number;
      max_reps: number;
      volume: number;
      sets: number;
    };

    const rows = await db.$queryRaw<Row[]>`
      SELECT
        date_trunc('day', ws."startedAt")::date AS day,
        MAX(ss.weight)::float AS max_weight,
        MAX(ss.reps)::int AS max_reps,
        COALESCE(SUM(ss.weight * ss.reps), 0)::float AS volume,
        COUNT(*)::int AS sets
      FROM "SessionSet" ss
      INNER JOIN "WorkoutSession" ws ON ws.id = ss."sessionId"
      WHERE ws."userId" = ${user.id}
        AND ss."exerciseId" = ${exerciseId}
        AND ws."startedAt" >= ${since}
        AND ss."durationSec" IS NULL
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const history = rows.map((r) => ({
      date: new Date(r.day).toISOString().split("T")[0],
      maxWeight: Number(r.max_weight),
      maxReps: Number(r.max_reps),
      volume: Number(r.volume),
      sets: Number(r.sets),
    }));

    return NextResponse.json({
      exercise,
      history,
      days,
    });
  }
);
