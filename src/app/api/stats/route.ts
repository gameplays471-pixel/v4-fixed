import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Estatísticas do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ stats: null });
    }

    const sessions = await db.workoutSession.findMany({
      where: { userId: user.id },
      include: { sets: true },
      orderBy: { startedAt: "asc" },
    });

    const totalSessions = sessions.length;
    const totalVolume = sessions.reduce((acc, s) => acc + s.totalVolume, 0);
    const totalDuration = sessions.reduce((acc, s) => acc + s.durationSec, 0);
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    // Dias consecutivos
    const uniqueDates = new Set(
      sessions.map((s) => new Date(s.startedAt).toISOString().split("T")[0])
    );
    const sortedDates = Array.from(uniqueDates).sort().reverse();

    let streak = 0;
    let currentDate = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const sessionDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (i === 0 && diffDays > 1) break;
      if (i === 0 && diffDays === 0) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Volume por semana (últimas 8 semanas)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const recentSessions = sessions.filter((s) => s.startedAt >= eightWeeksAgo);

    const weeklyVolume: Array<{ week: string; volume: number; sessions: number }> = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7 - 6);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekSessions = recentSessions.filter((s) => {
        return s.startedAt >= weekStart && s.startedAt <= weekEnd;
      });

      weeklyVolume.push({
        week: `${weekStart.getDate().toString().padStart(2, "0")}/${(weekStart.getMonth() + 1).toString().padStart(2, "0")}`,
        volume: weekSessions.reduce((acc, s) => acc + s.totalVolume, 0),
        sessions: weekSessions.length,
      });
    }

    // Grupo muscular mais treinado - usar sets das sessões do usuário
    const muscleGroupCount: Record<string, number> = {};
    const exerciseCount: Record<string, number> = {};
    const allSetsData: Array<{ exerciseName: string; weight: number; reps: number; exercise: { muscleGroup: string } }> = [];

    for (const s of sessions) {
      const setsWithExercise = await db.sessionSet.findMany({
        where: { sessionId: s.id },
        include: { exercise: { select: { muscleGroup: true } } },
      });
      const seenExercises = new Set<string>();
      for (const set of setsWithExercise) {
        const mg = set.exercise.muscleGroup;
        if (!seenExercises.has(set.exerciseName)) {
          muscleGroupCount[mg] = (muscleGroupCount[mg] || 0) + 1;
          seenExercises.add(set.exerciseName);
        }
        exerciseCount[set.exerciseName] = (exerciseCount[set.exerciseName] || 0) + 1;
        allSetsData.push({
          exerciseName: set.exerciseName,
          weight: set.weight,
          reps: set.reps,
          exercise: set.exercise,
        });
      }
    }
    const topMuscleGroup = Object.entries(muscleGroupCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Exercício favorito (mais realizado)
    const favoriteExercise = Object.entries(exerciseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Recordes pessoais (por exercício)
    const allSets = allSetsData;

    const prsByExercise: Record<string, { weight: number; reps: number; volume: number }> = {};
    for (const set of allSets) {
      const name = set.exerciseName;
      if (!prsByExercise[name]) {
        prsByExercise[name] = {
          weight: set.weight,
          reps: set.reps,
          volume: set.weight * set.reps,
        };
      } else {
        prsByExercise[name].weight = Math.max(prsByExercise[name].weight, set.weight);
        prsByExercise[name].reps = Math.max(prsByExercise[name].reps, set.reps);
        prsByExercise[name].volume = Math.max(prsByExercise[name].volume, set.weight * set.reps);
      }
    }

    const records = Object.entries(prsByExercise)
      .map(([name, pr]) => ({ exercise: name, ...pr }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);

    // Heatmap (últimos 91 dias = 13 semanas)
    const heatmap: Array<{ date: string; sessions: number; volume: number }> = [];
    for (let i = 90; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const daySessions = sessions.filter(
        (s) => new Date(s.startedAt).toISOString().split("T")[0] === dateStr
      );
      heatmap.push({
        date: dateStr,
        sessions: daySessions.length,
        volume: daySessions.reduce((acc, s) => acc + s.totalVolume, 0),
      });
    }

    // Carga total levantada (todas as sessões)
    const totalWeightLifted = allSets.reduce((acc, s) => acc + s.weight * s.reps, 0);

    const stats = {
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
    };

    return NextResponse.json({ stats });
  } catch (e) {
    console.error("Get stats error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
