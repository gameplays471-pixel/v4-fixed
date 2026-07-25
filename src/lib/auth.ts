// Sistema de autenticação híbrido: Bearer token (header) + cookie fallback
//
// Senha: hash com bcrypt (salt único por senha + custo computacional
// ajustável), o que inviabiliza rainbow tables e torna brute force caro.
// Hashes antigos (sha256 sem salt, ou até senha em texto puro de contas
// demo) continuam sendo aceitos só para não deslogar ninguém — são
// automaticamente re-hasheados com bcrypt no próximo login bem-sucedido
// (ver `needsRehash` + uso em src/app/api/auth/login/route.ts).
//
// Sessão: token assinado no formato JWT (HS256) usando HMAC-SHA256 com
// SESSION_SECRET (env). Isso impede que alguém forje um token só sabendo o
// `id` (cuid) de outro usuário: a assinatura só pode ser gerada por quem
// conhece o segredo do servidor, e é validada com comparação em tempo
// constante (crypto.timingSafeEqual) para evitar timing attacks. O token
// também carrega expiração (`exp`), então sessões antigas param de
// funcionar sozinhas mesmo sem revogação explícita.

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "gemgym_session";
export const TOKEN_LOCALSTORAGE_KEY = "gemgym_token";
const SESSION_EXPIRY_DAYS = 30;
const SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_DAYS * 24 * 60 * 60;

// ─── Segredo de assinatura ─────────────────────────────────────────────────
// Obrigatório em produção. Em desenvolvimento, cai para um valor fixo (com
// aviso no console) só para não travar o `next dev` de quem ainda não
// configurou o .env — nunca use esse fallback em produção.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET não configurado (ou muito curto). Defina uma variável de ambiente SESSION_SECRET com pelo menos 32 caracteres aleatórios antes de rodar em produção."
    );
  }

  console.warn(
    "[auth] SESSION_SECRET não configurado — usando segredo de desenvolvimento inseguro. Configure SESSION_SECRET no .env antes de ir para produção."
  );
  return "dev-insecure-secret-do-not-use-in-production";
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
 * Suporta três formatos, dos mais novos para os mais antigos:
 *  1. bcrypt (`$2a$`/`$2b$`/`$2y$`) — formato atual, com salt e custo.
 *  2. sha256 legado (64 hex, sem salt) — formato antigo, mantido só p/ compat.
 *  3. texto puro legado — algumas contas demo antigas guardavam a senha direto.
 * Combine com `needsRehash` para migrar a conta pro formato novo no login.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compare(password, hash);
  }
  if (LEGACY_SHA256_RE.test(hash)) {
    return legacySha256(password) === hash;
  }
  // Texto puro legado — comparação simples é aceitável aqui pois esse
  // caminho só existe para compatibilidade com contas demo já criadas.
  return password === hash;
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
