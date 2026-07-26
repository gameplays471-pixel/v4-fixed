import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { notFound, requireUser, withErrorHandling } from "@/lib/api-error";

export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Delete progress photo",
  async (req, { params }) => {
    const user = await requireUser(req);
    const { id } = await params;

    const photo = await db.progressPhoto.findUnique({ where: { id } });
    if (!photo || photo.userId !== user.id) {
      throw notFound("Foto não encontrada");
    }

    // Remove do Blob Storage primeiro; se falhar (token ausente, rede, etc.),
    // ainda assim removemos o registro do banco — melhor um arquivo órfão
    // no storage do que travar o usuário de limpar sua própria galeria.
    try {
      await del(photo.pathname);
    } catch (e) {
      console.error("Erro ao deletar blob (arquivo pode ter ficado órfão):", e);
    }

    await db.progressPhoto.delete({ where: { id } });

    return NextResponse.json({ success: true });
  }
);
