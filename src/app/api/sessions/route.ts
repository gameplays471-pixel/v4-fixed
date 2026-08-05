import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateSessionSchema, parseBody } from "@/lib/schemas";

const MAX_LIMIT = 200;

// Listar sessões do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ sessions: [] });
    }

    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    // Limita entre 1 e MAX_LIMIT para evitar queries sem controle
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 50 : rawLimit), MAX_LIMIT);

    const sessions = await db.workoutSession.findMany({
      where: { userId: user.id },
      include: {
        sets: true,
        workout: true,
      },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ sessions });
  } catch (e) {
    console.error("Get sessions error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Criar nova sessão (finalizar treino)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = parseBody(CreateSessionSchema, body);
    if (!parsed.success) return parsed.response;
    const { workoutId, workoutName, startedAt, endedAt, durationSec, sets, notes } = parsed.data;

    let totalVolume = 0;
    for (const s of sets) {
      totalVolume += s.weight * s.reps;
    }

    // Detectar PRs — consulta o maior peso já registrado para o mesmo exercício
    const prUpdates: Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      reps: number;
      restSeconds: number;
      isPR: boolean;
    }> = [];

    for (const s of sets) {
      const previousMax = await db.sessionSet.findFirst({
        where: {
          exerciseId: s.exerciseId,
          session: { userId: user.id },
        },
        orderBy: { weight: "desc" },
        select: { weight: true },
      });

      const isNewPR = !previousMax || s.weight > previousMax.weight;
      prUpdates.push({
        exerciseId: s.exerciseId,
        exerciseName: s.exerciseName,
        weight: s.weight,
        reps: s.reps,
        restSeconds: s.restSeconds,
        isPR: isNewPR,
      });
    }

    const session = await db.workoutSession.create({
      data: {
        userId: user.id,
        workoutId: workoutId ?? null,
        workoutName,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        durationSec,
        totalVolume,
        notes: notes ?? null,
        sets: {
          create: prUpdates.map((s, i) => ({
            exerciseId: s.exerciseId,
            exerciseName: s.exerciseName,
            setNumber: i + 1,
            weight: s.weight,
            reps: s.reps,
            restSeconds: s.restSeconds,
          })),
        },
      },
      include: { sets: true },
    });

    // Marcar PRs nas sets criadas
    for (let i = 0; i < prUpdates.length; i++) {
      if (prUpdates[i].isPR) {
        await db.sessionSet.update({
          where: { id: session.sets[i].id },
          data: { isPR: true },
        });
      }
    }

    return NextResponse.json({ session });
  } catch (e) {
    console.error("Create session error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
