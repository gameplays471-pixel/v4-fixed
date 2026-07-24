-- Cria a tabela RateLimitAttempt usada por src/lib/rate-limit.ts para
-- limitar tentativas de login/signup (rate limiting por IP e por e-mail).
-- Equivalente ao que `prisma db push` geraria a partir do schema.prisma —
-- pode rodar direto no SQL editor do Supabase.
--
-- Idempotente: seguro rodar mais de uma vez (não falha se já existir).

CREATE TABLE IF NOT EXISTS "RateLimitAttempt" (
  "id"        TEXT NOT NULL,
  "key"       TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RateLimitAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RateLimitAttempt_key_createdAt_idx"
  ON "RateLimitAttempt" ("key", "createdAt");
