import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";

/** Lista planos do aluno com progresso da semana atual (seg–dom). */
export const GET = withErrorHandling("Get my plans", async (req: NextRequest) => {
  const user = await requireUser(req);

  const plans = await db.workoutPlan.findMany({
    where: { userId: user.id, isTemplate: false },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          workout: {
            select: {
              id: true,
              name: true,
              color: true,
              _count: { select: { sessions: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Início da semana (segunda 00:00)
  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const workoutIds = plans.flatMap((p) => p.items.map((i) => i.workoutId));
  const weekSessions =
    workoutIds.length === 0
      ? []
      : await db.workoutSession.findMany({
          where: {
            userId: user.id,
            workoutId: { in: workoutIds },
            startedAt: { gte: weekStart },
          },
          select: { workoutId: true, startedAt: true },
        });

  const doneWorkoutIds = new Set(
    weekSessions.map((s) => s.workoutId).filter(Boolean) as string[]
  );

  const result = plans.map((plan) => {
    const total = plan.items.length || 1;
    const completedThisWeek = plan.items.filter((i) => doneWorkoutIds.has(i.workoutId)).length;
    const percent = Math.round((completedThisWeek / total) * 100);

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      daysPerWeek: plan.daysPerWeek,
      templateGoal: plan.templateGoal,
      templateSex: plan.templateSex,
      templateLevel: plan.templateLevel,
      createdAt: plan.createdAt,
      progress: {
        completedThisWeek,
        totalDays: plan.items.length,
        percent,
        weekStart: weekStart.toISOString(),
      },
      items: plan.items.map((item) => ({
        id: item.id,
        order: item.order,
        label: item.label,
        suggestedWeekday: item.suggestedWeekday,
        workoutId: item.workoutId,
        workoutName: item.workout.name,
        workoutColor: item.workout.color,
        totalSessions: item.workout._count.sessions,
        doneThisWeek: doneWorkoutIds.has(item.workoutId),
      })),
    };
  });

  return NextResponse.json({ plans: result });
});
