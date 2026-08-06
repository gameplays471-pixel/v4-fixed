// Sistema de autenticação: Cookie httpOnly (primário) + Bearer token fallback (cross-origin)
//
// Senha: hash com bcrypt (salt único por senha + custo computacional
// ajustável), o que inviabiliza rainbow tables e torna brute force caro.
// Hashes legados (sha256 sem salt) continuam sendo aceitos com
// comparação timing-safe — são automaticamente re-hasheados com bcrypt
// no próximo login bem-sucedido (ver `needsRehash` + uso em login/route.ts).
// O caminho de texto puro foi REMOVIDO por segurança (contas demo devem
// ser migradas para bcrypt).
//
// Sessão: token assinado no formato JWT (HS256) usando HMAC-SHA256 com
// SESSION_SECRET (env). Isso impede que alguém forje um token só sabendo o
// `id` (cuid) de outro usuário: a assinatura só pode ser gerada por quem
// conhece o segredo do servidor, e é validada com comparação em tempo
// constante (crypto.timingSafeEqual) para evitar timing attacks. O token
// também carrega expiração (`exp`) e issued-at (`iat`).

import { db } from "@/lib/db";
import { publicAvatarUrl } from "@/lib/avatar";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "gemgym_session";
export const TOKEN_LOCALSTORAGE_KEY = "gemgym_token";

// #9 FIX: Sessão reduzida de 30 para 7 dias (com "Manter conectado")
// e 24h sem. Antes: 30 dias era risco excessivo — JWT comprometido
// dava acesso por 30 dias mesmo após logout/senha trocada.
const SESSION_EXPIRY_DAYS = 7;
const SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_DAYS * 24 * 60 * 60;

// ─── Segredo de assinatura ─────────────────────────────────────────────────
// #2 FIX: Nunca usar segredo hardcoded. Em dev, gerar segredo aleatório
// por processo. Mínimo de 32 caracteres (RFC recomenda ≥256 bits para HS256).
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET não configurado (ou muito curto — mínimo 32 caracteres). " +
      "Gere um com: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\""
    );
  }

  // Em dev: gerar segredo aleatório por processo em vez de hardcoded.
  // Previne que código publicamente conhecido seja usado para forjar tokens.
  if (!(globalThis as any).__GEMGYM_DEV_SECRET) {
    (globalThis as any).__GEMGYM_DEV_SECRET = crypto.randomBytes(32).toString("hex");
    console.warn(
      "[auth] SESSION_SECRET não configurado — usando segredo aleatório de desenvolvimento. " +
      "Configure SESSION_SECRET no .env antes de ir para produção."
    );
  }
  return (globalThis as any).__GEMGYM_DEV_SECRET;
}

// ─── Senha (bcrypt: salt único por hash + custo computacional) ────────────
const BCRYPT_COST = 12; // ~250ms por hash em hardware atual; ajuste se notar lentidão

/** Gera um hash bcrypt (com salt aleatório embutido) para a senha. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

const LEGACY_SHA256_RE = /^[a-f0-9]{64}$/i;

/** sha256 puro (sem salt) — mantido só para validar hashes legados, nunca para criar novos. */
function legacySha256(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verifica a senha contra o hash armazenado.
 * Suporta dois formatos:
 *  1. bcrypt ($2a$/$2b$/$2y$) — formato atual, com salt e custo.
 *  2. sha256 legado (64 hex, sem salt) — formato antigo, mantido só p/ compat.
 *     Usa crypto.timingSafeEqual para evitar timing attacks.
 *
 * #6 FIX: Caminho de texto puro REMOVIDO. Contas legadas com senha em
 * texto puro devem ser migradas para bcrypt antes do login. Se um hash
 * não corresponder a nenhum formato conhecido, retorna" falso (não aceita).
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Formato atual: bcrypt
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compare(password, hash);
  }
  // Formato legado: sha256 sem salt — usar comparação timing-safe
  // #21 FIX: Antes usava === (vulnerável a timing attacks)
  if (LEGACY_SHA256_RE.test(hash)) {
    const computed = legacySha256(password);
    const computedBuf = Buffer.from(computed, "hex");
    const hashBuf = Buffer.from(hash, "hex");
    if (computedBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, hashBuf);
  }
  // Qualquer outro formato (incl. texto puro) — REJEITAR
  // Contas demo legadas devem ser migradas para bcrypt via script.
  return false;
}

