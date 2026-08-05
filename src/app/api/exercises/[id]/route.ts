import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Busca o exercício sem incluir favoritos (evita vazar userId de outros usuários)
    const exercise = await db.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    // Se o usuário estiver autenticado, informa se ele favoritou o exercício
    let isFavorited = false;
    const user = await getCurrentUser(req);
    if (user) {
      const fav = await db.favorite.findUnique({
        where: { userId_exerciseId: { userId: user.id, exerciseId: id } },
        select: { id: true },
      });
      isFavorited = fav !== null;
    }

    return NextResponse.json({ exercise, isFavorited });
  } catch (e) {
    console.error("Get exercise error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
