import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Listar histórico de peso corporal (mais recente primeiro)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const logs = await db.bodyWeightLog.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
    });

    return NextResponse.json({ logs });
  } catch (e) {
    console.error("Get body weight logs error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Registrar um novo peso. Também atualiza User.weight com o valor mais
// recente, para manter o perfil sempre com o peso atual.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { weight, loggedAt, notes } = body;

    const weightNum = Number(weight);
    if (!weightNum || weightNum <= 0 || weightNum > 500) {
      return NextResponse.json({ error: "Peso inválido" }, { status: 400 });
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
  } catch (e) {
    console.error("Create body weight log error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
