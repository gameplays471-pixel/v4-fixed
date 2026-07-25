import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";

export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Delete body weight log",
  async (req, { params }) => {
    const user = await requireUser(req);
    const { id } = await params;

    const log = await db.bodyWeightLog.findUnique({ where: { id } });
    if (!log || log.userId !== user.id) {
      throw notFound("Registro não encontrado");
    }

    await db.bodyWeightLog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  }
);
