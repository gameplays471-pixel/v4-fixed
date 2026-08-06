import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";
import { z } from "zod";

// #16 FIX: Schema Zod com limite de tamanho para o snapshot
// Antes: qualquer JSON era aceito sem validação — risco de DoS e stored XSS
const SNAPSHOT_MAX_SIZE = 50_000; // 50KB max

const liveSnapshotSchema = z.object({
  snapshot: z.custom<unknown>(
    (val) => {
      try {
        return JSON.stringify(val).length <= SNAPSHOT_MAX_SIZE;
      } catch {
        return false;
      }
    },
    `Snapshot muito grande (máximo 50KB)`
  ),
});

// Atualiza o progresso da transmissão ao vivo (chamado periodicamente pelo
// cliente enquanto a pessoa treina com o compartilhamento ligado). Se não
// houver transmissão ativa (usuário não ligou / já desligou), é um no-op —
// o cliente não precisa tratar isso como erro.
export const POST = withErrorHandling("Push live workout snapshot", async (req: NextRequest) => {
  const user = await requireUser(req);

  const body = await req.json().catch(() => ({}));
  const parsed = liveSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message || "Snapshot inválido");
  }
  const { snapshot } = parsed.data;

  const result = await db.liveWorkoutSession.updateMany({
    where: { userId: user.id },
    data: { snapshot: JSON.stringify(snapshot) },
  });

  return NextResponse.json({ live: result.count > 0 });
});
