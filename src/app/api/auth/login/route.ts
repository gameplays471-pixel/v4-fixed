import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { LoginSchema, parseBody } from "@/lib/schemas";

// 10 tentativas por IP a cada 15 minutos
const LOGIN_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  // Rate limiting por IP
  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, LOGIN_LIMIT);
  if (!rl.success) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${rl.retryAfter}s.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfter),
          "X-RateLimit-Limit": String(LOGIN_LIMIT.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
  try {
    const body = await req.json();
    const parsed = parseBody(LoginSchema, body);
    if (!parsed.success) return parsed.response;
    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Resposta genérica para não vazar se o email existe
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Migração transparente: se o hash ainda é SHA-256 legado, re-hash para bcrypt
    if (!user.passwordHash.startsWith("$2")) {
      const newHash = await hashPassword(password);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
