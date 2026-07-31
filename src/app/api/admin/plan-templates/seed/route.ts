import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withErrorHandling, badRequest } from "@/lib/api-error";
import { PRESET_PLANS } from "@/lib/preset-plans";
import { PRESET_WORKOUTS } from "@/lib/preset-workouts";
import { recordAudit } from "@/lib/audit-log";

/**
 * Garante treinos-template existentes (via keys) e cria planos-template
 * de 3 dias apontando para eles.
 */
export const POST = withErrorHandling("Admin: seed plan templates", async (req: NextRequest) => {
  const admin = await requireAdmin(req);

  // Mapear key de workout → id do template no banco
  const workoutTemplates = await db.workout.findMany({
    where: { isTemplate: true },
    select: { id: true, name: true, templateGoal: true, templateSex: true, templateLevel: true },
  });

  const keyToWorkoutId = new Map<string, string>();
  for (const preset of PRESET_WORKOUTS) {
    const match = workoutTemplates.find(
      (w) =>
        w.templateGoal === preset.templateGoal &&
        w.templateSex === preset.templateSex &&
        w.templateLevel === preset.templateLevel
    );
    if (match) keyToWorkoutId.set(preset.key, match.id);
  }

  if (keyToWorkoutId.size === 0) {
    throw badRequest(
      "Nenhum treino-template encontrado. Crie os treinos pré-setados primeiro (Atribuição de treinos → Criar pré-setados)."
    );
  }

  const created: Array<{ id: string; name: string; days: number }> = [];
  const skipped: string[] = [];

  for (const plan of PRESET_PLANS) {
    const existing = await db.workoutPlan.findFirst({
      where: {
        isTemplate: true,
        templateGoal: plan.templateGoal,
        templateSex: plan.templateSex,
        templateLevel: plan.templateLevel,
        name: plan.name,
      },
    });
    if (existing) {
      skipped.push(plan.name);
      continue;
    }

    const dayWorkouts = plan.days.map((d) => {
      const wid = keyToWorkoutId.get(d.workoutKey);
      if (!wid) throw badRequest(`Treino-template ausente para key ${d.workoutKey}`);
      return { ...d, workoutId: wid };
    });

    const row = await db.workoutPlan.create({
      data: {
        userId: admin.id,
        name: plan.name,
        description: plan.description,
        daysPerWeek: plan.daysPerWeek,
        isTemplate: true,
        templateGoal: plan.templateGoal,
        templateSex: plan.templateSex,
        templateLevel: plan.templateLevel,
        items: {
          create: dayWorkouts.map((d) => ({
            order: d.order,
            label: d.label,
            suggestedWeekday: d.suggestedWeekday,
            workoutId: d.workoutId,
          })),
        },
      },
    });
    created.push({ id: row.id, name: row.name, days: plan.days.length });
  }

  await recordAudit({
    req,
    actorId: admin.id,
    actorEmail: admin.email,
    action: "create",
    entityType: "workout_plan_template",
    entityId: admin.id,
    after: { created: created.map((c) => c.name), skipped },
  });

  return NextResponse.json({ ok: true, created, skipped });
});
