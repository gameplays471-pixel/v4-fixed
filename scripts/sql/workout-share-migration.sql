-- Migração manual para link público de compartilhamento de treino
-- (permite ver um treino sem login e cloná-lo pra própria conta).
-- Rodar direto no SQL Editor do Supabase (não precisa de shell/CLI).
-- Idempotente: pode rodar mais de uma vez sem erro.

ALTER TABLE "Workout"
  ADD COLUMN IF NOT EXISTS "shareSlug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Workout_shareSlug_key"
  ON "Workout" ("shareSlug");
