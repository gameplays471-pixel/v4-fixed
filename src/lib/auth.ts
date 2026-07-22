// Sistema de autenticação híbrido: Bearer token (header) + cookie fallback
// Demo: usa email/senha simples sem bcrypt (apenas para fins de demonstração)

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

export const SESSION_COOKIE = "gemgym_session";
export const TOKEN_LOCALSTORAGE_KEY = "gemgym_token";
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

export async function setSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();

  if (remember) {
    // "Manter conectado": cookie persiste por 30 dias mesmo fechando o navegador.
    const expires = new Date();
    expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires,
      path: "/",
    });
  } else {
    // Sem "manter conectado": cookie de sessão, expira ao fechar o navegador.
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Extrai o userId do token (formato: userId.timestamp.random)
 */
function extractUserIdFromToken(token: string): string | null {
  const userId = token.split(".")[0];
  return userId || null;
}

type SelectedUser = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  weight: number | null;
  height: number | null;
  sex: string | null;
  birthDate: Date | null;
  goal: string | null;
  avatarUrl: string | null;
  createdAt: Date;
};

async function lookupUser(userId: string): Promise<SelectedUser | null> {
  return db.user.findUnique({
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
}

/**
 * Obtém o usuário atual a partir do Bearer token (header Authorization)
 * ou do cookie de sessão. Suporte híbrido para máxima compatibilidade
 * (especialmente em cenários cross-origin como preview URLs).
 *
 * Aceita opcionalmente um NextRequest para ler headers diretamente
 * (mais confiável que next/headers em alguns contextos).
 */
export async function getCurrentUser(req?: NextRequest): Promise<SelectedUser | null> {
  let token: string | null = null;

  // 1. Tentar via header Authorization: Bearer <token> no request direto
  if (req) {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  // 2. Tentar via next/headers (server components, etc.)
  if (!token) {
    try {
      const { headers } = await import("next/headers");
      const headerStore = await headers();
      const authHeader =
        headerStore.get("authorization") || headerStore.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback para cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE)?.value || null;
    } catch {
      // ignore
    }
  }

  if (!token) return null;

  const userId = extractUserIdFromToken(token);
  if (!userId) return null;

  return lookupUser(userId);
}

export async function requireUser(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
