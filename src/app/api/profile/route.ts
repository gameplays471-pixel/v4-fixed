import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, profileSchema } from "@/lib/validation";

export const GET = withErrorHandling("Get profile", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
});

export const PUT = withErrorHandling("Update profile", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, profileSchema);
  if (!parsed.success) return parsed.response;
  const { name, bio, weight, height, sex, birthDate, goal, avatarUrl } = parsed.data;

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio ?? null,
      weight: weight ?? null,
      height: height ?? null,
      sex: sex ?? null,
      birthDate: birthDate ?? null,
      goal: goal ?? null,
      avatarUrl: avatarUrl ?? null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      weight: true,
      height: true,
      sex: true,
      birthDate: true,
      goal: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ user: updated });
});
