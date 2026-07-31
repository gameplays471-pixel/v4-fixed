import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conflict, notFound, requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, groupJoinSchema } from "@/lib/validation";

// POST /api/groups/join — entra num grupo existente usando o código de
// convite. Qualquer pessoa com o código entra direto, sem aprovação do dono.
export const POST = withErrorHandling("Join group", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, groupJoinSchema, "POST /api/groups/join");
  if (!parsed.success) return parsed.response;
  const { inviteCode } = parsed.data;

  const group = await db.group.findUnique({ where: { inviteCode: inviteCode.toUpperCase() } });
  if (!group) throw notFound("Código de convite inválido");

  const existing = await db.groupMember.findUnique({ where: { groupId_userId: { groupId: group.id, userId: user.id } } });
  if (existing) throw conflict("Você já faz parte desse grupo");

  await db.groupMember.create({ data: { groupId: group.id, userId: user.id } });

  const memberCount = await db.groupMember.count({ where: { groupId: group.id } });

  return NextResponse.json({
    group: { id: group.id, name: group.name, inviteCode: group.inviteCode, isOwner: group.ownerId === user.id, memberCount },
  });
});
