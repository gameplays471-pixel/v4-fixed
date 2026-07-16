import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exercise = await db.exercise.findUnique({
      where: { id },
      include: {
        favorites: true,
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ exercise });
  } catch (e) {
    console.error("Get exercise error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
