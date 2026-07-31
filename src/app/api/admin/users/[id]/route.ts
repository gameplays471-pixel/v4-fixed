import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  requireAdmin,
  badRequest,
  conflict,
  notFound,
  withErrorHandling,
} from "@/lib/api-error";
import { recordAudit } from "@/lib/audit-log";
import { publicAvatarUrl } from "@/lib/avatar";

export const GET = withErrorHandling<{
  params: Promise<{ id: string }> }>(
  "Admin: get user detail",
  async (req, { params }) => {
    await requireAdmin(req);
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        weight: true,
        height: true,
        sex: true,
        birthDate: true,
        goal: true,
        avatarUrl: true,
        role: true,
        disabled: true,
        disabledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw notFound("Usuário não encontrado");

    // Session pagination params
    const { searchParams } = new URL(req.url);
    const sessionPage =
      Math.max(1, parseInt(searchParams.get("sessionPage") || "1", 10) || 1);
    const sessionPageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("sessionPageSize") || "10", 10) || 10)
    );

    // Fetch all related data in parallel
    const [
      workouts,
      sessionCount,
      sessions,
      bodyWeightLogCount,
      progressPhotoCount,
      sessionAggregates,
      topExercises,
      streakData,
    ] = await Promise.all([
      // Workout list
      db.workout.findMany({
        where: { userId: id, isTemplate: false },
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),

      // Total session count (for pagination)
      db.workoutSession.count({ where: { userId: id } }),

      // Paginated session list
      db.workoutSession.findMany({
        where: { userId: id },
        select: {
          id: true,
          workoutName: true,
          startedAt: true,
          durationSec: true,
          totalVolume: true,
          endedAt: true,
        },
        orderBy: { startedAt: "desc" },
        skip: (sessionPage - 1) * sessionPageSize,
        take: sessionPageSize,
      }),

      // Body weight log count
      db.bodyWeightLog.count({ where: { userId: id } }),

      // Progress photo count
      db.progressPhoto.count({ where: { userId: id } }),

      // Session aggregates: avg duration, avg volume
      db.workoutSession.aggregate({
        where: { userId: id },
        _avg: { durationSec: true, totalVolume: true },
      }),

      // Top exercises by session count (favorite muscle group)
      db.sessionSet.groupBy({
        by: ["exerciseName"],
        where: { session: { userId: id } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),

      // Streak: count distinct days with at least one session
      db.workoutSession.findMany({
        where: { userId: id },
        select: {
          startedAt: true,
        },
        orderBy: { startedAt: "desc" },
      }),
    ]);

    // Compute streak days (consecutive days ending today or yesterday)
    let streakDays = 0;
    if (streakData.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daySet = new Set<string>();
      for (const s of streakData) {
        const d = new Date(s.startedAt);
        d.setHours(0, 0, 0, 0);
        daySet.add(d.toISOString());
      }

      // Start checking from today (or yesterday if no session today)
      let checkDate = new Date(today);
      const todayStr = today.toISOString();
      const yesterdayStr = new Date(today.getTime() - 86400000).toISOString();

      if (!daySet.has(todayStr) && !daySet.has(yesterdayStr)) {
        streakDays = 0;
      } else {
        if (!daySet.has(todayStr)) {
          checkDate = new Date(today.getTime() - 86400000);
        }
        while (daySet.has(checkDate.toISOString())) {
          streakDays++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        }
      }
    }


    // ── Relatório de negócio (aderência / volume / PRs) ─────────────────
    const weekStartReport = new Date();
    {
      const d = weekStartReport.getDay();
      const diff = d === 0 ? 6 : d - 1;
      weekStartReport.setDate(weekStartReport.getDate() - diff);
      weekStartReport.setHours(0, 0, 0, 0);
    }
    const monthStartReport = new Date();
    monthStartReport.setDate(1);
    monthStartReport.setHours(0, 0, 0, 0);

    const userWorkouts = await db.workout.findMany({
      where: { userId: id, isTemplate: false },
      select: { id: true },
    });
    const assignedWorkoutIds = userWorkouts.map((w) => w.id);

    const [weekAgg, sessionsThisWeekOnAssigned, prsThisMonth, plans] = await Promise.all([
      db.workoutSession.aggregate({
        where: { userId: id, startedAt: { gte: weekStartReport } },
        _sum: { totalVolume: true },
        _count: { _all: true },
      }),
      assignedWorkoutIds.length
        ? db.workoutSession.findMany({
            where: {
              userId: id,
              workoutId: { in: assignedWorkoutIds },
              startedAt: { gte: weekStartReport },
            },
            select: { workoutId: true },
            distinct: ["workoutId"],
          })
        : Promise.resolve([] as { workoutId: string | null }[]),
      db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "SessionSet" ss
        INNER JOIN "WorkoutSession" ws ON ws.id = ss."sessionId"
        WHERE ws."userId" = ${id}
          AND ss."isPR" = true
          AND ws."startedAt" >= ${monthStartReport}
      `,
      db.workoutPlan.findMany({
        where: { userId: id, isTemplate: false },
        include: {
          items: { select: { workoutId: true } },
        },
      }).catch(() => [] as Array<{ id: string; name: string; items: { workoutId: string }[] }>),
    ]);

    const assignedCount = assignedWorkoutIds.length;
    const doneAssignedThisWeek = sessionsThisWeekOnAssigned.filter((s) => s.workoutId).length;
    const adherencePercent =
      assignedCount === 0
        ? 0
        : Math.min(100, Math.round((doneAssignedThisWeek / assignedCount) * 100));

    // Plano: % de dias do plano feitos nesta semana
    const planReports = await Promise.all(
      (plans as Array<{ id: string; name: string; items: { workoutId: string }[] }>).map(async (plan) => {
        const ids = plan.items.map((i) => i.workoutId);
        const done =
          ids.length === 0
            ? 0
            : (
                await db.workoutSession.findMany({
                  where: {
                    userId: id,
                    workoutId: { in: ids },
                    startedAt: { gte: weekStartReport },
                  },
                  distinct: ["workoutId"],
                  select: { workoutId: true },
                })
              ).length;
        return {
          id: plan.id,
          name: plan.name,
          totalDays: plan.items.length,
          doneThisWeek: done,
          percent: plan.items.length
            ? Math.min(100, Math.round((done / plan.items.length) * 100))
            : 0,
        };
      })
    );

    const report = {
      assignedWorkouts: assignedCount,
      doneAssignedThisWeek,
      adherencePercent,
      sessionsThisWeek: weekAgg._count._all,
      volumeThisWeek: weekAgg._sum.totalVolume ?? 0,
      prsThisMonth: Number(prsThisMonth[0]?.count ?? 0),
      weekStart: weekStartReport.toISOString(),
      monthStart: monthStartReport.toISOString(),
      plans: planReports,
    };


    return NextResponse.json({
      user: { ...user, avatarUrl: publicAvatarUrl(user.avatarUrl) },
      workouts,
      sessions: {
        items: sessions,
        total: sessionCount,
        page: sessionPage,
        totalPages: Math.ceil(sessionCount / sessionPageSize),
      },
      bodyWeightLogCount,
      progressPhotoCount,
      stats: {
        streakDays,
        avgDuration: sessionAggregates._avg.durationSec ?? 0,
        avgVolume: sessionAggregates._avg.totalVolume ?? 0,
        favoriteMuscleGroup:
          topExercises.length > 0 ? topExercises[0].exerciseName : null,
      },
      report,
    });
  }
);

export const PUT = withErrorHandling<{
  params: Promise<{ id: string }> }>(
  "Admin: update user",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const before = await db.user.findUnique({ where: { id } });
    if (!before) throw notFound("Usuário não encontrado");

    const body = await req.json();
    const { email, name, role, disabled } = body as {
      email?: string;
      name?: string;
      role?: string;
      disabled?: boolean;
    };

    // Build update data
    const data: Record<string, unknown> = {};

    if (email !== undefined) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) throw badRequest("E-mail não pode ser vazio");
      if (trimmed !== before.email) {
        const existing = await db.user.findUnique({
          where: { email: trimmed },
        });
        if (existing) throw conflict("Este e-mail já está em uso");
        data.email = trimmed;
      }
    }

    if (name !== undefined) {
      const trimmed = (name || "").trim();
      if (!trimmed) throw badRequest("Nome não pode ser vazio");
      data.name = trimmed;
    }

    if (role !== undefined) {
      if (!["user", "admin", "support"].includes(role)) {
        throw badRequest("Role inválido. Use: user, admin ou support");
      }
      data.role = role;
    }

    if (disabled !== undefined) {
      data.disabled = disabled;
      data.disabledAt = disabled ? new Date() : null;
    }

    if (Object.keys(data).length === 0) {
      throw badRequest("Nenhum campo para atualizar");
    }

    const after = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        disabled: true,
        disabledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await recordAudit({
      req,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "update",
      entityType: "user",
      entityId: id,
      before: {
        id: before.id,
        email: before.email,
        name: before.name,
        role: before.role,
        disabled: before.disabled,
        disabledAt: before.disabledAt,
      },
      after,
    });

    return NextResponse.json({ user: after });
  }
);
