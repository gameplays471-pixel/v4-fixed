import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ workouts: [] });
    }

    const workouts = await db.workout.findMany({
      where: { userId: user.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workouts });
  } catch (e) {
    console.error("Get workouts error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, defaultRest, color, exercises } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const workout = await db.workout.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        defaultRest: defaultRest ?? 90,
        color: color || null,
        exercises: {
          create: (exercises || []).map(
            (ex: { exerciseId: string; targetSets: number; targetReps: number; restSeconds: number; notes?: string }, i: number) => ({
              exerciseId: ex.exerciseId,
              order: i + 1,
              targetSets: ex.targetSets ?? 3,
              targetReps: ex.targetReps ?? 10,
              restSeconds: ex.restSeconds ?? 90,
              notes: ex.notes || null,
            })
          ),
        },
      },
      include: { exercises: { include: { exercise: true } } },
    });

    return NextResponse.json({ workout });
  } catch (e) {
    console.error("Create workout error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
