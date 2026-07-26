-- Migração manual para o painel admin (role no User + tabela AuditLog).
-- Rodar direto no SQL Editor do Supabase (não precisa de shell/CLI).
-- Idempotente: pode rodar mais de uma vez sem erro, graças aos IF NOT EXISTS.

-- 1. Campo role no User -------------------------------------------------
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'user';

-- 2. Tabela AuditLog ------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"         TEXT NOT NULL,
  "actorId"    TEXT NOT NULL,
  "actorEmail" TEXT NOT NULL,
  "action"     TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId"   TEXT NOT NULL,
  "before"     TEXT,
  "after"      TEXT,
  "ip"         TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx"
  ON "AuditLog" ("entityType", "entityId");

CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx"
  ON "AuditLog" ("actorId");

CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx"
  ON "AuditLog" ("createdAt");

-- 3. Bootstrap do primeiro admin -----------------------------------------
-- Troque o e-mail abaixo pelo da sua conta e rode só esta linha
-- (pode descomentar e executar separado do resto, se preferir).
-- UPDATE "User" SET "role" = 'admin' WHERE "email" = 'seu@email.com';
