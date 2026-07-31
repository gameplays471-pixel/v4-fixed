import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";

// Desliga a transmissão ao vivo — apaga a linha, então o link público some
// (a pessoa volta a ficar "off-live" por padrão). Idempotente: chamar sem
// transmissão ativa não é erro.
export const POST = withErrorHandling("Stop live workout session", async (req: NextRequest) => {
  const user = await requireUser(req);
  await db.liveWorkoutSession.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
});
