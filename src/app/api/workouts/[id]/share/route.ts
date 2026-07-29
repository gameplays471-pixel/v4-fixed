import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";

/** Token opaco de 12 caracteres (base64url), curto o bastante pra caber num link mas não-adivinhável. */
function generateShareSlug(): string {
  return crypto.randomBytes(9).toString("base64url");
}

// Devolve (gerando na primeira vez, se ainda não existir) o slug fixo de
// compartilhamento público do treino — ver GET /api/public/workouts/[slug].
// Sempre o mesmo link pra um dado treino (não expira, não é regerado).
export const POST = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Create workout share link",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);
    const { id } = await params;

    const existing = await db.workout.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw notFound("Treino não encontrado");

    if (existing.shareSlug) {
      return NextResponse.json({ shareSlug: existing.shareSlug });
    }

    // Colisão de token de 9 bytes aleatórios é praticamente impossível, mas
    // a constraint única no banco é a garantia de verdade — poucas
    // tentativas cobrem até o azar extremo sem deixar a rota travada num
    // loop infinito.
    for (let attempt = 0; attempt < 5; attempt++) {
      const shareSlug = generateShareSlug();
      try {
        const updated = await db.workout.update({
          where: { id },
          data: { shareSlug },
        });
        return NextResponse.json({ shareSlug: updated.shareSlug });
      } catch (e: any) {
        if (e?.code === "P2002" && attempt < 4) continue; // slug colidiu, tenta outro
        throw e;
      }
    }

    throw new Error("Não foi possível gerar um link de compartilhamento único");
  }
);
