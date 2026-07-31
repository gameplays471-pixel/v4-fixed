-- Migração manual para transmissão ao vivo de treino (spectator mode).
-- Rodar direto no SQL Editor do Supabase. Idempotente.

CREATE TABLE IF NOT EXISTS "LiveWorkoutSession" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "workoutId"   TEXT NOT NULL,
  "workoutName" TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "startedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "snapshot"    TEXT NOT NULL,
  CONSTRAINT "LiveWorkoutSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LiveWorkoutSession_userId_key"
  ON "LiveWorkoutSession" ("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "LiveWorkoutSession_slug_key"
  ON "LiveWorkoutSession" ("slug");

DO $$ BEGIN
  ALTER TABLE "LiveWorkoutSession"
    ADD CONSTRAINT "LiveWorkoutSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
