import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-error";

// Estatísticas do usuário
export const GET = withErrorHandling("Get stats", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ stats: null });
  }

  const sessions = await db.workoutSession.findMany({
    where: { userId: user.id },
    include: {
      // `exercise` incluído aqui pra evitar N+1: antes, o bloco de
      // "grupo muscular mais treinado" fazia 1 query por sessão dentro de
      // um loop (`db.sessionSet.findMany` para cada `s of sessions`),
      // multiplicando o número de round-trips ao banco pelo número de
      // treinos do usuário. Trazendo `exercise` junto de uma vez só, o
      // mesmo resultado é obtido com uma única query.
      sets: { include: { exercise: { select: { muscleGroup: true } } } },
    },
    orderBy: { startedAt: "asc" },
  });

  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((acc, s) => acc + s.totalVolume, 0);
  const totalDuration = sessions.reduce((acc, s) => acc + s.durationSec, 0);
  const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Dias consecutivos
  //
  // BUG CORRIGIDO: a versão anterior comparava `currentDate` (com a hora
  // atual, ex. 14h32) contra `sessionDate` (sempre meia-noite, vindo de uma
  // string "YYYY-MM-DD"). Misturar datas "com hora" e "à meia-noite" no
  // Math.floor(diff / 86400000) dava diffDays errado na maior parte do dia,
  // fazendo sequências reais sumirem e sequências quebradas serem contadas
  // como contínuas. A correção normaliza tudo pra meia-noite e caminha por
  // um Set de dias — mesma abordagem (correta) já usada em
  // src/app/api/admin/users/[id]/route.ts para o mesmo cálculo.
  const daySet = new Set(
    sessions.map((s) => new Date(s.startedAt).toISOString().split("T")[0])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

  let streak = 0;
  if (daySet.has(todayStr) || daySet.has(yesterdayStr)) {
    let checkDate = daySet.has(todayStr) ? today : new Date(today.getTime() - 86400000);
    while (daySet.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
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
    const setsWithExercise = s.sets;
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
});
