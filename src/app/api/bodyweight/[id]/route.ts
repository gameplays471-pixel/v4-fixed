import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const log = await db.bodyWeightLog.findUnique({ where: { id } });
    if (!log || log.userId !== user.id) {
      return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
    }

    await db.bodyWeightLog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete body weight log error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
