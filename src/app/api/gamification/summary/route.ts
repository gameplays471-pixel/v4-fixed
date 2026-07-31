import { isFeatureEnabled } from "@/lib/feature-flags";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { computeGameScore, getWeekRange, startOfDay } from "@/lib/gamification";

// GET /api/gamification/summary — progresso do dia + da semana atual para
// as metas do mini-game (água, dieta, treinos). Não depende de nenhum
// grupo; é o que alimenta a tela /jogo mesmo pra quem não faz parte de
// nenhum grupo ainda.
export const GET = withErrorHandling("Get gamification summary", async (req: NextRequest) => {
  const user = await requireUser(req);
  if (!isFeatureEnabled("gamification")) {
    return NextResponse.json({ enabled: false, disabledByFlag: true });
  }
  const { start, end } = getWeekRange();
  const today = startOfDay();

  const [todayLog, weekLogs, weekWorkouts] = await Promise.all([
    db.dailyLog.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    db.dailyLog.findMany({ where: { userId: user.id, date: { gte: start, lte: end } } }),
    db.workoutSession.findMany({
      where: { userId: user.id, startedAt: { gte: start, lte: end } },
      select: { id: true, startedAt: true },
    }),
  ]);

  const dietDays = weekLogs.filter((l) => l.dietOnTrack).length;
  const waterDays = weekLogs.filter((l) => l.waterMl >= user.waterGoalMl).length;
  const workouts = weekWorkouts.length;
  const workoutToday = weekWorkouts.some((s) => startOfDay(s.startedAt).getTime() === today.getTime());

  return NextResponse.json({
    enabled: user.gameEnabled,
    goals: { waterGoalMl: user.waterGoalMl, weeklyWorkoutGoal: user.weeklyWorkoutGoal },
    today: {
      dietOnTrack: todayLog?.dietOnTrack ?? false,
      waterMl: todayLog?.waterMl ?? 0,
      workoutDone: workoutToday,
    },
    week: {
      start: start.toISOString(),
      end: end.toISOString(),
      workouts,
      dietDays,
      waterDays,
      score: computeGameScore({ workouts, dietDays, waterDays }),
    },
  });
});
