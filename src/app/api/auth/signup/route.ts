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
  const { email, password, name } = parsed.data;

  const ip = getClientIp(req);
  const ipCheck = await checkRateLimit(`signup:ip:${ip}`, SIGNUP_IP_LIMIT);
  if (!ipCheck.allowed) return rateLimitResponse(ipCheck);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw badRequest("Email já cadastrado");
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
});
