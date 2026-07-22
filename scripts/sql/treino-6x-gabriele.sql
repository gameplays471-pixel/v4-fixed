-- Insere o "Treino 6x por Semana" (emagrecimento) para a usuária
-- Gabriele Goncalves (gabsmg10@outlook.com, id cmrtb6h5t000fl504zn0k9vaz).
--
-- Observações de mapeamento (exercícios do PDF sem equivalente exato
-- cadastrado na base — usei o mais próximo disponível):
--   • "Remada Articulada" (Treino B) -> usei "Remada Curvada com Barra"
--     como aproximação. Se vocês tiverem/cadastrarem uma remada articulada
--     específica depois, é só trocar o slug abaixo.
--   • "Abdominal Máquina" (Treino B) -> usei "Abdominal na Polia (Crunch)".
--   • "Leg Press (Pés Altos)" (Treino E) -> usei o mesmo "Leg Press 45°",
--     com a observação "pés altos" no campo notes.
--   • "Prancha – 3x40s" (Treino D) é por tempo, não repetições — usei
--     targetReps=40 só como número, mas o texto em notes deixa claro que
--     é em segundos.
--   • Faixas de repetição (ex: "8-10") foram salvas como o valor mínimo em
--     targetReps, com a faixa completa preservada em notes.

DO $$
DECLARE
  v_user_id text := 'cmrtb6h5t000fl504zn0k9vaz';
  v_workout_id text;
