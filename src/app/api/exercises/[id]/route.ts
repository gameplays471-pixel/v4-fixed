import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Get exercise",
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    const exercise = await db.exercise.findUnique({
      where: { id },
      include: {
        favorites: true,
      },
    });

    if (!exercise) {
      throw notFound("Exercício não encontrado");
    }

    return NextResponse.json({ exercise });
  }
);
