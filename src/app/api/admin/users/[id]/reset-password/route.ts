import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireAdmin, notFound, withErrorHandling, badRequest } from "@/lib/api-error";
import { recordAudit } from "@/lib/audit-log";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

// #11 FIX: Gerador de senha sem viés de modulo (rejection sampling)
function generateRandomPassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let result = "";
  while (result.length < length) {
    const bytes = crypto.randomBytes(length * 2);
    for (const byte of bytes) {
      // Rejection sampling: só aceita valores que mapeiam uniformemente
      const limit = Math.floor(256 / chars.length) * chars.length;
      if (byte < limit) {
        result += chars[byte % chars.length];
        if (result.length >= length) break;
      }
    }
  }
  return result;
}

// #11 FIX: Validação Zod para reset de senha (antes era type assertion `as`)
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(200).optional(),
});

export const POST = withErrorHandling<{
  params: Promise<{ id: string }> }>(
  "Admin: reset user password",
  async (req, { params }) => {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) throw notFound("Usuário não encontrado");

    const body = await req.json().catch(() => ({}));
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Senha inválida");
    const { password } = parsed.data;

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

    // #11 FIX: Nunca retornar senha gerada no response body.
    // Em produção, enviar por email ao usuário.
    // Por enquanto, retornar apenas confirmação de sucesso.
    // TODO: Implementar envio de email com senha temporária.
    return NextResponse.json({
      success: true,
      message: generatedPassword
        ? "Senha temporária gerada. Em produção, seria enviada por email para " + user.email
        : "Senha alterada com sucesso",
    });
  }
);
