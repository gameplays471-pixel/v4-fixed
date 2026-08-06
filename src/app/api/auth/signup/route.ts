import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { badRequest, withErrorHandling } from "@/lib/api-error";
import { parseBody, signupSchema } from "@/lib/validation";

// Barra criação automatizada/massiva de contas a partir de um mesmo IP.
const SIGNUP_IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }; // 5 cadastros / hora

export const POST = withErrorHandling("Signup", async (req: NextRequest) => {
  const parsed = await parseBody(req, signupSchema, "POST /api/auth/signup");
  if (!parsed.success) return parsed.response;
  const { email, password, name, phone } = parsed.data;

  const ip = getClientIp(req);
  const ipCheck = await checkRateLimit(`signup:ip:${ip}`, SIGNUP_IP_LIMIT);
  if (!ipCheck.allowed) return rateLimitResponse(ipCheck);

  // #7 FIX: User enumeration — sempre retornar sucesso genérico
  // tanto para email já existente quanto para signup real. A resposta
  // é idêntica para o atacante, impossibilitando enumerar emails.
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Não revelar que o email já existe — retornar sucesso falso
    // O frontend não diferencia; o atacante não sabe se registrou ou não
    return NextResponse.json({ success: true, message: "Verifique seu email para confirmar o cadastro." });
  }

  const user = await db.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      phone,
      passwordHash: await hashPassword(password),
    },
  });

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    // #29 FIX: token removido do body — autenticação via cookie httpOnly apenas
  });
});
