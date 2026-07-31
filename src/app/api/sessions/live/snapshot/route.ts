import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";

// Atualiza o progresso da transmissão ao vivo (chamado periodicamente pelo
// cliente enquanto a pessoa treina com o compartilhamento ligado). Se não
// houver transmissão ativa (usuário não ligou / já desligou), é um no-op —
// o cliente não precisa tratar isso como erro.
export const POST = withErrorHandling("Push live workout snapshot", async (req: NextRequest) => {
  const user = await requireUser(req);
  const body = await req.json().catch(() => ({}));
  const { snapshot } = body;

  if (snapshot === undefined) throw badRequest("snapshot é obrigatório");

  const result = await db.liveWorkoutSession.updateMany({
    where: { userId: user.id },
    data: { snapshot: JSON.stringify(snapshot) },
  });

  return NextResponse.json({ live: result.count > 0 });
});
