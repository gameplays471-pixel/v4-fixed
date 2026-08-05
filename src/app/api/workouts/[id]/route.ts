import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { UpdateWorkoutSchema, parseBody } from "@/lib/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const workout = await db.workout.findFirst({
      where: { id, userId: user.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ workout });
  } catch (e) {
    console.error("Get workout error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = parseBody(UpdateWorkoutSchema, body);
    if (!parsed.success) return parsed.response;
    const { name, description, defaultRest, color, exercises } = parsed.data;

    const existing = await db.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    // Atualizar treino
    await db.workout.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        defaultRest,
        color: color ?? null,
      },
    });

    // Deletar exercícios antigos e recriar
    await db.workoutExercise.deleteMany({ where: { workoutId: id } });

    if (exercises.length > 0) {
      await db.workoutExercise.createMany({
        data: exercises.map((ex, i) => ({
          workoutId: id,
          exerciseId: ex.exerciseId,
          order: i + 1,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
          notes: ex.notes ?? null,
        })),
      });
    }

    const updated = await db.workout.findUnique({
      where: { id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ workout: updated });
  } catch (e) {
    console.error("Update workout error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    await db.workout.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete workout error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
