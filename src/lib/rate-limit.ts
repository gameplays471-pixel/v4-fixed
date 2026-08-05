// Rate limiting simples baseado em contador no próprio banco (tabela
// RateLimitAttempt). Sem dependência externa (Redis/Upstash) — cada
// tentativa grava uma linha; se o número de linhas dentro da janela de
// tempo já atingiu o limite, a próxima tentativa é bloqueada (HTTP 429)
// até a janela deslizar.
//
// Isso é "sliding window log": preciso, mas gera 1 linha por tentativa.
// Para os volumes de tráfego de login/signup isso é irrelevante; as
// linhas expiradas são limpas automaticamente a cada checagem da mesma
// chave (ver `checkRateLimit`), então a tabela não cresce sem limite.

import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export interface RateLimitOptions {
  /** Máximo de tentativas permitidas dentro da janela. */
  limit: number;
  /** Duração da janela deslizante, em milissegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Tentativas restantes na janela atual (só informativo). */
  remaining: number;
  /** Segundos até a próxima tentativa ser permitida (0 se `allowed`). */
  retryAfterSec: number;
}

/**
 * Verifica e registra uma tentativa para `key`. Chame uma vez por
 * requisição, antes de processá-la — se `allowed` for false, retorne
 * 429 sem executar a lógica sensível (ex.: comparar senha).
 */
export async function checkRateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(now - opts.windowMs);

  // Limpa tentativas expiradas dessa chave — mantém a tabela pequena
  // sem precisar de um job de limpeza separado.
  await db.rateLimitAttempt.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });

  const count = await db.rateLimitAttempt.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= opts.limit) {
    const oldest = await db.rateLimitAttempt.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + opts.windowMs - now
      : opts.windowMs;

    return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  await db.rateLimitAttempt.create({ data: { key } });
  return { allowed: true, remaining: opts.limit - count - 1, retryAfterSec: 0 };
}

/**
 * Extrai o IP do cliente a partir dos headers de proxy usuais
 * (Vercel/qualquer proxy reverso preenche x-forwarded-for). Sem proxy
 * (ex.: dev local), cai para "unknown" — nesse caso todas as requisições
 * compartilham a mesma chave de rate limit, o que é aceitável em dev.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/** Resposta 429 padronizada, já com o header Retry-After. */
export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    { error: "Muitas tentativas. Tente novamente em instantes." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }
  );
}