BEGIN

  -- ============ TREINO A – Quadríceps ============
  v_workout_id := gen_random_uuid()::text;
  INSERT INTO "Workout" (id, "userId", name, description, "defaultRest", color, "createdAt", "updatedAt")
  VALUES (v_workout_id, v_user_id, 'Treino A – Quadríceps', 'Treino 6x/semana - foco em emagrecimento', 90, '#ef4444', now(), now());

  INSERT INTO "WorkoutExercise" (id, "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds", notes, "targetDurationSec", "targetDistanceKm", "targetIntensity")
  VALUES
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='agachamento-livre-barra'), 1, 4, 8, 90, '8-10 reps', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='leg-press-45'), 2, 4, 10, 90, '10-12 reps', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='hack-machine'), 3, 3, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='agachamento-bulgaro'), 4, 3, 10, 90, '10 reps cada perna', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='cadeira-extensora'), 5, 3, 12, 60, '12-15 reps · última série Drop Set', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='cadeira-abdutora'), 6, 4, 15, 60, '15-20 reps', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='panturrilha-pe'), 7, 4, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='corrida-esteira'), 8, 1, 1, 0, '6,0–6,5 km/h · Inclinação 5%', 1800, NULL, 'Moderada');

  -- ============ TREINO B – Costas ============
  v_workout_id := gen_random_uuid()::text;
  INSERT INTO "Workout" (id, "userId", name, description, "defaultRest", color, "createdAt", "updatedAt")
  VALUES (v_workout_id, v_user_id, 'Treino B – Costas', 'Treino 6x/semana - foco em emagrecimento', 90, '#3b82f6', now(), now());

  INSERT INTO "WorkoutExercise" (id, "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds", notes, "targetDurationSec", "targetDistanceKm", "targetIntensity")
  VALUES
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='puxada-frontal'), 1, 4, 10, 90, 'Pegada pronada', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='remada-baixa-polia'), 2, 4, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='remada-curvada-barra'), 3, 3, 10, 90, 'Aproximação de "Remada Articulada" (sem equivalente exato cadastrado)', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='pulldown-pulley'), 4, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='face-pull'), 5, 3, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='rosca-direta-barra'), 6, 3, 10, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='rosca-martelo'), 7, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='abdominal-polia'), 8, 3, 15, 60, 'Abdominal na máquina/polia', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='bicicleta-ergometrica'), 9, 1, 1, 0, 'Resistência média · 80–90 RPM', 1800, NULL, 'Moderada');

  -- ============ TREINO C – Posterior + Glúteos ============
  v_workout_id := gen_random_uuid()::text;
  INSERT INTO "Workout" (id, "userId", name, description, "defaultRest", color, "createdAt", "updatedAt")
  VALUES (v_workout_id, v_user_id, 'Treino C – Posterior + Glúteos', 'Treino 6x/semana - foco em emagrecimento', 90, '#10b981', now(), now());

  INSERT INTO "WorkoutExercise" (id, "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds", notes, "targetDurationSec", "targetDistanceKm", "targetIntensity")
  VALUES
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='terra-romeno-barra'), 1, 4, 8, 90, '8-10 reps', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='mesa-flexora'), 2, 4, 10, 90, '10-12 reps', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='elevacao-pelvica-hip-thrust'), 3, 4, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='stiff-halteres'), 4, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='cadeira-flexora-sentada'), 5, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='gluteo-cabo-coice'), 6, 3, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='panturrilha-sentada'), 7, 4, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='corrida-esteira'), 8, 1, 1, 0, 'HIIT: alterna 1 min a 5 km/h com 1 min a 7 km/h', 1200, NULL, 'Intensa');

  -- ============ TREINO D – Peito + Ombros + Tríceps ============
  v_workout_id := gen_random_uuid()::text;
  INSERT INTO "Workout" (id, "userId", name, description, "defaultRest", color, "createdAt", "updatedAt")
  VALUES (v_workout_id, v_user_id, 'Treino D – Peito + Ombros + Tríceps', 'Treino 6x/semana - foco em emagrecimento', 90, '#f59e0b', now(), now());

  INSERT INTO "WorkoutExercise" (id, "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds", notes, "targetDurationSec", "targetDistanceKm", "targetIntensity")
  VALUES
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='press-peito-maquina'), 1, 4, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='supino-inclinado-halteres'), 2, 3, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='peck-deck-maquina'), 3, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='desenvolvimento-halteres'), 4, 4, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='elevacao-lateral-halteres'), 5, 3, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='triceps-corda'), 6, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='triceps-frances'), 7, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='prancha-plank'), 8, 3, 40, 45, '40 segundos por série (não repetições)', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='bicicleta-ergometrica'), 9, 1, 1, 0, 'Resistência média', 2100, NULL, 'Moderada');

  -- ============ TREINO E – Glúteos + Pernas ============
  v_workout_id := gen_random_uuid()::text;
  INSERT INTO "Workout" (id, "userId", name, description, "defaultRest", color, "createdAt", "updatedAt")
  VALUES (v_workout_id, v_user_id, 'Treino E – Glúteos + Pernas', 'Treino 6x/semana - foco em emagrecimento', 90, '#8b5cf6', now(), now());

  INSERT INTO "WorkoutExercise" (id, "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds", notes, "targetDurationSec", "targetDistanceKm", "targetIntensity")
  VALUES
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='elevacao-pelvica-hip-thrust'), 1, 4, 8, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='agachamento-sumo-halter'), 2, 4, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='leg-press-45'), 3, 3, 12, 60, 'Pés altos na plataforma', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='afundo-lunge'), 4, 3, 12, 60, '12 reps cada perna, caminhando', NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='cadeira-abdutora'), 5, 4, 20, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='mesa-flexora'), 6, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='panturrilha-leg-press'), 7, 4, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='corrida-esteira'), 8, 1, 1, 0, 'Inclinação 7% · 5,8–6,2 km/h', 1800, NULL, 'Moderada');

  -- ============ TREINO F – Costas + Bíceps + Ombros ============
  v_workout_id := gen_random_uuid()::text;
  INSERT INTO "Workout" (id, "userId", name, description, "defaultRest", color, "createdAt", "updatedAt")
  VALUES (v_workout_id, v_user_id, 'Treino F – Costas + Bíceps + Ombros', 'Treino 6x/semana - foco em emagrecimento', 90, '#06b6d4', now(), now());

  INSERT INTO "WorkoutExercise" (id, "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds", notes, "targetDurationSec", "targetDistanceKm", "targetIntensity")
  VALUES
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='puxada-neutra'), 1, 4, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='remada-unilateral-halter'), 2, 3, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='remada-t-bar'), 3, 3, 10, 90, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='pullover-polia-alta'), 4, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='elevacao-lateral-halteres'), 5, 3, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='rosca-scott'), 6, 3, 10, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='rosca-alternada'), 7, 3, 12, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='abdominal-infra'), 8, 3, 15, 60, NULL, NULL, NULL, NULL),
  (gen_random_uuid()::text, v_workout_id, (SELECT id FROM "Exercise" WHERE slug='bicicleta-ergometrica'), 9, 1, 1, 0, 'Resistência moderada · 80–90 RPM', 1800, NULL, 'Moderada');

END $$;
