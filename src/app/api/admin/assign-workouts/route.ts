import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, notFound, requireAdmin, withErrorHandling } from "@/lib/api-error";
import { z } from "zod";
import { parseBody } from "@/lib/validation";
import { recordAudit } from "@/lib/audit-log";

const assignSchema = z.object({
  userId: z.string().trim().min(1, "Usuário é obrigatório"),
  templateIds: z.array(z.string().trim().min(1)).min(1, "Selecione ao menos um treino").max(20),
});

/**
 * Atribui um ou mais templates de treino a um usuário: clona cada template
 * para a conta do aluno (isTemplate=false). O original permanece intacto
 * e editável no painel.
 */
export const POST = withErrorHandling("Admin: assign workouts to user", async (req: NextRequest) => {
  const admin = await requireAdmin(req);

  const parsed = await parseBody(req, assignSchema, "POST /api/admin/assign-workouts");
  if (!parsed.success) return parsed.response;
  const { userId, templateIds } = parsed.data;

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, disabled: true },
  });
  if (!targetUser) throw notFound("Usuário não encontrado");
  if (targetUser.disabled) throw badRequest("Usuário está desativado");

  const templates = await db.workout.findMany({
    where: { id: { in: templateIds }, isTemplate: true },
    include: { exercises: { orderBy: { order: "asc" } } },
  });

  if (templates.length === 0) throw notFound("Nenhum template válido encontrado");
  if (templates.length !== templateIds.length) {
    throw badRequest("Um ou mais templates não foram encontrados");
  }

  const assigned = await db.$transaction(async (tx) => {
    const results: Array<{
      id: string;
      name: string;
      fromTemplateId: string;
      exerciseCount: number;
    }> = [];
    for (const source of templates) {
      const workout = await tx.workout.create({
        data: {
          userId: targetUser.id,
          name: source.name,
          description: source.description,
          defaultRest: source.defaultRest,
          color: source.color,
          isTemplate: false,
        },
      });

      if (source.exercises.length > 0) {
        await tx.workoutExercise.createMany({
          data: source.exercises.map((ex) => ({
            workoutId: workout.id,
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
        });
      }

      results.push({
        id: workout.id,
        name: workout.name,
        fromTemplateId: source.id,
        exerciseCount: source.exercises.length,
      });
    }
    return results;
  });

  await recordAudit({
    req,
    actorId: admin.id,
    actorEmail: admin.email,
    action: "create",
    entityType: "workout_assignment",
    entityId: targetUser.id,
    after: {
      userId: targetUser.id,
      userName: targetUser.name,
      assigned: assigned.map((a) => a.name),
    },
  });

  return NextResponse.json({
    ok: true,
    user: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
    assigned,
  });
});
