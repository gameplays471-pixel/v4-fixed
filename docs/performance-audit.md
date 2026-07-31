# Auditoria de performance — GEMgym / Supabase

## Status

| # | Item | Status |
|---|------|--------|
| 1 | SQL de índices | ⏳ Rodar `supabase-indexes-performance.sql` |
| 2 | N+1 PR em POST /api/sessions | ✅ |
| 3 | GET /api/stats com agregações SQL | ✅ |
| 4 | GET /api/admin/users leve | ✅ |
| 5 | GET /api/exercises filtrado + select enxuto | ✅ |
| 6 | GET /api/sessions sem sets (detalhe sob demanda) | ✅ |
| 7 | Avatares só via Blob/URL (sem base64 no perfil) | ✅ |

## Feature: Atribuição de treinos

- Menu admin `/admin/atribuicao-treinos`
- Templates + seed de 8 treinos pré-setados
- SQL schema: `supabase-migration-workout-templates.sql`

## 2026-07-31 — Cursor, cache, pool, avatars

- `GET /api/sessions` cursor (`?cursor=&limit=20`, max 50) + histórico com infinite query
- React Query: exercises 10min, stats 2min, default 60s; sem refetch on focus
- `src/lib/db.ts`: `pgbouncer=true`, `connection_limit=1`, `pool_timeout=10` no pooler
- Script: `bun run migrate:avatars` / `migrate:avatars:upload`
