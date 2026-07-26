import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";

// Retorna os sets da última sessão em que cada exercício foi feito.
// Query: ?exerciseIds=id1,id2,id3
// Resposta: { lastSets: { [exerciseId]: [{ weight, reps, rir }, ...] } }
//
// A busca é por exerciseId (não por workoutId), de forma que o histórico
// aparece mesmo quando o exercício está em outro treino.
export const GET = withErrorHandling("Get last sets", async (req: NextRequest) => {
  const user = await requireUser(req);

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("exerciseIds") || "";
  const exerciseIds = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (exerciseIds.length === 0) {
    return NextResponse.json({ lastSets: {} });
  }

  // Para cada exerciseId, encontra a sessão mais recente do usuário
  // que o contém e retorna todos os sets daquele exercício dentro dela.
  const lastSets: Record<string, Array<{ weight: number; reps: number; rir: number | null }>> = {};

  await Promise.all(
    exerciseIds.map(async (exerciseId) => {
      const mostRecent = await db.sessionSet.findFirst({
        where: {
          exerciseId,
          session: { userId: user.id },
        },
        orderBy: {
          completedAt: "desc",
        },
        select: { sessionId: true },
      });

      if (!mostRecent) return;

      const sets = await db.sessionSet.findMany({
        where: {
          exerciseId,
          sessionId: mostRecent.sessionId,
        },
        orderBy: { setNumber: "asc" },
        select: { weight: true, reps: true, rir: true },
      });

      lastSets[exerciseId] = sets.map((s) => ({
        weight: s.weight,
        reps: s.reps,
        rir: s.rir ?? null,
      }));
    })
  );

  return NextResponse.json({ lastSets });
});
