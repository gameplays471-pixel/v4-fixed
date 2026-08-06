// GEMgym Service Worker
// Estratégia pensada para uso dentro da academia, onde o sinal costuma
// cair ou oscilar: o app shell e a última tela vista continuam abrindo,
// dados já vistos (treinos, exercícios, stats) continuam visíveis, e
// nada quebra silenciosamente quando a rede volta.

const SW_VERSION = "v1";
const APP_SHELL_CACHE = `gemgym-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `gemgym-runtime-${SW_VERSION}`;
const API_CACHE = `gemgym-api-${SW_VERSION}`;
const IMAGE_CACHE = `gemgym-images-${SW_VERSION}`;

const OFFLINE_URL = "/offline.html";

// Arquivos essenciais para o app abrir mesmo sem rede.
const APP_SHELL = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/logo.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Só fazemos cache de GET; POST/PUT/DELETE (login, criar treino, registrar
// série) sempre vão direto pra rede — nunca queremos servir isso do cache.
const CACHEABLE_METHOD = "GET";

// Rotas de API que fazem sentido ficar disponíveis offline (somente leitura).
// Tudo que é ação (auth, mutações) fica de fora de propósito.
const API_READ_PATHS = [
  "/api/exercises",
  "/api/workouts",
  "/api/sessions",
  "/api/stats",
  "/api/profile",
  "/api/bodyweight",
  "/api/progress-photos",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      // addAll falha inteiro se 1 recurso falhar; adicionamos um a um
      // para não travar a instalação do SW por causa de 1 ícone ausente.
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("[SW] Falha ao pré-cachear:", url, err);
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([APP_SHELL_CACHE, RUNTIME_CACHE, API_CACHE, IMAGE_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => !keep.has(n)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

function isApiReadRequest(url) {
  return API_READ_PATHS.some((p) => url.pathname.startsWith(p));
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isImageRequest(request, url) {
  if (request.destination === "image") return true;
  return /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i.test(url.pathname);
}

// Cache-first: se já tem, usa; se não, busca na rede e guarda.
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

// Network-first: tenta a rede (dados frescos); se falhar (offline), usa
// o que tiver em cache. Usado pra API de leitura e navegação.
async function networkFirst(request, cacheName, { timeoutMs = 8000 } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs)
      ),
    ]);
    if (response && response.ok && request.method === CACHEABLE_METHOD) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Stale-while-revalidate: devolve o cache na hora (se existir) e já
// dispara uma atualização em segundo plano pra próxima vez.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === "opaque")) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Só tratamos GET; deixa POST/PUT/DELETE passar direto pela rede.
  if (request.method !== CACHEABLE_METHOD) return;

  // Nunca interceptar chamadas de autenticação, mesmo GET (ex.: /api/auth/me
  // reflete sessão atual e não deve nunca vir de um cache velho).
  if (url.pathname.startsWith("/api/auth/")) return;

  // Navegação (abrir/recarregar uma tela do app) — network-first com
  // fallback pro app shell e, em último caso, pra página offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request, APP_SHELL_CACHE, { timeoutMs: 6000 });
        } catch {
          const shellCache = await caches.open(APP_SHELL_CACHE);
          const shell = await shellCache.match("/");
          return shell || (await shellCache.match(OFFLINE_URL));
        }
      })()
    );
    return;
  }

  // Assets estáticos do Next (JS/CSS com hash no nome) — nunca mudam de
  // conteúdo pro mesmo hash, então cache-first é seguro e rápido.
  if (isNextStaticAsset(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Imagens (logo, ícones, gifs de demonstração de exercício, mesmo vindo
  // de outro domínio/CDN) — cache-first pra abrir instantâneo e funcionar
  // offline; consomem pouco espaço mudam raramente.
  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Leitura de dados do app (treinos, exercícios, stats, perfil) —
  // network-first: prioriza dado fresco, mas cai pro último dado visto
  // se a rede da academia cair no meio do treino.
  if (isApiReadRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE, { timeoutMs: 8000 }));
    return;
  }

  // Demais requisições GET de mesma origem: stale-while-revalidate como
  // meio-termo razoável (rápido, mas se atualiza sozinho).
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Permite forçar atualização do SW a partir do app (ex.: botão "atualizar
// app" ou banner de nova versão disponível).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Ao tocar na notificação (ex.: "Descanso concluído!"), foca a aba do app já
// aberta em vez de abrir uma nova — se não tiver nenhuma aberta, abre uma.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          return;
        }
      }
      await self.clients.openWindow("/");
    })()
  );
});
