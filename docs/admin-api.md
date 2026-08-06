# Contratos das APIs Admin — GEMgym

Todas as rotas exigem sessão de usuário com `role=admin` (cookie ou `Authorization: Bearer`).

Erros: `{ "error": string, "requestId"?: string }` com status 4xx/5xx.

Validação de body: **Zod** (`src/lib/validation.ts` + schemas locais nas rotas).

---

## Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/users?search&role&status&sort&page&pageSize` | Lista paginada |
| GET | `/api/admin/users/[id]` | Detalhe + `report` (aderência, volume, PRs) |
| PUT | `/api/admin/users/[id]` | `{ email?, name?, role?, disabled? }` |

### `report` (GET user detail)

```ts
{
  assignedWorkouts: number;
  doneAssignedThisWeek: number;
  adherencePercent: number;
  sessionsThisWeek: number;
  volumeThisWeek: number;
  prsThisMonth: number;
  plans: Array<{ id, name, totalDays, doneThisWeek, percent }>;
}
```

---

## Templates de treino

| Método | Rota | Body / query |
|--------|------|----------------|
| GET | `/api/admin/workout-templates?goal&sex&level` | Filtros |
| POST | `/api/admin/workout-templates` | `workoutSchema` + `templateGoal/Sex/Level` |
| GET/PUT/DELETE | `/api/admin/workout-templates/[id]` | update parcial |
| POST | `/api/admin/workout-templates/seed` | cria 8 pré-setados |
| POST | `/api/admin/assign-workouts` | `{ userId, templateIds: string[] }` |

## Planos

| Método | Rota | Body |
|--------|------|------|
| GET | `/api/admin/plan-templates?goal&sex&level` | |
| POST | `/api/admin/plan-templates/seed` | |
| POST | `/api/admin/assign-plans` | `{ userId, planTemplateIds: string[] }` |

## Cópia do aluno

| Método | Rota | Body |
|--------|------|------|
| GET/PUT | `/api/admin/user-workouts/[id]` | `workoutSchema.partial()` |

## Auditoria

| Método | Rota | Query |
|--------|------|-------|
| GET | `/api/admin/audit-log` | `entityType, action, actorEmail, page, pageSize` |

## Exercícios (admin)

| Método | Rota | |
|--------|------|--|
| GET/POST | `/api/admin/exercises` | CRUD biblioteca |
| PUT/DELETE | `/api/admin/exercises/[id]` | |

---

## OpenAPI resumido (OpenAPI 3.0 snippet)

Ver também `docs/admin-openapi.yaml` para importar no Swagger / Postman.
