-- #4 FIX: Habilitar Row-Level Security em TODAS as tabelas do Supabase
-- Sem RLS, qualquer cliente com a anon key pode ler/modificar TODOS os dados.
-- Esta migration deve ser executada no Supabase SQL Editor.
-- Data: 2026-08-06

-- ═══════════════════════════════════════════════════════════════════
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SessionSet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutExercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BodyWeightLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgressPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LiveWorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlanItem" ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- 2. POLICIES — DADOS DO USUÁRIO (só dono lê/modifica)
-- ═══════════════════════════════════════════════════════════════════

-- User: cada usuário lê/atualiza apenas seu próprio registro
CREATE POLICY "Users can read own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- Workout: dono lê/modifica; templates são visíveis para todos
CREATE POLICY "Users can read own workouts or templates" ON "Workout"
  FOR SELECT USING (auth.uid()::text = "userId" OR "isTemplate" = true);
CREATE POLICY "Users can insert own workouts" ON "Workout"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own workouts" ON "Workout"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own workouts" ON "Workout"
  FOR DELETE USING (auth.uid()::text = "userId");

-- WorkoutSession: só dono
CREATE POLICY "Users can read own sessions" ON "WorkoutSession"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own sessions" ON "WorkoutSession"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own sessions" ON "WorkoutSession"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own sessions" ON "WorkoutSession"
  FOR DELETE USING (auth.uid()::text = "userId");

-- SessionSet: acessível via sessão do dono
CREATE POLICY "Users can read own sets" ON "SessionSet"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "WorkoutSession" WHERE "WorkoutSession".id = "SessionSet"."sessionId" AND "WorkoutSession"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can insert own sets" ON "SessionSet"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "WorkoutSession" WHERE "WorkoutSession".id = "SessionSet"."sessionId" AND "WorkoutSession"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can update own sets" ON "SessionSet"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "WorkoutSession" WHERE "WorkoutSession".id = "SessionSet"."sessionId" AND "WorkoutSession"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can delete own sets" ON "SessionSet"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "WorkoutSession" WHERE "WorkoutSession".id = "SessionSet"."sessionId" AND "WorkoutSession"."userId" = auth.uid()::text)
  );

-- Favorite: só dono
CREATE POLICY "Users can read own favorites" ON "Favorite"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own favorites" ON "Favorite"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own favorites" ON "Favorite"
  FOR DELETE USING (auth.uid()::text = "userId");

-- BodyWeightLog: só dono
CREATE POLICY "Users can read own bodyweight logs" ON "BodyWeightLog"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own bodyweight logs" ON "BodyWeightLog"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own bodyweight logs" ON "BodyWeightLog"
  FOR DELETE USING (auth.uid()::text = "userId");

-- ProgressPhoto: só dono
CREATE POLICY "Users can read own progress photos" ON "ProgressPhoto"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own progress photos" ON "ProgressPhoto"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own progress photos" ON "ProgressPhoto"
  FOR DELETE USING (auth.uid()::text = "userId");

-- LiveWorkoutSession: só dono
CREATE POLICY "Users can read own live sessions" ON "LiveWorkoutSession"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own live sessions" ON "LiveWorkoutSession"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own live sessions" ON "LiveWorkoutSession"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own live sessions" ON "LiveWorkoutSession"
  FOR DELETE USING (auth.uid()::text = "userId");

-- DailyLog: só dono
CREATE POLICY "Users can read own daily logs" ON "DailyLog"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own daily logs" ON "DailyLog"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own daily logs" ON "DailyLog"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- WorkoutExercise: acessível via workout do dono
CREATE POLICY "Users can read own workout exercises" ON "WorkoutExercise"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "Workout" WHERE "Workout".id = "WorkoutExercise"."workoutId" AND ("Workout"."userId" = auth.uid()::text OR "Workout"."isTemplate" = true))
  );
