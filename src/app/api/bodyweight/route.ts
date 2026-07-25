import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, requireUser, withErrorHandling } from "@/lib/api-error";

// Listar histórico de peso corporal (mais recente primeiro)
export const GET = withErrorHandling("Get body weight logs", async (req: NextRequest) => {
  const user = await requireUser(req);

  const logs = await db.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "desc" },
  });

  return NextResponse.json({ logs });
});

// Registrar um novo peso. Também atualiza User.weight com o valor mais
// recente, para manter o perfil sempre com o peso atual.
export const POST = withErrorHandling("Create body weight log", async (req: NextRequest) => {
  const user = await requireUser(req);

  const body = await req.json();
  const { weight, loggedAt, notes } = body;

  const weightNum = Number(weight);
  if (!weightNum || weightNum <= 0 || weightNum > 500) {
    throw badRequest("Peso inválido");
  }

  const date = loggedAt ? new Date(loggedAt) : new Date();

  const log = await db.bodyWeightLog.create({
    data: {
      userId: user.id,
      weight: weightNum,
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
