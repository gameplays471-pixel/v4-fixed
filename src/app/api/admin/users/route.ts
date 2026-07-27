import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withErrorHandling } from "@/lib/api-error";
import { Prisma } from "@prisma/client";

export const GET = withErrorHandling(
  "Admin: list users",
  async (req: NextRequest) => {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) where.role = role;
    if (status === "active") where.disabled = false;
    else if (status === "disabled") where.disabled = true;

    const isMostActive = sort === "mostActive";

    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "name") orderBy = { name: "asc" };

    const [total, users, prCountsByUser] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: isMostActive ? undefined : orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          disabled: true,
          disabledAt: true,
          createdAt: true,
          avatarUrl: true,
          _count: { select: { workouts: true, sessions: true } },
          sessions: {
            select: { totalVolume: true, durationSec: true, startedAt: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      // Sessões que contêm pelo menos um PR — agrupa por userId
      db.$queryRaw<Array<{ userId: string; count: bigint }>>`
        `SELECT ws."userId", COUNT(DISTINCT ss."sessionId")::bigint as count
         FROM "SessionSet" ss
         JOIN "WorkoutSession" ws ON ws."id" = ss."sessionId"
         WHERE ss."isPR" = true
         GROUP BY ws."userId"`,
    ]);

    const prMap = new Map(prCountsByUser.map((r) => [r.userId, Number(r.count)]));

    const items = users.map((user) => {
      const sessions = user.sessions;
      const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
      const totalDurationSec = sessions.reduce((sum, s) => sum + s.durationSec, 0);
      const lastActiveAt =
        sessions.length > 0
          ? new Date(Math.max(...sessions.map((s) => new Date(s.startedAt).getTime())))
          : null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        disabled: user.disabled,
        disabledAt: user.disabledAt,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl,
        workoutCount: user._count.workouts,
        sessionCount: user._count.sessions,
        totalVolume,
        totalDurationSec,
        lastActiveAt,
        prCount: prMap.get(user.id) || 0,
      };
    });

    if (isMostActive) items.sort((a, b) => b.sessionCount - a.sessionCount);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  }
);
