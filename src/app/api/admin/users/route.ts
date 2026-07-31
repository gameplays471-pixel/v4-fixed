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

    const [total, users] = await Promise.all([
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
          _count: { select: { workouts: true, sessions: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const ids = users.map((u) => u.id);

    const [sessionAggs, prCountsByUser] = ids.length
      ? await Promise.all([
          db.workoutSession.groupBy({
            by: ["userId"],
            where: { userId: { in: ids } },
            _sum: { totalVolume: true, durationSec: true },
            _max: { startedAt: true },
          }),
          db.$queryRaw<Array<{ userId: string; count: bigint }>>`
            SELECT ws."userId", COUNT(DISTINCT ss."sessionId")::bigint as count
            FROM "SessionSet" ss
            JOIN "WorkoutSession" ws ON ws."id" = ss."sessionId"
            WHERE ss."isPR" = true
              AND ws."userId" IN (${Prisma.join(ids)})
            GROUP BY ws."userId"
          `,
        ])
      : [
          [] as Array<{
            userId: string;
            _sum: { totalVolume: number | null; durationSec: number | null };
            _max: { startedAt: Date | null };
          }>,
          [] as Array<{ userId: string; count: bigint }>,
        ];

    const sessMap = new Map(
      sessionAggs.map((r) => [
        r.userId,
        {
          totalVolume: r._sum.totalVolume ?? 0,
          totalDurationSec: r._sum.durationSec ?? 0,
          lastActiveAt: r._max.startedAt,
        },
      ])
    );
    const prMap = new Map(prCountsByUser.map((r) => [r.userId, Number(r.count)]));

    const items = users.map((user) => {
      const agg = sessMap.get(user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        disabled: user.disabled,
        disabledAt: user.disabledAt,
        createdAt: user.createdAt,
        avatarUrl: null as string | null,
        workoutCount: user._count.workouts,
        sessionCount: user._count.sessions,
        totalVolume: agg?.totalVolume ?? 0,
        totalDurationSec: agg?.totalDurationSec ?? 0,
        lastActiveAt: agg?.lastActiveAt ?? null,
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
