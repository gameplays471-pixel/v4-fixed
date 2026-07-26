import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, bodyWeightSchema } from "@/lib/validation";

// Listar histórico de peso corporal (mais recente primeiro)
export const GET = withErrorHandling("Get body weight logs", async (req: NextRequest) => {
  const user = await requireUser(req);

  const logs = await db.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "desc" },
  });

  return NextResponse.json({ logs });
});

// Registrar um novo peso (e opcionalmente % de gordura). Também atualiza
// User.weight com o valor mais recente, para manter o perfil sempre com
// o peso atual.
export const POST = withErrorHandling("Create body weight log", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, bodyWeightSchema);
  if (!parsed.success) return parsed.response;
  const { weight: weightNum, bodyFatPercent: bodyFatNum, loggedAt, notes } = parsed.data;

  const date = loggedAt || new Date();

  const log = await db.bodyWeightLog.create({
    data: {
      userId: user.id,
      weight: weightNum,
      bodyFatPercent: bodyFatNum ?? null,
      loggedAt: date,
      notes: notes || null,
    },
  });

  // Atualiza o peso "atual" do perfil somente se este for o registro
  // mais recente (evita sobrescrever com um lançamento retroativo antigo).
  const mostRecent = await db.bodyWeightLog.findFirst({
    where: { userId: user.id },
    orderBy: { loggedAt: "desc" },
  });
  if (mostRecent && mostRecent.id === log.id) {
    await db.user.update({
      where: { id: user.id },
      data: { weight: weightNum },
    });
  }

  return NextResponse.json({ log });
});
