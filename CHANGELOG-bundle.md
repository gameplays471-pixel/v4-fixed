# GEMgym — pacote consolidado

## Features novas
- **Planos semanais**: templates 3×/semana, atribuição admin, progresso % no dashboard
- **Progressão automática**: ao finalizar, sugere +2,5 kg / +1 rep (carga, reps, RIR)
- **Gráfico de carga**: histórico peso×data por exercício no modal do histórico

## Já incluído antes
- Atribuição de treinos pré-setados
- Performance (stats SQL, PR batch, sessions leves, admin users, avatars Blob)
- Fix build `never[]` e history SessionListItem

## SQL no Supabase (ordem)
1. `supabase-migration-workout-templates.sql` (isTemplate nas colunas Workout)
2. `supabase-migration-workout-plans.sql` (tabelas WorkoutPlan / WorkoutPlanItem)
3. `supabase-indexes-performance.sql` (opcional)

## Fluxo admin planos
1. Atribuição de treinos → Criar pré-setados
2. Planos semanais → Criar planos pré-setados
3. Selecionar plano(s) + aluno → Atribuir
