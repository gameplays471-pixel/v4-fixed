import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Barra criação automatizada/massiva de contas a partir de um mesmo IP.
const SIGNUP_IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 }; // 5 cadastros / hora

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipCheck = await checkRateLimit(`signup:ip:${ip}`, SIGNUP_IP_LIMIT);
    if (!ipCheck.allowed) return rateLimitResponse(ipCheck);

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
      token,
    });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
