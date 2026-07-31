import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forbidden, notFound, requireUser, withErrorHandling } from "@/lib/api-error";
import { computeGameScore, getWeekRange } from "@/lib/gamification";
import { publicAvatarUrl } from "@/lib/avatar";

// GET /api/groups/[id]/ranking — ranking da semana atual (segunda a
// domingo) pros membros do grupo: treinos realizados, dias na dieta e
// dias com a meta de água batida. A meta de água usada pra cada membro é
// a meta dele próprio (cada um pode ter uma meta diferente).
export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Get group ranking",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);
    const { id } = await params;

    const group = await db.group.findUnique({ where: { id }, include: { members: { include: { user: true } } } });
    if (!group) throw notFound("Grupo não encontrado");
    if (!group.members.some((m) => m.userId === user.id)) throw forbidden("Você não faz parte desse grupo");

    const { start, end } = getWeekRange();
    const memberIds = group.members.map((m) => m.userId);

    const [workoutGroups, dailyLogs] = await Promise.all([
      db.workoutSession.groupBy({
        by: ["userId"],
        where: { userId: { in: memberIds }, startedAt: { gte: start, lte: end } },
        _count: { _all: true },
      }),
      db.dailyLog.findMany({ where: { userId: { in: memberIds }, date: { gte: start, lte: end } } }),
    ]);

    const workoutsByUser = new Map(workoutGroups.map((w) => [w.userId, w._count._all]));

    const ranking = group.members
      .map((m) => {
        const logs = dailyLogs.filter((l) => l.userId === m.userId);
        const dietDays = logs.filter((l) => l.dietOnTrack).length;
        const waterDays = logs.filter((l) => l.waterMl >= m.user.waterGoalMl).length;
        const workouts = workoutsByUser.get(m.userId) ?? 0;
        return {
          userId: m.userId,
          name: m.user.name,
          avatarUrl: publicAvatarUrl(m.user.avatarUrl),
          isYou: m.userId === user.id,
          workouts,
          dietDays,
          waterDays,
          score: computeGameScore({ workouts, dietDays, waterDays }),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return NextResponse.json({
      group: { id: group.id, name: group.name, inviteCode: group.inviteCode, isOwner: group.ownerId === user.id },
      week: { start: start.toISOString(), end: end.toISOString() },
      ranking,
    });
  }
);
