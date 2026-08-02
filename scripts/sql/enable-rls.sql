-- Habilita Row Level Security em todas as tabelas do schema `public`,
-- sem nenhuma política de acesso. Rode direto no SQL editor do Supabase.
--
-- Por que isso é seguro pra esse projeto:
-- O app inteiro fala com o banco só via Prisma, usando a connection string
-- do pooler (usuário `postgres.[ref]`) — esse é o role "postgres" do
-- Supabase, que tem BYPASSRLS por padrão e não é afetado por RLS de jeito
-- nenhum, com ou sem política. Nenhuma rota, nenhuma query do app muda de
-- comportamento com isso.
--
-- O que isso fecha: o Supabase expõe automaticamente todo o schema
-- `public` via API REST (PostgREST) em
-- https://[seu-projeto].supabase.co/rest/v1/... — protegida só pela
-- `anon key`, que não é secreta por design (é feita pra rodar no
-- navegador). RLS é a única coisa que decide o que essa chave pode
-- ler/escrever. Habilitar RLS SEM nenhuma política = negar tudo por
-- padrão pra quem entra por esse caminho (roles `anon` e `authenticated`
-- do Postgres, que já existem por padrão em todo projeto Supabase — não
-- precisa criar nada). Como o app não usa `supabase-js`/PostgREST em
-- lugar nenhum, isso não tira nenhuma funcionalidade, só fecha uma porta
-- que hoje está destrancada.
--
-- Tabelas com dados sensíveis de verdade (email, passwordHash, telefone,
-- peso/altura, data de nascimento) estão marcadas abaixo.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;                  -- PII: email, passwordHash, phone, weight, height, sex, birthDate
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutExercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SessionSet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BodyWeightLog" ENABLE ROW LEVEL SECURITY;          -- dado sensível: peso corporal
ALTER TABLE "ProgressPhoto" ENABLE ROW LEVEL SECURITY;          -- dado sensível: fotos de progresso (URL)
ALTER TABLE "LiveWorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitAttempt" ENABLE ROW LEVEL SECURITY;

-- Tabela interna do Prisma (histórico de migrations) — também fica no
-- schema `public`, também vale fechar.
ALTER TABLE IF EXISTS "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Reforço opcional (defesa em profundidade): revoga explicitamente os
-- privilégios de tabela dos roles `anon`/`authenticated`, além do RLS.
-- Redundante com o RLS acima (que já nega tudo sem política), mas não
-- custa nada e blinda contra o caso de alguém criar uma política solta
-- no futuro sem perceber que ela abriria acesso de verdade.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Verificação: lista qualquer tabela em `public` que ainda esteja sem RLS
-- (a query deve devolver 0 linhas depois de rodar o script acima).
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
