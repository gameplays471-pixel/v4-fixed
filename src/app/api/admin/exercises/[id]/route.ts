import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, conflict, notFound, requireAdmin, withErrorHandling } from "@/lib/api-error";
import { parseBody, exerciseUpdateSchema } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import { recordAudit } from "@/lib/audit-log";

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: get exercise",
  async (req, { params }) => {
    await requireAdmin(req);
    const { id } = await params;

    const exercise = await db.exercise.findUnique({ where: { id } });
    if (!exercise) throw notFound("Exercício não encontrado");

    return NextResponse.json({ exercise });
  }
);

export const PUT = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: update exercise",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const before = await db.exercise.findUnique({ where: { id } });
    if (!before) throw notFound("Exercício não encontrado");

    const parsed = await parseBody(req, exerciseUpdateSchema, "PUT /api/admin/exercises/[id]");
    if (!parsed.success) return parsed.response;
    const data = parsed.data;

    // Se o nome mudou e nenhum slug explícito foi informado, regenera o
    // slug a partir do novo nome — mas só se realmente mudar, pra não
    // quebrar links/favoritos existentes à toa numa edição de outro campo.
    let slug = data.slug;
    if (!slug && data.name && data.name !== before.name) {
      slug = slugify(data.name);
    }
    if (slug && slug !== before.slug) {
      const clash = await db.exercise.findUnique({ where: { slug } });
      if (clash && clash.id !== id) {
        throw conflict(`Já existe um exercício com o slug "${slug}"`);
      }
    }

    if (Object.keys(data).length === 0 && !slug) {
      throw badRequest("Nenhum campo para atualizar");
    }

    const updated = await db.exercise.update({
      where: { id },
      data: { ...data, ...(slug ? { slug } : {}) },
    });

    await recordAudit({
      req,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "update",
      entityType: "exercise",
      entityId: id,
      before,
      after: updated,
    });

    return NextResponse.json({ exercise: updated });
  }
);

export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Admin: delete exercise",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const before = await db.exercise.findUnique({ where: { id } });
    if (!before) throw notFound("Exercício não encontrado");

    // Exercícios já usados em treinos/sessões têm FK sem cascade
    // (WorkoutExercise.exercise, SessionSet.exercise) — apagar deixaria
    // histórico órfão. Em vez de deixar o Postgres estourar um erro cru
    // de FK, checamos antes e damos uma mensagem que o admin entende.
    const [inWorkouts, inSessions] = await Promise.all([
      db.workoutExercise.count({ where: { exerciseId: id } }),
      db.sessionSet.count({ where: { exerciseId: id } }),
    ]);
    if (inWorkouts > 0 || inSessions > 0) {
      throw conflict(
        `Este exercício está em uso (${inWorkouts} treino(s), ${inSessions} série(s) registradas) e não pode ser excluído. Considere não usá-lo em novos treinos em vez de excluir.`
      );
    }

    await db.exercise.delete({ where: { id } });

    await recordAudit({
      req,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "delete",
      entityType: "exercise",
      entityId: id,
      before,
    });

    return NextResponse.json({ ok: true });
  }
);
