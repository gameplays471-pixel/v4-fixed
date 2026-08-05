/**
 * Sistema de autenticação com JWT assinado (HS256 via jose).
 *
 * Fluxo:
 *  1. No login/signup: createSession(userId) assina um JWT com o secret
 *     definido em JWT_SECRET (env). O token expira em SESSION_EXPIRY_DAYS.
 *  2. O JWT é persistido em cookie httpOnly (setSessionCookie) E retornado
 *     no body para compatibilidade cross-origin (Bearer header).
 *  3. getCurrentUser verifica a assinatura do JWT antes de qualquer lookup
 *     no banco — tokens forjados ou expirados são rejeitados na verificação.
 */

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE = "hevy_session";
const SESSION_EXPIRY_DAYS = 30;

// ---------------------------------------------------------------------------
// Secret key — obrigatório em produção
// ---------------------------------------------------------------------------

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Em dev, usa um secret de fallback com aviso. Em produção, lança.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[auth] JWT_SECRET não definido. Defina a variável de ambiente antes de iniciar em produção."
      );
    }
    console.warn(
      "[auth] AVISO: JWT_SECRET não definido. Usando secret de desenvolvimento inseguro. " +
        "Defina JWT_SECRET no .env para produção."
    );
    return new TextEncoder().encode("hevy-dev-secret-CHANGE-THIS-IN-PRODUCTION-min32chars!!");
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Hashing de senha — bcrypt (custo 12)
// ---------------------------------------------------------------------------

import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/**
 * Gera o hash bcrypt da senha. Use sempre que criar ou alterar uma senha.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compara uma senha em texto puro com um hash armazenado.
 * Suporta tanto hashes bcrypt ($2a/$2b) quanto SHA-256 legado
 * (para migração transparente de contas existentes).
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  // Hash bcrypt sempre começa com $2a$ ou $2b$
  if (storedHash.startsWith("$2")) {
    return bcrypt.compare(password, storedHash);
  }

  // Fallback de migração: hash SHA-256 legado
  // Após verificar com sucesso, o chamador deve re-hash com bcrypt
  const { createHash } = await import("crypto");
  const sha256 = createHash("sha256").update(password).digest("hex");
  return sha256 === storedHash;
}

// ---------------------------------------------------------------------------
// Criação e verificação de JWT
// ---------------------------------------------------------------------------

interface SessionPayload extends JWTPayload {
  sub: string; // userId
}

/**
 * Cria um JWT assinado com HS256.
 * O payload contém apenas `sub` (userId) — minimiza dados sensíveis no token.
 */
export async function createSession(userId: string): Promise<string> {
  const secret = getJwtSecret();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  return token;
}

/**
 * Verifica a assinatura e expiração do JWT.
 * Retorna o userId se válido, null caso contrário.
 */
async function verifyToken(token: string): Promise<string | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify<SessionPayload>(token, secret, {
      algorithms: ["HS256"],
    });
    return payload.sub ?? null;
  } catch {
    // Token inválido, expirado ou assinatura incorreta
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie de sessão
// ---------------------------------------------------------------------------

export async function setSessionCookie(token: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  const isProd = process.env.NODE_ENV === "production";

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,          // HTTPS apenas em produção (#8 antecipado)
    sameSite: isProd ? "strict" : "lax",
    expires,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Lookup de usuário no banco
// ---------------------------------------------------------------------------

export type SelectedUser = {
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

// ---------------------------------------------------------------------------
// getCurrentUser — extrai, verifica e resolve o usuário
// ---------------------------------------------------------------------------

/**
 * Obtém o usuário atual a partir do Bearer token (header Authorization)
 * ou do cookie de sessão.
 *
 * A assinatura JWT é verificada antes de qualquer acesso ao banco.
 * Tokens forjados, expirados ou com assinatura inválida retornam null.
 */
export async function getCurrentUser(req?: NextRequest): Promise<SelectedUser | null> {
  let rawToken: string | null = null;

  // 1. Bearer token via NextRequest (mais confiável em rotas de API)
  if (req) {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      rawToken = authHeader.slice(7).trim();
    }
  }

  // 2. Bearer token via next/headers (Server Components)
  if (!rawToken) {
    try {
      const { headers } = await import("next/headers");
      const headerStore = await headers();
      const authHeader =
        headerStore.get("authorization") || headerStore.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        rawToken = authHeader.slice(7).trim();
      }
    } catch {
      // contexto fora de Server Component — ignorar
    }
  }

  // 3. Cookie de sessão como fallback
  if (!rawToken) {
    try {
      const cookieStore = await cookies();
      rawToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
    } catch {
      // ignorar
    }
  }

  if (!rawToken) return null;

  // Verificar assinatura e expiração antes de tocar no banco
  const userId = await verifyToken(rawToken);
  if (!userId) return null;

  return lookupUser(userId);
}

export async function requireUser(req?: NextRequest): Promise<SelectedUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
