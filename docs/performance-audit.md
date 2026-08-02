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

## 2026-08-02 — Fix: `connection_limit=1` estava serializando tudo

- **Bug**: mini-game (água, criar/entrar em grupo) levando até ~15s e às
  vezes exigindo reload de página, mesmo com a resposta otimista da UI
  aparecendo na hora.
- **Causa**: `connection_limit=1` (item acima, 31/07) parte da premissa de
  "1 isolate serverless = 1 conexão". Esse app roda como processo Node
  único e persistente (`next dev` / `bun .next/standalone/server.js`), não
  uma isolate nova por request — então essa única conexão era compartilhada
  por TODAS as queries de TODOS os usuários/abas ao mesmo tempo,
  enfileiradas. A própria tela `/jogo` já dispara 3 queries em paralelo
  (summary, groups, ranking); sob qualquer concorrência a fila estourava o
  `pool_timeout` de 10s.
- **Fix**: `connection_limit` default subiu de `1` para `10` em
  `src/lib/db.ts` (override continua via `PRISMA_CONNECTION_LIMIT`).
- **Nota**: se este app um dia rodar em Vercel Functions de verdade (uma
  isolate por request), reavaliar esse número — mas nesse modelo o correto
  é medir concorrência real do pooler, não voltar para `1` sem motivo.
