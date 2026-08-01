# Melhorias sugeridas — GEMgym

Este documento lista melhorias observadas ao revisar o código atual. Não são bugs bloqueantes — o projeto já tem uma base sólida (validação com zod, rate limiting, auth com bcrypt + JWT assinado, índices de banco, service worker versionado) — são pontos que valem a pena priorizar conforme o app crescer em uso.

## Correção aplicada nesta revisão

- **Card de treino concluído cortando exercícios (`+X exercícios`)**: em `src/components/share-workout-card.tsx`, a lista de exercícios do cartão compartilhável tinha um teto baixo (4–5 itens nas variantes com manequim, 8–12 na variante só-lista) e escondia o resto atrás de "+N exercícios" — em treinos com 5–6 exercícios isso já cortava metade da lista. Trocado por um layout que reduz fonte/padding e passa a 2 colunas automaticamente conforme a quantidade cresce, cabendo o treino inteiro na maioria dos casos; o "+N" continua existindo como último recurso, mas agora só aparece com ~15-24 exercícios (dependendo do formato).

---

## Performance

1. **Rate limiting grava uma linha por tentativa no Postgres** (`src/lib/rate-limit.ts`). Funciona bem no volume atual, mas sob um ataque de força bruta/credential stuffing gera escrita amplificada no banco principal antes mesmo do limite bloquear. Migrar para uma store em memória de borda (Upstash Redis, ou `@vercel/kv`) tira essa carga do Postgres e reduz a latência do endpoint de login.
2. **`connection_limit=1` por instância serverless** (`src/lib/db.ts`) é a configuração certa para o pooler do Supabase, mas vale confirmar que todo endpoint que faz múltiplas queries sequenciais (ex.: histórico com joins manuais) está usando `Promise.all` onde as queries são independentes, e transações (`$transaction`) onde precisam ser atômicas — evita round-trips desnecessários com uma conexão só por isolate.
3. **Imagens de exercícios servidas direto do `raw.githubusercontent.com`** (via `next/image` com `remotePatterns`). Como esse domínio não tem CDN otimizada para o app, considerar migrar as imagens usadas para o Vercel Blob (que já é usado para avatares/fotos de progresso) ou para `next/image` com cache local, reduzindo a dependência de disponibilidade de um domínio de terceiros.
4. **Cache de API no service worker é read-only e por rota fixa** (`public/sw.js`). Bom para offline, mas convém revisar o TTL do `API_CACHE`/`IMAGE_CACHE` periodicamente para não servir dados de treino desatualizados por muito tempo quando a conexão volta — um `stale-while-revalidate` mais agressivo em `/api/exercises` (que muda pouco) vs. dados de sessão (que mudam a cada série) ajuda a equilibrar velocidade e frescor.
5. **Bundle/edge**: não há `middleware.ts` hoje. Se o volume de rotas autenticadas crescer, mover a checagem de sessão (ou pelo menos a rejeição rápida de requests sem token/cookie) para um middleware no edge evita instanciar a função serverless completa (com Prisma) só para devolver 401.

## Segurança

1. **Token de sessão em `localStorage`** (`src/lib/api.ts`). É o que permite a auth funcionar em cenários cross-origin (preview URLs), mas `localStorage` é acessível por qualquer script que rode na página — um XSS vira roubo de sessão persistente. Vale avaliar: (a) reduzir a superfície de XSS com uma Content-Security-Policy (ver item abaixo), e/ou (b) expirar o token guardado em `localStorage` num prazo mais curto que o cookie `httpOnly`, usando o cookie como fonte de verdade sempre que a origem permitir.
2. **Sem Content-Security-Policy nem outros security headers configurados** em `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). O Vercel aplica alguns padrões, mas não CSP. Adicionar uma CSP mesmo que permissiva no início (relatando violações antes de bloquear) reduz bastante o impacto de um XSS.
3. **`SESSION_SECRET` tem fallback de desenvolvimento inseguro** (`src/lib/auth.ts`) — comportamento correto para não travar o `bun run dev` sem `.env`, mas vale adicionar uma checagem explícita no boot de produção (`vercel-build` ou health check) que falha o deploy se `SESSION_SECRET` não estiver configurado ou tiver menos de 32 caracteres, em vez de descobrir isso em runtime.
4. **Rotas admin**: vale confirmar que todo endpoint em `src/app/api/admin/**` valida o papel (`role`) do usuário no servidor (não só esconde o link no client) e registra no `audit-log` não só ações de escrita, mas tentativas de acesso negado — útil para detectar tentativas de escalonamento de privilégio.
5. **Upload de avatar/fotos de progresso** (`src/lib/blob-token.ts`, `progress-photo.ts`): confirmar que o tipo de arquivo é validado pelo conteúdo (magic bytes), não só pela extensão/`Content-Type` enviado pelo cliente, e que há um limite de tamanho aplicado no servidor antes de gerar o token de upload do Blob.
6. **Dependências**: `bun.lock` e o `package.json` não têm um step de auditoria (`bun audit`/`npm audit` ou Dependabot/Renovate) no CI. Vale automatizar isso — o projeto tem bastante superfície de dependências (Radix, Prisma, Sentry) que recebem patches de segurança com frequência.

## Utilidades / UX

1. **Cartão de compartilhamento** (corrigido nesta revisão) — considerar aplicar o mesmo tratamento de auto-scaling em `src/components/plan-share-card.tsx` (ficha de treino planejado), que ainda usa um `maxItems` fixo (9) e pode cortar planos maiores da mesma forma.
2. **Import CSV → Supabase**: `scripts/export-all-csv.ts` e `scripts/import-csv-to-supabase.ts` são úteis para migração manual de dados, mas não têm um modo `--dry-run` que mostre o diff antes de aplicar. Adicionar isso evita importações acidentais em produção.
3. **`docs/admin-api.md` + `docs/admin-openapi.yaml`**: já existem, mas vale gerar/validar o OpenAPI automaticamente a partir das rotas (ou pelo menos um teste que falha se um endpoint admin novo não estiver documentado), para não desatualizar como aconteceu com o README.
4. **Onboarding** (`src/lib/onboarding.ts`, `src/components/onboarding-tour.tsx`): considerar adicionar um passo específico explicando o cartão de compartilhamento (a funcionalidade é boa para aquisição orgânica via Stories/Instagram, mas só é descoberta se o usuário clicar em "Compartilhar treino" no resumo).
5. **Testes**: há testes unitários (`src/lib/__tests__/`) para PR detection e validação, mas nenhum teste de snapshot/visual para os cartões de compartilhamento (`share-workout-card.tsx`, `plan-share-card.tsx`) — como são componentes renderizados para export de imagem, um teste que varia a quantidade de exercícios (1, 6, 12, 20+) e verifica que nada estoura os limites do card ajudaria a pegar regressões como a corrigida aqui antes de chegar em produção.
