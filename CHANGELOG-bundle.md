# Pacote consolidado — GEMgym

## Inclui

### Feature: Atribuição de treinos (admin)
- Página `/admin/atribuicao-treinos`
- APIs templates / seed / assign
- 8 treinos pré-setados (emagrecimento/hipertrofia × M/F × iniciante/intermediário)
- Schema: `isTemplate`, `templateGoal`, `templateSex`, `templateLevel`
- SQL: `supabase-migration-workout-templates.sql`

### Performance
- PR em 1 query + isPR no create
- Stats agregadas no Postgres
- Exercícios filtrados no banco, payload leve
- Admin users sem overfetch de sessions/avatar
- Listagem de sessions sem sets; detalhe sob demanda
- Avatar só URL Blob; bloqueio de base64
- Índices: `supabase-indexes-performance.sql`

### Build fix
- Arrays tipados em assign-workouts e seed (evita `never[]` no tsc da Vercel)

## Deploy

1. Rodar no Supabase SQL Editor:
   - `supabase-migration-workout-templates.sql`
   - `supabase-indexes-performance.sql`
2. Deploy do código
3. Admin → Atribuição de treinos → Criar pré-setados
