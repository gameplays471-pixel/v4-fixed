# Hevy Web — App de Treinos (Academia)

Aplicação web para registro e acompanhamento de treinos de academia (estilo Hevy).
Stack: **Next.js 16 + TypeScript + Tailwind + Prisma + PostgreSQL (Supabase)**.

## Funcionalidades

- **Biblioteca com 180 exercícios** cobrindo todos os grupos musculares
- **Criar/editar treinos** (Treino A, B, C, etc.) com exercícios personalizados
- **Executar treino ao vivo** com cronômetro, timer de descanso, controle de séries
- **Histórico de sessões** com volume total, duração e recordes pessoais (PR)
- **Estatísticas** com gráficos de progresso
- **"Última vez"**: ao iniciar um treino, mostra o peso/reps da última sessão como referência (cross-workout)
- **Favoritos** para acessar exercícios preferidos rapidamente

## Usuário demo

```
Email:    demo@hevy.com
Senha:    demo123
```

## Deploy no Vercel

### 1. Subir o código para o GitHub

```bash
git init
git add .
git commit -m "Initial commit — Hevy Web app"
git branch -M main
git remote add origin https://github.com/SEU_USER/hevy-web.git
git push -u origin main
```

### 2. Importar no Vercel

1. Acesse https://vercel.com/new
2. Escolha o repositório `hevy-web`
3. Framework preset: **Next.js** (auto-detectado)
4. Build command: `bun run vercel-build` (já configurado no `vercel.json`)
5. Install command: `bun install` (já configurado)

### 3. Configurar variáveis de ambiente

No Vercel → Settings → Environment Variables, adicionar:

| Nome | Valor | Ambientes |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.coyaqzvmpcdhxwtoowye:WLTM4q9FIquG1ItF@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://postgres.coyaqzvmpcdhxwtoowye:WLTM4q9FIquG1ItF@aws-1-us-west-2.pooler.supabase.com:5432/postgres` | Production, Preview, Development |

> ⚠️ **Não faça commit do `.env`** — ele está no `.gitignore`. As variáveis precisam ser cadastradas no Vercel.

### 4. Deploy

Clique em **Deploy**. O build vai:
1. Rodar `bun install` (com `postinstall: prisma generate`)
2. Rodar `bun run vercel-build` (que roda `prisma generate && next build`)
3. Publicar a aplicação em `https://hevy-web.vercel.app` (ou similar)

### 5. Deploy automático

A partir de agora, todo `git push` para a `main` dispara um novo deploy automático.
Cada PR/branch gera uma URL de preview (ex.: `https://hevy-web-git-feature.vercel.app`).

## Desenvolvimento local

```bash
# Instalar dependências
bun install

# Rodar migrations (criar/atualizar tabelas no Supabase)
bun run db:push

# (Opcional) Popular banco com dados demo
bun run scripts/seed.ts

# Iniciar dev server
bun run dev
```

Acesse http://localhost:3000

## Estrutura do projeto

```
src/
├── app/
│   ├── api/              # API routes (auth, workouts, sessions, exercises, etc.)
│   ├── page.tsx          # Entry point
│   └── layout.tsx        # Root layout
├── components/
│   ├── views/            # Páginas: dashboard, workouts, library, history, stats
│   ├── active-workout.tsx # Tela de treino em execução
│   ├── auth-screen.tsx   # Login/cadastro
│   ├── exercise-detail.tsx
│   └── sidebar.tsx
└── lib/
    ├── api.ts            # Cliente HTTP com Bearer token
    ├── auth.ts           # Sistema de auth híbrido (token + cookie)
    ├── db.ts             # Prisma Client com fallback de .env
    ├── store.ts          # Zustand store
    └── exercises-data.ts # 180 exercícios hardcoded para seed

prisma/
└── schema.prisma         # Schema do banco (PostgreSQL)

scripts/
├── seed.ts               # Popula banco com 180 exercícios + treinos demo
├── export-all-csv.ts     # Exporta todas as tabelas para CSV
├── import-csv-to-supabase.ts # Importa CSVs para o Supabase
└── test-e2e-supabase.sh  # Teste end-to-end
```

## Tecnologia

- **Next.js 16** (App Router, Turbopack, Standalone output)
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma 6** (PostgreSQL)
- **Supabase** (PostgreSQL gerenciado)
- **Framer Motion** (animações)
- **Zustand** (state management)
- **Sonner** (toasts)
