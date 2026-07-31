import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireAdmin, withErrorHandling } from "@/lib/api-error";
import { parseBody, workoutSchema } from "@/lib/validation";
import { z } from "zod";
import { recordAudit } from "@/lib/audit-log";

const templateMetaSchema = z.object({
  templateGoal: z.enum(["emagrecimento", "hipertrofia"]).optional().nullable(),
  templateSex: z.enum(["M", "F"]).optional().nullable(),
  templateLevel: z.enum(["iniciante", "intermediario"]).optional().nullable(),
});

const updateTemplateSchema = workoutSchema.merge(templateMetaSchema).partial();

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: get workout template",
  async (req, { params }) => {
    await requireAdmin(req);
    const { id } = await params;

    const template = await db.workout.findFirst({
      where: { id, isTemplate: true },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      },
    });
    if (!template) throw notFound("Template não encontrado");

    return NextResponse.json({ template });
  }
);

export const PUT = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: update workout template",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const existing = await db.workout.findFirst({
      where: { id, isTemplate: true },
      include: { exercises: true },
    });
    if (!existing) throw notFound("Template não encontrado");

    const parsed = await parseBody(req, updateTemplateSchema, "PUT /api/admin/workout-templates/[id]");
    if (!parsed.success) return parsed.response;
    const body = parsed.data;

    const template = await db.$transaction(async (tx) => {
      if (body.exercises) {
        await tx.workoutExercise.deleteMany({ where: { workoutId: id } });
        if (body.exercises.length > 0) {
          await tx.workoutExercise.createMany({
            data: body.exercises.map((ex, i) => ({
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
      }

      return tx.workout.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.description !== undefined ? { description: body.description || null } : {}),
          ...(body.defaultRest !== undefined ? { defaultRest: body.defaultRest } : {}),
          ...(body.color !== undefined ? { color: body.color || null } : {}),
          ...(body.templateGoal !== undefined ? { templateGoal: body.templateGoal } : {}),
          ...(body.templateSex !== undefined ? { templateSex: body.templateSex } : {}),
          ...(body.templateLevel !== undefined ? { templateLevel: body.templateLevel } : {}),
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
      entityType: "workout_template",
      entityId: id,
      before: { name: existing.name },
      after: { name: template.name },
    });

    return NextResponse.json({ template });
  }
);

export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: delete workout template",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const existing = await db.workout.findFirst({
      where: { id, isTemplate: true },
    });
    if (!existing) throw notFound("Template não encontrado");

    await db.workout.delete({ where: { id } });

    await recordAudit({
      req,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "delete",
      entityType: "workout_template",
      entityId: id,
      before: { name: existing.name },
    });

    return NextResponse.json({ ok: true });
  }
);