/** true se o hash armazenado ainda não está no formato bcrypt atual. */
export function needsRehash(hash: string): boolean {
  return !(hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
}

// ─── Base64url helpers ──────────────────────────────────────────────────────
function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function sign(data: string, secret: string): string {
  return base64url(crypto.createHmac("sha256", secret).update(data).digest());
}

// ─── Sessão (JWT HS256 minimalista, sem dependência externa) ──────────────
interface SessionPayload {
  sub: string; // userId
  iat: number; // issued at (segundos)
  exp: number; // expiration (segundos)
}

/**
 * Cria um token de sessão assinado (JWT HS256): header.payload.signature.
 * Só quem conhece SESSION_SECRET consegue gerar uma assinatura válida —
 * portanto não dá para forjar um token só conhecendo o id de outro usuário.
 */
export async function createSession(userId: string): Promise<string> {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "HS256", typ: "JWT" };
  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    exp: now + SESSION_EXPIRY_SECONDS,
  };

  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(payload));
  const signature = sign(`${headerPart}.${payloadPart}`, secret);

  return `${headerPart}.${payloadPart}.${signature}`;
}

/**
 * Valida a assinatura e a expiração do token e retorna o userId.
 * Retorna null para qualquer token malformado, adulterado ou expirado.
 */
function verifySession(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;

  const secret = getSessionSecret();
  const expectedSignature = sign(`${headerPart}.${payloadPart}`, secret);

  const provided = base64urlDecode(signaturePart);
  const expected = base64urlDecode(expectedSignature);
  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(provided, expected)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadPart).toString("utf8"));
  } catch {
    return null;
  }

  if (!payload.sub || typeof payload.exp !== "number") return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null; // expirado

  return payload.sub;
}

export async function setSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();

  // #22 FIX: Cookie secure sempre true quando em HTTPS (Vercel, staging com HTTPS)
  // Antes: secure: process.env.NODE_ENV === "production" — falhava em preview URLs
  const isSecure = process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.FORCE_SECURE_COOKIE === "1";

  if (remember) {
    // "Manter conectado": cookie persiste por SESSION_EXPIRY_DAYS mesmo fechando o navegador.
    const expires = new Date();
    expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      expires,
      path: "/",
    });
  } else {
    // Sem "manter conectado": cookie de sessão, expira ao fechar o navegador.
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
    });
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export type SelectedUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  bio: string | null;
  weight: number | null;
  height: number | null;
  sex: string | null;
  birthDate: Date | null;
  goal: string | null;
  avatarUrl: string | null;
  role: string;
  gameEnabled: boolean;
  waterGoalMl: number;
  weeklyWorkoutGoal: number;
  createdAt: Date;
};

async function lookupUser(userId: string): Promise<SelectedUser | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      bio: true,
      weight: true,
      height: true,
      sex: true,
      birthDate: true,
      goal: true,
      avatarUrl: true,
      role: true,
      disabled: true,
      gameEnabled: true,
      waterGoalMl: true,
      weeklyWorkoutGoal: true,
      createdAt: true,
    },
  });
  // Conta bloqueada pelo admin — trata como não autenticado.
  if (user?.disabled) return null;
  if (!user) return null;
  return { ...user, avatarUrl: publicAvatarUrl(user.avatarUrl) };
}

/**
 * Obtém o usuário atual a partir do cookie de sessão httpOnly (primário)
 * ou do Bearer token no header Authorization (fallback cross-origin).
 */
export async function getCurrentUser(req?: NextRequest): Promise<SelectedUser | null> {
  let token: string | null = null;

  // 1. Tentar via header Authorization: Bearer <token> no request direto
  //    (cross-origin fallback — ex.: preview URLs da Vercel)
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

  // 3. Fallback para cookie httpOnly (mecanismo primário em same-origin)
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE)?.value || null;
    } catch {
      // ignore
    }
  }

  if (!token) return null;

  const userId = verifySession(token);
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
