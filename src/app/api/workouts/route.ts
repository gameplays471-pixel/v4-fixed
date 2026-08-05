import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateWorkoutSchema, parseBody } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = parseBody(CreateWorkoutSchema, body);
    if (!parsed.success) return parsed.response;
    const { name, description, defaultRest, color, exercises } = parsed.data;

    const workout = await db.workout.create({
      data: {
        userId: user.id,
        name,
        description: description ?? null,
        defaultRest,
        color: color ?? null,
        exercises: {
          create: exercises.map((ex, i) => ({
            exerciseId: ex.exerciseId,
            order: i + 1,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            restSeconds: ex.restSeconds,
            notes: ex.notes ?? null,
          })),
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
