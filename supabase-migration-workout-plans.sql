-- Planos semanais (WorkoutPlan + WorkoutPlanItem)
-- Rode no Supabase → SQL Editor DEPOIS de supabase-migration-workout-templates.sql

CREATE TABLE IF NOT EXISTS "WorkoutPlan" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
  "isTemplate" BOOLEAN NOT NULL DEFAULT false,
  "templateGoal" TEXT,
  "templateSex" TEXT,
  "templateLevel" TEXT,
  "fromTemplateId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");
CREATE INDEX IF NOT EXISTS "WorkoutPlan_isTemplate_idx" ON "WorkoutPlan"("isTemplate");
CREATE INDEX IF NOT EXISTS "WorkoutPlan_userId_isTemplate_idx" ON "WorkoutPlan"("userId", "isTemplate");

CREATE TABLE IF NOT EXISTS "WorkoutPlanItem" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "suggestedWeekday" INTEGER,
  "workoutId" TEXT NOT NULL REFERENCES "Workout"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutPlanItem_planId_order_key" ON "WorkoutPlanItem"("planId", "order");
CREATE INDEX IF NOT EXISTS "WorkoutPlanItem_planId_idx" ON "WorkoutPlanItem"("planId");
CREATE INDEX IF NOT EXISTS "WorkoutPlanItem_workoutId_idx" ON "WorkoutPlanItem"("workoutId");
