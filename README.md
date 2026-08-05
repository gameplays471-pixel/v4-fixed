# GEMgym — App de Treinos de Academia

Aplicação web para registro e acompanhamento de treinos de musculação (estilo Hevy), com biblioteca de exercícios, planos semanais, estatísticas de evolução, gamificação e um painel admin para academias que atribuem treinos a alunos.

Stack: **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma 6 + PostgreSQL (Supabase)**.

## Funcionalidades

**Treino**
- Biblioteca com 183 exercícios cobrindo todos os grupos musculares, com imagens e busca
- Criar/editar treinos (Treino A, B, C, PPL, Upper/Lower etc.) com exercícios personalizados
- Executar treino ao vivo com cronômetro, timer de descanso e controle de séries
- "Última vez": ao iniciar um treino, mostra peso/reps da última sessão como referência (cross-workout)
- Progressão automática sugerida ao final do treino (carga, reps, RIR)
- Favoritos para acesso rápido aos exercícios preferidos

**Acompanhamento**
- Histórico de sessões com volume total, duração e recordes pessoais (PR)
- Estatísticas com gráficos de progressão de carga por exercício
- Registro de peso corporal e fotos de progresso
- Mapa muscular (frente/costas) mostrando grupos trabalhados por sessão

**Social e planos**
- Planos semanais (templates com atribuição pelo admin e progresso % no dashboard)
- Cartões compartilháveis (treino concluído / ficha de treino) para Stories/feed
- Sessões ao vivo compartilháveis publicamente (`/l/[slug]`, `/w/[slug]`)
- Grupos de treino e gamificação (pontos/progresso)

**Admin**
- Atribuição de treinos e planos pré-setados a alunos
- Gestão de usuários, exercícios e log de auditoria
- Feature flags

**Plataforma**
- PWA instalável (manifest + service worker + modo offline)
- Auth híbrida (cookie + Bearer token) com suporte a cenários cross-origin
- Monitoramento de erros com Sentry


## Desenvolvimento local

```bash
# Instalar dependências (o projeto usa Bun como package manager — veja bun.lock)
bun install

# Configurar variáveis de ambiente
cp .env.example .env
# preencha DATABASE_URL (Supabase) e demais chaves necessárias

# Rodar migrations (criar/atualizar tabelas no Supabase)
bun run db:push

# (Opcional) Popular banco com dados demo
bun run scripts/seed.ts

# Iniciar dev server
bun run dev
```

Acesse http://localhost:3000

## Testes

```bash
bun run test          # testes unitários (Vitest)
bun run test:watch    # modo watch
bun run test:coverage # com cobertura
bun run test:e2e      # fluxo end-to-end contra Supabase
```

## Deploy no Vercel

1. Suba o código para o GitHub.
2. Importe o repositório em https://vercel.com/new — o preset **Next.js** é detectado automaticamente.
3. Build command: `bun run vercel-build` (já configurado em `vercel.json`).
4. Install command: `bun install` (roda `prisma generate` via `postinstall`).
5. Configure as variáveis de ambiente do `.env.example` no painel do projeto.
6. Deploy. A partir daí, todo `git push` para `main` dispara um novo deploy; cada PR/branch gera uma URL de preview.

