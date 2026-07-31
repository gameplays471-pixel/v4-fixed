import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, groupCreateSchema } from "@/lib/validation";
import { generateInviteCode } from "@/lib/gamification";

// GET /api/groups — grupos dos quais o usuário faz parte (dono ou membro).
export const GET = withErrorHandling("List groups", async (req: NextRequest) => {
  const user = await requireUser(req);

  const memberships = await db.groupMember.findMany({
    where: { userId: user.id },
    include: { group: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: "asc" },
  });

  const groups = memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    inviteCode: m.group.inviteCode,
    isOwner: m.group.ownerId === user.id,
    memberCount: m.group._count.members,
  }));

  return NextResponse.json({ groups });
});

// POST /api/groups — cria um grupo novo; quem cria já entra como dono.
export const POST = withErrorHandling("Create group", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, groupCreateSchema, "POST /api/groups");
  if (!parsed.success) return parsed.response;
  const { name } = parsed.data;

  // Colisão de código é rara (6 chars, ~33^6 combinações) mas checamos e
  // tentamos de novo em vez de deixar o `@unique` estourar como 500.
  let inviteCode = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await db.group.findUnique({ where: { inviteCode } });
    if (!clash) break;
    inviteCode = generateInviteCode();
  }

  const group = await db.group.create({
    data: {
      name,
      inviteCode,
      ownerId: user.id,
      members: { create: { userId: user.id } },
    },
  });

  return NextResponse.json({ group: { id: group.id, name: group.name, inviteCode: group.inviteCode, isOwner: true, memberCount: 1 } }, { status: 201 });
});
