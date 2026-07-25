import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireUser, withErrorHandling } from "@/lib/api-error";

export const GET = withErrorHandling("Get profile", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
});

export const PUT = withErrorHandling("Update profile", async (req: NextRequest) => {
  const user = await requireUser(req);

  const body = await req.json();
  const { name, bio, weight, height, sex, birthDate, goal, avatarUrl } = body;

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio || null,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      sex: sex || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      goal: goal || null,
      avatarUrl: avatarUrl || null,
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
