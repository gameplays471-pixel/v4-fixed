// Sistema de autenticação simples usando cookies HTTP-only
// Demo: usa email/senha simples sem bcrypt (apenas para fins de demonstração)

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

export const SESSION_COOKIE = "hevy_session";
const SESSION_EXPIRY_DAYS = 30;

// Hash simples para demo (não usar em produção)
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function createSession(userId: string): Promise<string> {
  // Token simples: userId + timestamp + random
  const token = `${userId}.${Date.now()}.${crypto.randomBytes(16).toString("hex")}`;
  return token;
}

export async function setSessionCookie(token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!token) return null;
  
  const userId = token.split(".")[0];
  if (!userId) return null;
  
  const user = await db.user.findUnique({
    where: { id: userId },
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
      createdAt: true,
    },
  });
  
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
