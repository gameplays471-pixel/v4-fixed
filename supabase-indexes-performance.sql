-- GEMgym — índices de performance (Supabase)
CREATE INDEX IF NOT EXISTS "WorkoutSession_userId_startedAt_idx"
  ON "WorkoutSession" ("userId", "startedAt" DESC);
CREATE INDEX IF NOT EXISTS "SessionSet_exerciseId_weight_idx"
  ON "SessionSet" ("exerciseId", "weight" DESC);
CREATE INDEX IF NOT EXISTS "SessionSet_isPR_true_idx"
  ON "SessionSet" ("sessionId") WHERE "isPR" = true;
CREATE INDEX IF NOT EXISTS "WorkoutExercise_exerciseId_idx"
  ON "WorkoutExercise" ("exerciseId");
CREATE INDEX IF NOT EXISTS "Exercise_muscleGroup_idx" ON "Exercise" ("muscleGroup");
CREATE INDEX IF NOT EXISTS "Exercise_category_idx" ON "Exercise" ("category");
CREATE INDEX IF NOT EXISTS "Exercise_level_idx" ON "Exercise" ("level");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User" ("role");
CREATE INDEX IF NOT EXISTS "User_disabled_idx" ON "User" ("disabled");
CREATE INDEX IF NOT EXISTS "Workout_userId_isTemplate_idx"
  ON "Workout" ("userId", "isTemplate");
CREATE INDEX IF NOT EXISTS "Workout_isTemplate_idx" ON "Workout" ("isTemplate");
