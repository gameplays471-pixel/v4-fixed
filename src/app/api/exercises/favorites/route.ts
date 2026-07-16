import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Listar favoritos
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      include: { exercise: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (e) {
    console.error("Get favorites error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Adicionar/remover favorito (toggle)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { exerciseId } = body;

    const existing = await db.favorite.findUnique({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await db.favorite.create({
        data: { userId: user.id, exerciseId },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (e) {
    console.error("Toggle favorite error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
