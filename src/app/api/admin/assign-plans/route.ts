import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, notFound, requireAdmin, withErrorHandling } from "@/lib/api-error";
import { z } from "zod";
import { parseBody } from "@/lib/validation";
import { recordAudit } from "@/lib/audit-log";

const schema = z.object({
  userId: z.string().trim().min(1),
  planTemplateIds: z.array(z.string().trim().min(1)).min(1).max(10),
});

/**
 * Atribui planos-template a um aluno:
 * - clona cada workout dos dias (isTemplate=false)
 * - cria WorkoutPlan do aluno com items apontando para os clones
 */
export const POST = withErrorHandling("Admin: assign plans", async (req: NextRequest) => {
  const admin = await requireAdmin(req);
  const parsed = await parseBody(req, schema, "POST /api/admin/assign-plans");
  if (!parsed.success) return parsed.response;
  const { userId, planTemplateIds } = parsed.data;

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, disabled: true },
  });
  if (!target) throw notFound("Usuário não encontrado");
  if (target.disabled) throw badRequest("Usuário está desativado");

  const templates = await db.workoutPlan.findMany({
    where: { id: { in: planTemplateIds }, isTemplate: true },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { workout: { include: { exercises: { orderBy: { order: "asc" } } } } },
      },
    },
  });
  if (templates.length === 0) throw notFound("Nenhum plano-template válido");
  if (templates.length !== planTemplateIds.length) {
    throw badRequest("Um ou mais planos não foram encontrados");
  }

  const assigned = await db.$transaction(async (tx) => {
    const results: Array<{ id: string; name: string; days: number }> = [];

    for (const source of templates) {
      const clonedItemData: Array<{
        order: number;
        label: string;
        suggestedWeekday: number | null;
        workoutId: string;
      }> = [];

      for (const item of source.items) {
        const w = item.workout;
        const clone = await tx.workout.create({
          data: {
            userId: target.id,
            name: `${source.name} · ${item.label}`,
            description: w.description,
            defaultRest: w.defaultRest,
            color: w.color,
            isTemplate: false,
            exercises: {
              create: w.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                order: ex.order,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                restSeconds: ex.restSeconds,
                notes: ex.notes,
                targetDurationSec: ex.targetDurationSec,
                targetDistanceKm: ex.targetDistanceKm,
                targetIntensity: ex.targetIntensity,
              })),
            },
          },
        });
        clonedItemData.push({
          order: item.order,
          label: item.label,
          suggestedWeekday: item.suggestedWeekday,
          workoutId: clone.id,
        });
      }

      const plan = await tx.workoutPlan.create({
        data: {
          userId: target.id,
          name: source.name,
          description: source.description,
          daysPerWeek: source.daysPerWeek,
          isTemplate: false,
          templateGoal: source.templateGoal,
          templateSex: source.templateSex,
          templateLevel: source.templateLevel,
          fromTemplateId: source.id,
          items: { create: clonedItemData },
        },
      });

      results.push({ id: plan.id, name: plan.name, days: clonedItemData.length });
    }

    return results;
  });

  await recordAudit({
    req,
    actorId: admin.id,
    actorEmail: admin.email,
    action: "create",
    entityType: "workout_plan_assignment",
    entityId: target.id,
    after: { userId: target.id, plans: assigned.map((a) => a.name) },
  });

  return NextResponse.json({
    ok: true,
    user: { id: target.id, name: target.name, email: target.email },
    assigned,
  });
});
