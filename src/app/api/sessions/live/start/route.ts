import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";
import { generateShareToken } from "@/lib/share-token";

// Liga a transmissão ao vivo do treino em andamento. No máximo uma por
// usuário (userId é @unique) — chamar de novo simplesmente troca pra um
// novo treino/slug, então links antigos morrem automaticamente.
export const POST = withErrorHandling("Start live workout session", async (req: NextRequest) => {
  const user = await requireUser(req);
  const body = await req.json().catch(() => ({}));
  const { workoutId, workoutName } = body;

  if (!workoutId || typeof workoutId !== "string" || !workoutName || typeof workoutName !== "string") {
    throw badRequest("workoutId e workoutName são obrigatórios");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateShareToken();
    try {
      const live = await db.liveWorkoutSession.upsert({
        where: { userId: user.id },
        create: { userId: user.id, workoutId, workoutName, slug, snapshot: "{}" },
        update: { workoutId, workoutName, slug, snapshot: "{}", startedAt: new Date() },
      });
      return NextResponse.json({ slug: live.slug });
    } catch (e: any) {
      if (e?.code === "P2002" && attempt < 4) continue; // slug colidiu (raríssimo), tenta outro
      throw e;
    }
  }

  throw new Error("Não foi possível iniciar a transmissão ao vivo");
});
