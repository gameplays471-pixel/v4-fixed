-- ============================================================================
-- GEMgym — Base de alunos fictícios para testes
-- Senha de TODOS: 12345678
-- Login: aluno1@aluno.com … aluno10@aluno.com
--
-- Pré-requisito: tabela Exercise já populada (seed do app).
-- Idempotente: ON CONFLICT DO NOTHING / reutiliza IDs fixos seed_aluno_XX
-- ============================================================================

-- bcrypt de "12345678" (cost 10)
-- $2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS

BEGIN;

-- ── Usuários ──────────────────────────────────────────────────────────────
INSERT INTO "User" (
  "id", "email", "name", "phone", "passwordHash",
  "bio", "weight", "height", "sex", "birthDate", "goal",
  "role", "disabled", "gameEnabled", "waterGoalMl", "weeklyWorkoutGoal",
  "createdAt", "updatedAt"
) VALUES
('seed_aluno_01', 'aluno1@aluno.com',  'Ana Souza',      '11990000001', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluna demo 1', 62.5, 165, 'F', '1995-03-12', 'Emagrecimento', 'user', false, true, 2000, 3, NOW() - INTERVAL '40 days', NOW()),
('seed_aluno_02', 'aluno2@aluno.com',  'Bruno Lima',     '11990000002', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluno demo 2', 82.0, 178, 'M', '1992-07-21', 'Hipertrofia', 'user', false, true, 2500, 4, NOW() - INTERVAL '35 days', NOW()),
('seed_aluno_03', 'aluno3@aluno.com',  'Carla Mendes',   '11990000003', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluna demo 3', 58.0, 160, 'F', '1998-11-05', 'Hipertrofia', 'user', false, false, 2000, 3, NOW() - INTERVAL '30 days', NOW()),
('seed_aluno_04', 'aluno4@aluno.com',  'Diego Rocha',    '11990000004', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluno demo 4', 90.0, 182, 'M', '1989-01-18', 'Emagrecimento', 'user', false, true, 3000, 5, NOW() - INTERVAL '28 days', NOW()),
('seed_aluno_05', 'aluno5@aluno.com',  'Elena Castro',   '11990000005', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluna demo 5', 70.0, 170, 'F', '1994-09-30', 'Emagrecimento', 'user', false, true, 2200, 3, NOW() - INTERVAL '25 days', NOW()),
('seed_aluno_06', 'aluno6@aluno.com',  'Felipe Nunes',   '11990000006', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluno demo 6', 75.5, 175, 'M', '1996-04-14', 'Hipertrofia', 'user', false, true, 2500, 4, NOW() - INTERVAL '20 days', NOW()),
('seed_aluno_07', 'aluno7@aluno.com',  'Gabriela Pinto', '11990000007', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluna demo 7', 55.0, 158, 'F', '2000-02-22', 'Hipertrofia', 'user', false, false, 2000, 3, NOW() - INTERVAL '18 days', NOW()),
('seed_aluno_08', 'aluno8@aluno.com',  'Henrique Alves', '11990000008', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluno demo 8', 95.0, 185, 'M', '1987-12-01', 'Emagrecimento', 'user', false, true, 2800, 4, NOW() - INTERVAL '15 days', NOW()),
('seed_aluno_09', 'aluno9@aluno.com',  'Isabela Freitas','11990000009', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluna demo 9', 64.0, 168, 'F', '1997-06-08', 'Emagrecimento', 'user', false, true, 2000, 3, NOW() - INTERVAL '12 days', NOW()),
('seed_aluno_10','aluno10@aluno.com', 'João Pedro',     '11990000010', '$2b$10$8qwaGT5uf9nSC1rQDPiAPOvC0tZPSNo37G4ggraoDj3AdBlXJNeOS',
 'Aluno demo 10', 78.0, 176, 'M', '1993-08-19', 'Hipertrofia', 'user', false, true, 2500, 4, NOW() - INTERVAL '10 days', NOW())
ON CONFLICT ("email") DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "name" = EXCLUDED."name",
  "disabled" = false,
  "updatedAt" = NOW();

-- Garante IDs estáveis se o e-mail já existia com outro id
-- (opcional: não mexe se conflito de PK)

-- ── Helper: pega exercise id por slug ──────────────────────────────────────
-- Usado nas CTEs abaixo

-- ── Treinos (1 por aluno)
DELETE FROM "SessionSet" WHERE "id" LIKE 'seed_ss_%';
DELETE FROM "WorkoutSession" WHERE "id" LIKE 'seed_ws_%';
DELETE FROM "WorkoutExercise" WHERE "id" LIKE 'seed_we_%';
DELETE FROM "Workout" WHERE "id" LIKE 'seed_w_%';

INSERT INTO "Workout" (
  "id", "userId", "name", "description", "defaultRest", "color",
  "isTemplate", "createdAt", "updatedAt"
)
SELECT * FROM (VALUES
  ('seed_w_01', (SELECT "id" FROM "User" WHERE "email" = 'aluno1@aluno.com'),  'Full Body A — Ana',     'Treino demo full body', 90, '#10b981', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_02', (SELECT "id" FROM "User" WHERE "email" = 'aluno2@aluno.com'),  'Push — Bruno',          'Peito ombro tríceps',   90, '#3b82f6', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_03', (SELECT "id" FROM "User" WHERE "email" = 'aluno3@aluno.com'),  'Inferiores — Carla',    'Foco pernas e glúteo', 90, '#8b5cf6', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_04', (SELECT "id" FROM "User" WHERE "email" = 'aluno4@aluno.com'),  'Emagrecimento — Diego', 'Circuito + cardio',     90, '#f59e0b', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_05', (SELECT "id" FROM "User" WHERE "email" = 'aluno5@aluno.com'),  'Superior — Elena',      'Puxar e empurrar',      90, '#ec4899', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_06', (SELECT "id" FROM "User" WHERE "email" = 'aluno6@aluno.com'),  'Hipertrofia A — Felipe','Volume moderado',       90, '#3b82f6', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_07', (SELECT "id" FROM "User" WHERE "email" = 'aluno7@aluno.com'),  'Glúteo & posterior',    'Foco posterior',        90, '#8b5cf6', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_08', (SELECT "id" FROM "User" WHERE "email" = 'aluno8@aluno.com'),  'Queima — Henrique',     'Full body metabólico',  90, '#ef4444', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_09', (SELECT "id" FROM "User" WHERE "email" = 'aluno9@aluno.com'),  'Iniciante — Isabela',   'Adaptação',             90, '#10b981', false, NOW() - INTERVAL '7 days', NOW()),
  ('seed_w_10', (SELECT "id" FROM "User" WHERE "email" = 'aluno10@aluno.com'), 'Pull — João',           'Costas e bíceps',       90, '#3b82f6', false, NOW() - INTERVAL '7 days', NOW())
) AS t("id","userId","name","description","defaultRest","color","isTemplate","createdAt","updatedAt")
WHERE t."userId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

-- ── Exercícios nos treinos (3 cada) ───────────────────────────────────────
DELETE FROM "WorkoutExercise" WHERE "id" LIKE 'seed_we_%';

INSERT INTO "WorkoutExercise" (
  "id", "workoutId", "exerciseId", "order", "targetSets", "targetReps", "restSeconds"
)
SELECT
  'seed_we_' || w.wn || '_' || o.ord,
  w.wid,
  e.id,
  o.ord,
  3,
  10,
  90
FROM (VALUES
  ('01', 'seed_w_01', 'agachamento-livre-barra', 1),
  ('01', 'seed_w_01', 'supino-reto-halteres', 2),
  ('01', 'seed_w_01', 'remada-halter-serrote', 3),
  ('02', 'seed_w_02', 'supino-reto-barra', 1),
  ('02', 'seed_w_02', 'desenvolvimento-halteres', 2),
  ('02', 'seed_w_02', 'flexao-braco', 3),
  ('03', 'seed_w_03', 'agachamento-goblet', 1),
  ('03', 'seed_w_03', 'elevacao-pelvica-hip-thrust', 2),
  ('03', 'seed_w_03', 'afundo-lunge', 3),
  ('04', 'seed_w_04', 'agachamento-livre-barra', 1),
  ('04', 'seed_w_04', 'remada-curvada-barra', 2),
  ('04', 'seed_w_04', 'prancha', 3),
  ('05', 'seed_w_05', 'puxada-frontal', 1),
  ('05', 'seed_w_05', 'supino-inclinado-halteres', 2),
  ('05', 'seed_w_05', 'elevacao-lateral-halteres', 3),
  ('06', 'seed_w_06', 'supino-reto-barra', 1),
  ('06', 'seed_w_06', 'remada-curvada-barra', 2),
  ('06', 'seed_w_06', 'agachamento-livre-barra', 3),
  ('07', 'seed_w_07', 'elevacao-pelvica-hip-thrust', 1),
  ('07', 'seed_w_07', 'agachamento-goblet', 2),
  ('07', 'seed_w_07', 'afundo-lunge', 3),
  ('08', 'seed_w_08', 'agachamento-livre-barra', 1),
  ('08', 'seed_w_08', 'flexao-braco', 2),
  ('08', 'seed_w_08', 'remada-halter-serrote', 3),
  ('09', 'seed_w_09', 'agachamento-goblet', 1),
  ('09', 'seed_w_09', 'flexao-inclinada', 2),
  ('09', 'seed_w_09', 'remada-halter-serrote', 3),
  ('10', 'seed_w_10', 'puxada-frontal', 1),
  ('10', 'seed_w_10', 'remada-curvada-barra', 2),
  ('10', 'seed_w_10', 'barra-fixa', 3)
) AS x(wn, wid, slug, ord)
JOIN "Exercise" e ON e.slug = x.slug
JOIN "Workout" w ON w.id = x.wid
ON CONFLICT DO NOTHING;

-- ── Sessões recentes (2 por aluno) ────────────────────────────────────────
DELETE FROM "SessionSet" WHERE "id" LIKE 'seed_ss_%';
DELETE FROM "WorkoutSession" WHERE "id" LIKE 'seed_ws_%';

INSERT INTO "WorkoutSession" (
  "id", "userId", "workoutId", "workoutName",
  "startedAt", "endedAt", "durationSec", "totalVolume", "notes"
)
SELECT
  'seed_ws_' || n.n || '_' || d.day,
  u."id",
  w."id",
  w."name",
  NOW() - (d.day || ' days')::INTERVAL - INTERVAL '1 hour',
  NOW() - (d.day || ' days')::INTERVAL,
  3200 + (n.n::int * 30),
  2500 + (n.n::int * 100) + (d.day * 50),
  'Sessão demo seed'
FROM generate_series(1, 10) AS n(n)
JOIN "User" u ON u."email" = 'aluno' || n.n || '@aluno.com'
JOIN "Workout" w ON w."id" = 'seed_w_' || lpad(n.n::text, 2, '0')
CROSS JOIN (VALUES (1), (3)) AS d(day);

-- Sets (2 exercícios × 3 séries) por sessão — usa primeiros exercícios do treino
INSERT INTO "SessionSet" (
  "id", "sessionId", "exerciseId", "exerciseName",
  "setNumber", "weight", "reps", "restSeconds", "isPR"
)
SELECT
  'seed_ss_' || ws."id" || '_' || we."order" || '_' || s.setn,
  ws."id",
  we."exerciseId",
  e."name",
  s.setn,
  20 + (we."order" * 5) + s.setn * 2.5,
  10 - s.setn + 1,
  90,
  (s.setn = 1 AND we."order" = 1)
FROM "WorkoutSession" ws
JOIN "WorkoutExercise" we ON we."workoutId" = ws."workoutId" AND we."order" <= 2
JOIN "Exercise" e ON e."id" = we."exerciseId"
CROSS JOIN (VALUES (1), (2), (3)) AS s(setn)
WHERE ws."id" LIKE 'seed_ws_%';

COMMIT;

-- Verificação rápida
SELECT "email", "name", "goal" FROM "User" WHERE "email" LIKE 'aluno%@aluno.com' ORDER BY "email";
SELECT COUNT(*) AS workouts_seed FROM "Workout" WHERE "id" LIKE 'seed_w_%';
SELECT COUNT(*) AS sessions_seed FROM "WorkoutSession" WHERE "id" LIKE 'seed_ws_%';
