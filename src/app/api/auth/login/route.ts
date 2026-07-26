import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, needsRehash, hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { unauthorized, withErrorHandling } from "@/lib/api-error";
import { parseBody, loginSchema } from "@/lib/validation";

// Por IP: barra brute force vindo de uma única origem.
const IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 }; // 10 tentativas / 15 min
// Por e-mail: barra credential stuffing contra UMA conta vindo de várias
// origens/IPs. Limite um pouco mais folgado que o de IP para reduzir o
// risco de alguém travar a conta de outra pessoa só de propósito.
const EMAIL_LIMIT = { limit: 15, windowMs: 15 * 60 * 1000 };

export const POST = withErrorHandling("Login", async (req: NextRequest) => {
  const parsed = await parseBody(req, loginSchema);
  if (!parsed.success) return parsed.response;
  const { email, password, rememberMe = true } = parsed.data;

  const ip = getClientIp(req);
  const ipCheck = await checkRateLimit(`login:ip:${ip}`, IP_LIMIT);
  if (!ipCheck.allowed) return rateLimitResponse(ipCheck);

  const emailKey = `login:email:${email.toLowerCase()}`;
  const emailCheck = await checkRateLimit(emailKey, EMAIL_LIMIT);
  if (!emailCheck.allowed) return rateLimitResponse(emailCheck);

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw unauthorized("Credenciais inválidas");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw unauthorized("Credenciais inválidas");
  }

  // Migração transparente: contas ainda no hash antigo (sha256 sem salt
  // ou texto puro) são re-hasheadas com bcrypt neste login bem-sucedido.
  if (needsRehash(user.passwordHash)) {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    });
  }

  const token = await createSession(user.id);
  await setSessionCookie(token, !!rememberMe);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    token, // token também no body para localStorage (suporte cross-origin)
    rememberMe: !!rememberMe,
  });
});
