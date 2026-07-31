import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, requireAdmin, withErrorHandling } from "@/lib/api-error";
import { PRESET_WORKOUTS } from "@/lib/preset-workouts";
import { recordAudit } from "@/lib/audit-log";

/**
 * Cria (ou recria) os 8 treinos pré-setados de emagrecimento/hipertrofia
 * × homem/mulher × iniciante/intermediário.
 *
 * Body opcional: `{ force?: boolean }` — se true, apaga templates existentes
 * com as mesmas keys (nome) antes de recriar.
 */
export const POST = withErrorHandling("Admin: seed preset workout templates", async (req: NextRequest) => {
  const admin = await requireAdmin(req);

  const body = await req.json().catch(() => ({}));
  const force = Boolean(body?.force);

  const allSlugs = Array.from(new Set(PRESET_WORKOUTS.flatMap((w) => w.exercises.map((e) => e.slug))));
  const exercises = await db.exercise.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(exercises.map((e) => [e.slug, e.id]));

  const missing = allSlugs.filter((s) => !slugToId.has(s));
  if (missing.length > 0) {
    throw badRequest(`Exercícios não encontrados no banco (rode o seed de exercícios): ${missing.join(", ")}`);
  }

  const presetNames = PRESET_WORKOUTS.map((w) => w.name);
  const existing = await db.workout.findMany({
    where: { isTemplate: true, name: { in: presetNames } },
    select: { id: true, name: true },
  });

  if (existing.length > 0 && !force) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: `Já existem ${existing.length} templates pré-setados. Envie { "force": true } para recriar.`,
      existing: existing.map((e) => e.name),
    });
  }

  if (force && existing.length > 0) {
    await db.workout.deleteMany({ where: { id: { in: existing.map((e) => e.id) } } });
  }

  const created = [];
  for (const preset of PRESET_WORKOUTS) {
    const template = await db.workout.create({
      data: {
        userId: admin.id,
        name: preset.name,
        description: preset.description,
        defaultRest: preset.defaultRest,
        color: preset.color,
        isTemplate: true,
        templateGoal: preset.templateGoal,
        templateSex: preset.templateSex,
        templateLevel: preset.templateLevel,
        exercises: {
          create: preset.exercises.map((ex, i) => ({
            exerciseId: slugToId.get(ex.slug)!,
            order: i + 1,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            restSeconds: ex.restSeconds,
            notes: ex.notes ?? null,
            targetDurationSec: ex.targetDurationSec ?? null,
            targetDistanceKm: ex.targetDistanceKm ?? null,
            targetIntensity: ex.targetIntensity ?? null,
          })),
        },
      },
      include: { _count: { select: { exercises: true } } },
    });
    created.push({ id: template.id, name: template.name, exercises: template._count.exercises });
  }

  await recordAudit({
    req,
    actorId: admin.id,
    actorEmail: admin.email,
    action: "create",
    entityType: "workout_template",
    entityId: "seed",
    after: { count: created.length, names: created.map((c) => c.name) },
  });

  return NextResponse.json({ ok: true, created }, { status: 201 });
});
