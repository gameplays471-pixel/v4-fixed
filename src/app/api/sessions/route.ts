import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Listar sessões do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ sessions: [] });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

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
    const { workoutId, workoutName, startedAt, endedAt, durationSec, sets, notes } = body;

    let totalVolume = 0;
    for (const s of sets || []) {
      totalVolume += (s.weight || 0) * (s.reps || 0);
    }

    // Detectar PRs
    const prUpdates: Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      reps: number;
      restSeconds: number;
      isPR: boolean;
      durationSec?: number;
      distanceKm?: number;
      avgBpm?: number;
      intensity?: string;
    }> = [];

    // Detectar PRs — consulta o maior peso já registrado para o mesmo exercício
    // pelo usuário atual (via relação session -> userId). Exercícios de cardio
    // (identificados pela presença de durationSec) não entram nessa comparação,
    // já que não fazem sentido como "recorde de peso".
    for (const s of sets || []) {
      const isCardio = s.durationSec != null;
      let isNewPR = false;

      if (!isCardio) {
        const previousMax = await db.sessionSet.findFirst({
          where: {
            exerciseId: s.exerciseId,
            session: { userId: user.id },
          },
          orderBy: { weight: "desc" },
          select: { weight: true },
        });
        isNewPR = !previousMax || s.weight > previousMax.weight;
      }

      prUpdates.push({
        exerciseId: s.exerciseId,
        exerciseName: s.exerciseName,
        weight: s.weight,
        reps: s.reps,
        restSeconds: s.restSeconds || 90,
        isPR: isNewPR,
        durationSec: s.durationSec,
        distanceKm: s.distanceKm,
        avgBpm: s.avgBpm,
        intensity: s.intensity,
      });
    }

    const session = await db.workoutSession.create({
      data: {
        userId: user.id,
        workoutId: workoutId || null,
        workoutName,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        durationSec: durationSec || 0,
        totalVolume,
        notes: notes || null,
        sets: {
          create: prUpdates.map((s, i) => ({
            exerciseId: s.exerciseId,
            exerciseName: s.exerciseName,
            setNumber: i + 1,
            weight: s.weight,
            reps: s.reps,
            restSeconds: s.restSeconds || 90,
            durationSec: s.durationSec ?? null,
            distanceKm: s.distanceKm ?? null,
            avgBpm: s.avgBpm ?? null,
            intensity: s.intensity ?? null,
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
