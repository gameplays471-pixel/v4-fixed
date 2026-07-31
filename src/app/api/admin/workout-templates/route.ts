import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withErrorHandling } from "@/lib/api-error";
import { parseBody, workoutSchema } from "@/lib/validation";
import { z } from "zod";
import { recordAudit } from "@/lib/audit-log";

const templateMetaSchema = z.object({
  templateGoal: z.enum(["emagrecimento", "hipertrofia"]).optional().nullable(),
  templateSex: z.enum(["M", "F"]).optional().nullable(),
  templateLevel: z.enum(["iniciante", "intermediario"]).optional().nullable(),
});

const createTemplateSchema = workoutSchema.merge(templateMetaSchema);

export const GET = withErrorHandling("Admin: list workout templates", async (req: NextRequest) => {
  await requireAdmin(req);

  const { searchParams } = new URL(req.url);
  const goal = searchParams.get("goal") || undefined;
  const sex = searchParams.get("sex") || undefined;
  const level = searchParams.get("level") || undefined;

  const templates = await db.workout.findMany({
    where: {
      isTemplate: true,
      ...(goal ? { templateGoal: goal } : {}),
      ...(sex ? { templateSex: sex } : {}),
      ...(level ? { templateLevel: level } : {}),
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { exercises: true } },
    },
    orderBy: [{ templateGoal: "asc" }, { templateSex: "asc" }, { templateLevel: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ templates });
});

export const POST = withErrorHandling("Admin: create workout template", async (req: NextRequest) => {
  const admin = await requireAdmin(req);

  const parsed = await parseBody(req, createTemplateSchema, "POST /api/admin/workout-templates");
  if (!parsed.success) return parsed.response;
  const { name, description, defaultRest, color, exercises, templateGoal, templateSex, templateLevel } =
    parsed.data;

  const template = await db.workout.create({
    data: {
      userId: admin.id,
      name,
      description: description || null,
      defaultRest: defaultRest ?? 90,
      color: color || null,
      isTemplate: true,
      templateGoal: templateGoal ?? null,
      templateSex: templateSex ?? null,
      templateLevel: templateLevel ?? null,
      exercises: {
        create: (exercises || []).map((ex, i) => ({
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
      },
    },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
    },
  });

  await recordAudit({
    req,
    actorId: admin.id,
    actorEmail: admin.email,
    action: "create",
    entityType: "workout_template",
    entityId: template.id,
    after: { name: template.name, templateGoal, templateSex, templateLevel },
  });

  return NextResponse.json({ template }, { status: 201 });
});
