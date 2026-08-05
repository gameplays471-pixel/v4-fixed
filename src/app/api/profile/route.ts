import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireUser, withErrorHandling } from "@/lib/api-error";
import { parseBody, profileSchema } from "@/lib/validation";
import { publicAvatarUrl, isDataUrlAvatar } from "@/lib/avatar";
import { badRequest } from "@/lib/api-error";

export const GET = withErrorHandling("Get profile", async (req: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { ...user, avatarUrl: publicAvatarUrl(user.avatarUrl) },
  });
});

export const PUT = withErrorHandling("Update profile", async (req: NextRequest) => {
  const user = await requireUser(req);

  const parsed = await parseBody(req, profileSchema, "PUT /api/profile");
  if (!parsed.success) return parsed.response;
  const { name, phone, bio, weight, height, sex, birthDate, goal, avatarUrl, gameEnabled, waterGoalMl, weeklyWorkoutGoal } = parsed.data;

  if (isDataUrlAvatar(avatarUrl)) {
    throw badRequest("Envie a foto via /api/profile/avatar (não use base64 no perfil)");
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: phone ?? null,
      bio: bio ?? null,
      weight: weight ?? null,
      height: height ?? null,
      sex: sex ?? null,
      birthDate: birthDate ?? null,
      goal: goal ?? null,
      ...(avatarUrl !== undefined ? { avatarUrl: publicAvatarUrl(avatarUrl) } : {}),
      ...(gameEnabled !== undefined ? { gameEnabled } : {}),
      ...(waterGoalMl !== undefined ? { waterGoalMl } : {}),
      ...(weeklyWorkoutGoal !== undefined ? { weeklyWorkoutGoal } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      bio: true,
      weight: true,
      height: true,
      sex: true,
      birthDate: true,
      goal: true,
      avatarUrl: true,
      gameEnabled: true,
      waterGoalMl: true,
      weeklyWorkoutGoal: true,
    },
  });

  return NextResponse.json({
    user: { ...updated, avatarUrl: publicAvatarUrl(updated.avatarUrl) },
  });
});
