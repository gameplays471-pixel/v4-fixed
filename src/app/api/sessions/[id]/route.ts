import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Get session",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);

    const { id } = await params;
    const session = await db.workoutSession.findFirst({
      where: { id, userId: user.id },
      include: {
        sets: true,
        workout: true,
      },
    });

    if (!session) {
      throw notFound("Sessão não encontrada");
    }

    return NextResponse.json({ session });
  }
);

export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Delete session",
  async (req, { params }) => {
    const user = await requireUser(req);

    const { id } = await params;
    const session = await db.workoutSession.findFirst({
      where: { id, userId: user.id },
    });
    if (!session) {
      throw notFound("Sessão não encontrada");
    }

    await db.workoutSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
);
