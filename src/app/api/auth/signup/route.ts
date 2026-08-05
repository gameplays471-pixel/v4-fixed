import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { SignupSchema, parseBody } from "@/lib/schemas";

// 5 cadastros por IP a cada hora
const SIGNUP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  // Rate limiting por IP
  const ip = getClientIp(req);
  const rl = rateLimit(`signup:${ip}`, SIGNUP_LIMIT);
  if (!rl.success) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${rl.retryAfter}s.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfter),
          "X-RateLimit-Limit": String(SIGNUP_LIMIT.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
  try {
    const body = await req.json();
    const parsed = parseBody(SignupSchema, body);
    if (!parsed.success) return parsed.response;
    const { email, password, name } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash: await hashPassword(password),
      },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
