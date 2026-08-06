import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling, badRequest } from "@/lib/api-error";
import { parseBody, coachSaveWorkoutSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { COACH_COLOR_PALETTE } from "@/lib/coach-prompts";

// Limite generoso — normalmente é 1 chamada por ficha fechada com o coach,
// mas o aluno pode gerar/ajustar mais de uma vez na mesma sessão.
const SAVE_RATE_LIMIT = { limit: 15, windowMs: 10 * 60 * 1000 };

export const POST = withErrorHandling("POST /api/coach/save-workout", async (req: NextRequest) => {
  const user = await requireUser(req);

  const rl = await checkRateLimit(`coach-save:${user.id}`, SAVE_RATE_LIMIT);
  if (!rl.allowed) return rateLimitResponse(rl);

  const parsed = await parseBody(req, coachSaveWorkoutSchema, "POST /api/coach/save-workout");
  if (!parsed.success) return parsed.response;
  const { workouts } = parsed.data;

  // Resolve todos os slugs de uma vez só (evita N+1 queries por exercício).
  const allSlugs = Array.from(new Set(workouts.flatMap((w) => w.exercises.map((e) => e.slug))));
  const foundExercises = await db.exercise.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(foundExercises.map((e) => [e.slug, e.id]));

  const missingSlugs = allSlugs.filter((slug) => !slugToId.has(slug));
  if (missingSlugs.length > 0) {
    throw badRequest(
      `O PersoGem propôs exercício(s) que não existem mais no catálogo: ${missingSlugs.join(", ")}. Peça pra ele ajustar o treino.`
    );
  }

  const created = await db.$transaction(
    workouts.map((w, wi) =>
      db.workout.create({
        data: {
          userId: user.id,
          name: w.name,
          description: w.description || null,
          defaultRest: w.defaultRest ?? 90,
          color: w.color || COACH_COLOR_PALETTE[wi % COACH_COLOR_PALETTE.length],
          exercises: {
            create: w.exercises.map((ex, i) => ({
              exerciseId: slugToId.get(ex.slug)!,
              order: i + 1,
              targetSets: ex.targetSets ?? 3,
              targetReps: ex.targetReps ?? 10,
              restSeconds: ex.restSeconds ?? 90,
              notes: ex.notes || null,
              targetDurationSec: ex.targetDurationSec ?? null,
              targetDistanceKm: ex.targetDistanceKm ?? null,
              targetIntensity: ex.targetIntensity ?? null,
            })),
          },
        },
        include: { exercises: { include: { exercise: true } } },
      })
    )
  );

  return NextResponse.json({ workouts: created });
});
