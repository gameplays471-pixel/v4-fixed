---
Task ID: bugfix-and-expand
Agent: main
Task: Corrigir bug na criação de treinos, expandir base de exercícios para 100, adicionar GIF/imagens de fontes públicas para cada exercício.

Work Log:
- Diagnosticado o bug: o log do dev server mostrava `POST /api/workouts 401` repetidas vezes. A causa raiz era dupla:
  1. O cookie de sessão estava sendo perdido no cenário cross-origin da URL de preview (`preview-chat-*.space-z.ai`), provavelmente por combinação de `SameSite=lax` + reverse proxy.
  2. `GET /api/workouts` retornava 200 com `{ workouts: [] }` quando não-autenticado, mascarando o problema: o usuário via "lista vazia" e pensava que o treino não foi salvo, quando na verdade nunca esteve logado.

- Auth refatorada para suporte híbrido:
  - `getCurrentUser(req?)` agora lê o header `Authorization: Bearer <token>` do request direto (mais confiável que `next/headers` em cross-origin), com fallback para `next/headers` e por fim para cookie.
  - Login e signup agora retornam `token` no body JSON (além de setar cookie), para o frontend guardar em `localStorage`.
  - `apiGet/apiPost/apiPut/apiDelete` em `src/lib/api.ts` injetam automaticamente `Authorization: Bearer <token>` a partir do `localStorage`. Em caso de 401, limpam o token e recarregam a página, devolvendo o usuário ao login.
  - `GET /api/workouts` agora retorna 401 quando não-autenticado (em vez de 200 com lista vazia), permitindo detecção correta.

- Exercícios expandidos de 69 para 102 (acima do mínimo pedido de 100):
  - Adicionados 33 novos exercícios cobrindo grupos musculares e variações: Supino Declinado, Crucifixo Inclinado, Peck Deck, Desenvolvimento Arnold, Remada Unilateral, Pulldown, Terra Sumô, Agachamento Frontal, Leg Press 90°, Hip Thrust Unilateral, Tríceps Testa c/ Halteres, Tríceps Coice, Rosca 21, Rosca na Polia, Abdominal na Polia, Hollow Body, Russian Twist, T-Bar Row, Terra Romeno, Cadeira Flexora Deitada, Good Morning c/ Halteres, Agachamento Pulsatório, Jump Squat, Burpee, Mountain Climber, Flexão Diamante, Flexão Arqueira, etc.
  - Tipo `ExerciseData` agora inclui `imageUrl`, `gifUrl`, `videoUrl`.
  - `muscleGroups` expandido para incluir "Posteriores" e "Full Body".

- Imagens e GIFs buscados de fontes públicas (CC-licensed):
  - Script `scripts/fetch-exercise-images.ts` consulta a API Openverse (https://api.openverse.org/v1/images/) e devolve imagens Creative Commons para cada exercício (busca em inglês via mapa PT→EN).
  - Script `scripts/fetch-exercise-gifs.ts` consulta Wikimedia Commons API buscando GIFs animados para os exercícios mais populares.
  - Cache salvo em `scripts/exercise-images.json`. Resultado: **98/102 exercícios com imageUrl, 13/102 com gifUrl**.
  - Script de seed (`scripts/seed.ts`) atualizado para ler o cache e popular `imageUrl`/`gifUrl`/`videoUrl` no banco.

- UI atualizada para mostrar imagens:
  - `LibraryView`: agora exibe thumbnail 56x56 da imagem (ou GIF) ao lado de cada exercício, com fallback para inicial do nome.
  - `ExerciseDetail`: novo bloco de mídia no topo do modal com toggle GIF/Imagem quando ambos existem, fallback gracioso em caso de erro de carregamento.
  - `WorkoutEditor` > `ExercisePicker`: thumbnail 40x40 ao lado de cada exercício na lista de seleção.
  - `next.config.ts`: configurado `images.remotePatterns` para permitir qualquer host HTTPS (necessário porque as imagens vêm de `upload.wikimedia.org`, `live.staticflickr.com`, etc.).

- Banco re-seeded: 102 exercícios, 3 treinos demo (ABC), 12 sessões de histórico, 1 usuário demo (`demo@hevy.com` / `demo123`).

- Testes end-to-end (`scripts/test-e2e.ts`): todos passando — login, criar treino com 3 exercícios, listar, buscar por ID, atualizar (4 exercícios), deletar, verificar deleção, verificar imagens.

Stage Summary:
- **Bug de criação de treinos corrigido**: autenticação agora usa Bearer token em `localStorage` (com fallback de cookie), funcionando em cenário cross-origin da URL de preview. 401 agora é detectável e o frontend recarrega para a tela de login automaticamente.
- **Base de exercícios expandida**: 69 → 102 exercícios (acima do mínimo de 100 pedido).
- **Imagens e GIFs**: 98 exercícios com imagem Creative Commons (Openverse/Flickr), 13 com GIF animado (Wikimedia Commons). Todas as URLs são de fontes públicas e gratuitas.
- **Arquivos principais modificados**: `src/lib/auth.ts`, `src/lib/api.ts`, `src/app/page.tsx`, `src/components/auth-screen.tsx`, `src/lib/exercises-data.ts`, `scripts/seed.ts`, `src/components/exercise-detail.tsx`, `src/components/views/library.tsx`, `src/components/views/workouts.tsx`, `src/app/api/*/route.ts` (todos passando `req` para `getCurrentUser`), `next.config.ts`.
- **Novos scripts**: `scripts/fetch-exercise-images.ts`, `scripts/fetch-exercise-gifs.ts`, `scripts/test-auth-flow.ts`, `scripts/test-e2e.ts`, `scripts/check-db.ts`.
- **Cache de imagens**: `scripts/exercise-images.json` (98 entradas com imageUrl, 13 com gifUrl).
