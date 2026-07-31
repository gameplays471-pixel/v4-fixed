import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireAdmin, withErrorHandling, badRequest } from "@/lib/api-error";
import { parseBody, workoutSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit-log";

/**
 * Admin edita a cópia de um treino do aluno (pós clonar-e-ajustar).
 * Não permite editar templates (isTemplate=true).
 */
export const PUT = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: update user workout copy",
  async (req: NextRequest, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const existing = await db.workout.findFirst({
      where: { id, isTemplate: false },
      include: { exercises: true },
    });
    if (!existing) throw notFound("Treino do aluno não encontrado");

    const parsed = await parseBody(req, workoutSchema.partial(), "PUT /api/admin/user-workouts/[id]");
    if (!parsed.success) return parsed.response;
    const data = parsed.data;

    const updated = await db.$transaction(async (tx) => {
      if (data.exercises) {
        await tx.workoutExercise.deleteMany({ where: { workoutId: id } });
        await tx.workoutExercise.createMany({
          data: data.exercises.map((ex, i) => ({
            workoutId: id,
            exerciseId: ex.exerciseId,
            order: i + 1,
            targetSets: ex.targetSets ?? 3,
            targetReps: ex.targetReps ?? 10,
            restSeconds: ex.restSeconds ?? 90,
            notes: ex.notes || null,
            targetDurationSec: ex.targetDurationSec ?? null,
            targetDistanceKm: ex.targetDistanceKm ?? null,
            targetIntensity: ex.targetIntensity ?? null,
          })),
        });
      }

      return tx.workout.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description || null } : {}),
          ...(data.defaultRest !== undefined ? { defaultRest: data.defaultRest } : {}),
          ...(data.color !== undefined ? { color: data.color || null } : {}),
        },
        include: {
          exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
        },
      });
    });

    await recordAudit({
      req,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "update",
      entityType: "user_workout",
      entityId: id,
      before: { name: existing.name, userId: existing.userId },
      after: { name: updated.name, userId: updated.userId },
    });

    return NextResponse.json({ workout: updated });
  }
);

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: get user workout copy",
  async (req, { params }) => {
    await requireAdmin(req);
    const { id } = await params;
    const workout = await db.workout.findFirst({
      where: { id, isTemplate: false },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!workout) throw notFound("Treino não encontrado");
    return NextResponse.json({ workout });
  }
);
