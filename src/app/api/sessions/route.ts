import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, parseIntParam, sessionSchema } from "@/lib/validation";
import { suggestProgressions } from "@/lib/progression";

// Listagem leve: sem sets por padrão. Detalhe: GET /api/sessions/[id]
// Paginação por cursor: ?cursor=<startedAtISO>|<id>&limit=20
// Legado: ?includeSets=1
export const GET = withErrorHandling("Get sessions", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ sessions: [], nextCursor: null, hasMore: false });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseIntParam(searchParams.get("limit"), { default: 20, min: 1, max: 50 });
  const includeSets = searchParams.get("includeSets") === "1";
  const cursorRaw = searchParams.get("cursor");

  let cursorFilter: { startedAt: Date; id: string } | null = null;
  if (cursorRaw) {
    const sep = cursorRaw.indexOf("|");
    if (sep > 0) {
      const startedAt = new Date(cursorRaw.slice(0, sep));
      const id = cursorRaw.slice(sep + 1);
      if (!Number.isNaN(startedAt.getTime()) && id) {
        cursorFilter = { startedAt, id };
      }
    }
  }

  const include = includeSets
    ? {
        sets: {
          include: {
            exercise: {
              select: { muscleGroup: true, category: true, secondaryMuscles: true },
            },
          },
        },
        workout: { select: { id: true, color: true, name: true } },
        _count: { select: { sets: true } },
      }
    : {
        workout: { select: { id: true, color: true, name: true } },
        _count: { select: { sets: true } },
        // Só IDs de PR — payload leve para badge no histórico
        sets: { where: { isPR: true }, select: { id: true }, take: 1 },
      };

  const sessions = await db.workoutSession.findMany({
    where: {
      userId: user.id,
      ...(cursorFilter
        ? {
            OR: [
              { startedAt: { lt: cursorFilter.startedAt } },
              {
                startedAt: cursorFilter.startedAt,
                id: { lt: cursorFilter.id },
              },
            ],
          }
        : {}),
    },
    include,
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = sessions.length > limit;
  const page = hasMore ? sessions.slice(0, limit) : sessions;
  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last
      ? `${new Date(last.startedAt).toISOString()}|${last.id}`
      : null;

  const shaped = page.map((s) => {
    const { _count, sets, ...rest } = s as typeof s & {
      _count?: { sets: number };
      sets?: Array<{ id: string }>;
    };
    if (includeSets) {
      return { ...rest, sets, setCount: _count?.sets ?? (Array.isArray(sets) ? sets.length : 0) };
    }
    return {
      ...rest,
      setCount: _count?.sets ?? 0,
      hasPR: Array.isArray(sets) && sets.length > 0,
    };
  });

  return NextResponse.json({ sessions: shaped, nextCursor, hasMore });
});

export const POST = withErrorHandling("Create session", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, sessionSchema, "POST /api/sessions");
  if (!parsed.success) return parsed.response;
  const { workoutId, workoutName, startedAt, endedAt, durationSec, sets, notes } = parsed.data;

  let totalVolume = 0;
  for (const s of sets) {
    totalVolume += s.weight * s.reps;
  }

  // PR em 1 groupBy (antes: N findFirst) + isPR no create (sem loop de update)
  const strengthExerciseIds = Array.from(
    new Set(sets.filter((s) => s.durationSec == null).map((s) => s.exerciseId))
  );

  const previousMaxByExercise = new Map<string, number>();
  if (strengthExerciseIds.length > 0) {
    const grouped = await db.sessionSet.groupBy({
      by: ["exerciseId"],
      where: {
        exerciseId: { in: strengthExerciseIds },
        session: { userId: user.id },
      },
      _max: { weight: true },
    });
    for (const row of grouped) {
      previousMaxByExercise.set(row.exerciseId, row._max.weight ?? 0);
    }
  }

  const sessionMaxByExercise = new Map<string, number>();

  const setRows = sets.map((s, i) => {
    const isCardio = s.durationSec != null;
    let isPR = false;

    if (!isCardio) {
      const histMax = previousMaxByExercise.get(s.exerciseId) ?? 0;
      const sessionMax = sessionMaxByExercise.get(s.exerciseId) ?? histMax;
      if (s.weight > sessionMax) {
        isPR = true;
        sessionMaxByExercise.set(s.exerciseId, s.weight);
      } else {
        sessionMaxByExercise.set(s.exerciseId, Math.max(sessionMax, s.weight));
      }
    }

    return {
      exerciseId: s.exerciseId,
      exerciseName: s.exerciseName,
      setNumber: i + 1,
      weight: s.weight,
      reps: s.reps,
      rir: s.rir ?? null,
      restSeconds: s.restSeconds || 90,
      isPR,
      durationSec: s.durationSec ?? null,
      distanceKm: s.distanceKm ?? null,
      avgBpm: s.avgBpm ?? null,
      intensity: s.intensity ?? null,
    };
  });

  const session = await db.workoutSession.create({
    data: {
      userId: user.id,
      workoutId: workoutId || null,
      workoutName,
      startedAt,
      endedAt: endedAt || new Date(),
      durationSec: durationSec || 0,
      totalVolume,
      notes: notes || null,
      sets: { create: setRows },
    },
    include: { sets: true },
  });

  const progressions = suggestProgressions(
    setRows.map((s) => ({
      exerciseId: s.exerciseId,
      exerciseName: s.exerciseName,
      weight: s.weight,
      reps: s.reps,
      rir: s.rir,
      isPR: s.isPR,
      durationSec: s.durationSec,
    }))
  );

  return NextResponse.json({ session, progressions });
});
