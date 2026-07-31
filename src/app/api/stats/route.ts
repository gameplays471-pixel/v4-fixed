import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-error";

/** Stats via agregações SQL — não carrega o histórico inteiro na memória. */
export const GET = withErrorHandling("Get stats", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ stats: null });
  }

  const userId = user.id;

  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const heatmapStart = new Date(now);
  heatmapStart.setDate(heatmapStart.getDate() - 90);
  heatmapStart.setHours(0, 0, 0, 0);

  type HeatmapRow = { day: Date; sessions: number; volume: number };
  type DayRow = { day: Date };
  type ExerciseAggRow = {
    exerciseName: string;
    max_weight: number;
    max_reps: number;
    max_volume: number;
    total_volume: number;
    set_count: number;
  };
  type MuscleRow = { muscleGroup: string; c: number };

  const [sessionAgg, weeklyAgg, heatmapRows, distinctDays, exerciseAggs, topMuscleRows] =
    await Promise.all([
      db.workoutSession.aggregate({
        where: { userId },
        _count: { _all: true },
        _sum: { totalVolume: true, durationSec: true },
      }),
      db.workoutSession.aggregate({
        where: { userId, startedAt: { gte: weekStart } },
        _sum: { totalVolume: true },
      }),
      db.$queryRaw<HeatmapRow[]>`
        SELECT
          date_trunc('day', "startedAt")::date AS day,
          COUNT(*)::int AS sessions,
          COALESCE(SUM("totalVolume"), 0)::float AS volume
        FROM "WorkoutSession"
        WHERE "userId" = ${userId}
          AND "startedAt" >= ${heatmapStart}
        GROUP BY 1
        ORDER BY 1
      `,
      db.$queryRaw<DayRow[]>`
        SELECT DISTINCT date_trunc('day', "startedAt")::date AS day
        FROM "WorkoutSession"
        WHERE "userId" = ${userId}
        ORDER BY 1 DESC
      `,
      db.$queryRaw<ExerciseAggRow[]>`
        SELECT
          ss."exerciseName" AS "exerciseName",
          MAX(ss.weight)::float AS max_weight,
          MAX(ss.reps)::int AS max_reps,
          MAX(ss.weight * ss.reps)::float AS max_volume,
          COALESCE(SUM(ss.weight * ss.reps), 0)::float AS total_volume,
          COUNT(*)::int AS set_count
        FROM "SessionSet" ss
        INNER JOIN "WorkoutSession" ws ON ws.id = ss."sessionId"
        WHERE ws."userId" = ${userId}
        GROUP BY ss."exerciseName"
      `,
      db.$queryRaw<MuscleRow[]>`
        SELECT
          e."muscleGroup" AS "muscleGroup",
          COUNT(DISTINCT ss."exerciseName")::int AS c
        FROM "SessionSet" ss
        INNER JOIN "WorkoutSession" ws ON ws.id = ss."sessionId"
        INNER JOIN "Exercise" e ON e.id = ss."exerciseId"
        WHERE ws."userId" = ${userId}
        GROUP BY e."muscleGroup"
        ORDER BY c DESC
        LIMIT 1
      `,
    ]);

  const totalSessions = sessionAgg._count._all;
  const totalVolume = sessionAgg._sum.totalVolume ?? 0;
  const totalDuration = sessionAgg._sum.durationSec ?? 0;
  const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
  const weeklyVolume = weeklyAgg._sum.totalVolume ?? 0;

  const daySet = new Set(
    distinctDays.map((d) => new Date(d.day).toISOString().split("T")[0])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

  let streak = 0;
  if (daySet.has(todayStr) || daySet.has(yesterdayStr)) {
    let checkDate = daySet.has(todayStr) ? new Date(today) : new Date(today.getTime() - 86400000);
    while (daySet.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  }

  const heatmapMap = new Map<string, { sessions: number; volume: number }>();
  for (const row of heatmapRows) {
    const key = new Date(row.day).toISOString().split("T")[0];
    heatmapMap.set(key, { sessions: Number(row.sessions), volume: Number(row.volume) });
  }

  const heatmap: Array<{ date: string; sessions: number; volume: number }> = [];
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const cell = heatmapMap.get(dateStr);
    heatmap.push({
      date: dateStr,
      sessions: cell?.sessions ?? 0,
      volume: cell?.volume ?? 0,
    });
  }

  const totalWeightLifted = exerciseAggs.reduce((acc, r) => acc + Number(r.total_volume), 0);
  const favoriteExercise =
    exerciseAggs.length === 0
      ? "-"
      : [...exerciseAggs].sort((a, b) => Number(b.set_count) - Number(a.set_count))[0].exerciseName;

  const records = [...exerciseAggs]
    .map((r) => ({
      exercise: r.exerciseName,
      weight: Number(r.max_weight),
      reps: Number(r.max_reps),
      volume: Number(r.max_volume),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  const topMuscleGroup = topMuscleRows[0]?.muscleGroup || "-";

  return NextResponse.json({
    stats: {
      totalSessions,
      totalVolume,
      totalWeightLifted,
      avgDuration,
      streak,
      weeklyVolume,
      topMuscleGroup,
      favoriteExercise,
      records,
      heatmap,
    },
  });
});
