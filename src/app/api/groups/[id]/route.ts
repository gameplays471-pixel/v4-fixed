import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forbidden, notFound, requireUser, withErrorHandling } from "@/lib/api-error";

// DELETE /api/groups/[id] — o dono apaga o grupo inteiro (cascata remove
// os membros); qualquer outro membro apenas sai do grupo.
export const DELETE = withErrorHandling<{ params: Promise<{ id: string }> }>(
  "Leave/delete group",
  async (req: NextRequest, { params }) => {
    const user = await requireUser(req);
    const { id } = await params;

    const group = await db.group.findUnique({ where: { id } });
    if (!group) throw notFound("Grupo não encontrado");

    if (group.ownerId === user.id) {
      await db.group.delete({ where: { id } });
      return NextResponse.json({ deleted: true });
    }

    const membership = await db.groupMember.findUnique({ where: { groupId_userId: { groupId: id, userId: user.id } } });
    if (!membership) throw forbidden("Você não faz parte desse grupo");

    await db.groupMember.delete({ where: { id: membership.id } });
    return NextResponse.json({ left: true });
  }
);
