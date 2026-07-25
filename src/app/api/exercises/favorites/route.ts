import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireUser, withErrorHandling } from "@/lib/api-error";

// Listar favoritos
export const GET = withErrorHandling("Get favorites", async (req: NextRequest) => {
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
});

// Adicionar/remover favorito (toggle)
export const POST = withErrorHandling("Toggle favorite", async (req: NextRequest) => {
  const user = await requireUser(req);

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
});