CREATE POLICY "Users can insert own workout exercises" ON "WorkoutExercise"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "Workout" WHERE "Workout".id = "WorkoutExercise"."workoutId" AND "Workout"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can update own workout exercises" ON "WorkoutExercise"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "Workout" WHERE "Workout".id = "WorkoutExercise"."workoutId" AND "Workout"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can delete own workout exercises" ON "WorkoutExercise"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "Workout" WHERE "Workout".id = "WorkoutExercise"."workoutId" AND "Workout"."userId" = auth.uid()::text)
  );

-- ═══════════════════════════════════════════════════════════════════
-- 3. POLICIES — DADOS PÚBLICOS (leitura para todos autenticados)
-- ═══════════════════════════════════════════════════════════════════

-- Exercise: leitura pública para todos autenticados
CREATE POLICY "Authenticated users can read exercises" ON "Exercise"
  FOR SELECT USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════
-- 4. POLICIES — GRUPOS (membros podem ler; dono pode modificar)
-- ═══════════════════════════════════════════════════════════════════

CREATE POLICY "Users can read groups they belong to" ON "Group"
  FOR SELECT USING (
    auth.uid()::text = "ownerId" OR
    EXISTS (SELECT 1 FROM "GroupMember" WHERE "GroupMember"."groupId" = id AND "GroupMember"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can create groups" ON "Group"
  FOR INSERT WITH CHECK (auth.uid()::text = "ownerId");
CREATE POLICY "Owners can update groups" ON "Group"
  FOR UPDATE USING (auth.uid()::text = "ownerId");
CREATE POLICY "Owners can delete groups" ON "Group"
  FOR DELETE USING (auth.uid()::text = "ownerId");

CREATE POLICY "Members can read group members" ON "GroupMember"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "Group" WHERE "Group".id = "GroupMember"."groupId" AND ("Group"."ownerId" = auth.uid()::text OR EXISTS (SELECT 1 FROM "GroupMember" gm WHERE gm."groupId" = "GroupMember"."groupId" AND gm."userId" = auth.uid()::text)))
  );
CREATE POLICY "Users can insert group membership" ON "GroupMember"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Owners or self can delete membership" ON "GroupMember"
  FOR DELETE USING (
    auth.uid()::text = "userId" OR
    EXISTS (SELECT 1 FROM "Group" WHERE "Group".id = "GroupMember"."groupId" AND "Group"."ownerId" = auth.uid()::text)
  );

-- ═══════════════════════════════════════════════════════════════════
-- 5. POLICIES — ADMIN (service_role bypassa RLS automaticamente)
-- ═══════════════════════════════════════════════════════════════════

-- AuditLog: apenas admin pode ler (via service_role no backend)
CREATE POLICY "Service role can read audit logs" ON "AuditLog"
  FOR SELECT USING (auth.role() = 'service_role');

-- RateLimitAttempt: apenas service_role
CREATE POLICY "Service role can manage rate limits" ON "RateLimitAttempt"
  FOR ALL USING (auth.role() = 'service_role');

-- WorkoutPlan / WorkoutPlanItem: dono ou admin
CREATE POLICY "Users can read own plans" ON "WorkoutPlan"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own plans" ON "WorkoutPlan"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own plans" ON "WorkoutPlan"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own plans" ON "WorkoutPlan"
  FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can read own plan items" ON "WorkoutPlanItem"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "WorkoutPlan" WHERE "WorkoutPlan".id = "WorkoutPlanItem"."planId" AND "WorkoutPlan"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can insert own plan items" ON "WorkoutPlanItem"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "WorkoutPlan" WHERE "WorkoutPlan".id = "WorkoutPlanItem"."planId" AND "WorkoutPlan"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can update own plan items" ON "WorkoutPlanItem"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "WorkoutPlan" WHERE "WorkoutPlan".id = "WorkoutPlanItem"."planId" AND "WorkoutPlan"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can delete own plan items" ON "WorkoutPlanItem"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "WorkoutPlan" WHERE "WorkoutPlan".id = "WorkoutPlanItem"."planId" AND "WorkoutPlan"."userId" = auth.uid()::text)
  );

-- ═══════════════════════════════════════════════════════════════════
-- 6. CONSTRAINT: Role CHECK (#28 FIX)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE "User" ADD CONSTRAINT "User_role_check"
  CHECK ("role" IN ('user', 'admin', 'support'));
