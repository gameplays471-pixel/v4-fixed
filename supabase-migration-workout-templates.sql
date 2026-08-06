-- Templates de treino (atribuição no painel admin)
-- GEMgym — colunas novas em "Workout"
-- Rode no Supabase → SQL Editor

ALTER TABLE "Workout"
  ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "templateGoal" TEXT,
  ADD COLUMN IF NOT EXISTS "templateSex" TEXT,
  ADD COLUMN IF NOT EXISTS "templateLevel" TEXT;

CREATE INDEX IF NOT EXISTS "Workout_isTemplate_idx" ON "Workout" ("isTemplate");

COMMENT ON COLUMN "Workout"."isTemplate" IS 'true = template do admin; não aparece na lista do aluno';
COMMENT ON COLUMN "Workout"."templateGoal" IS 'emagrecimento | hipertrofia';
COMMENT ON COLUMN "Workout"."templateSex" IS 'M | F';
COMMENT ON COLUMN "Workout"."templateLevel" IS 'iniciante | intermediario';
