import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin, notFound, withErrorHandling } from "@/lib/api-error";
import { recordAudit } from "@/lib/audit-log";
import { hashPassword } from "@/lib/auth";

function generateRandomPassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export const POST = withErrorHandling<{
  params: Promise<{ id: string }> }>(
  "Admin: reset user password",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw notFound("Usuário não encontrado");

    const body = await req.json();
    const { password } = body as { password?: string };

    const generatedPassword = !password ? generateRandomPassword(12) : undefined;
    const newPassword = password || generatedPassword!;

    const newHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id },
      data: { passwordHash: newHash },
    });

    await recordAudit({
      req,
      actorId: admin.id,
      actorEmail: admin.email,
      action: "update",
      entityType: "user",
      entityId: id,
      before: { passwordHash: "[changed from]" },
      after: { passwordHash: "[changed to]" },
    });

    return NextResponse.json({
      success: true,
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  }
);
