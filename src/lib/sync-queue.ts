/**
 * Fila simples de sincronização offline para escritas que falharam por falta
 * de conexão. Usa localStorage como armazenamento (mesma estratégia do
 * workout-draft.ts). Itens são reenviados automaticamente ao detectar
 * reconexão (`online` event) ou periodicamente (30 s) quando on-line.
 *
 * Não faz conflict resolution — last-write-wins é aceitável aqui porque
 * um usuário só edita a própria sessão.
 */

import { getToken } from "./api";

// ── Tipos ───────────────────────────────────────────────────────────

export type SyncQueueItem = {
  id: string;
  url: string;
  method: "POST" | "PUT" | "DELETE";
  body: unknown;
  createdAt: string; // ISO
  retryCount: number;
};

// ── Armazenamento ────────────────────────────────────────────────────

const QUEUE_KEY = "gemgym:sync-queue";
const MAX_RETRIES = 10;

function loadQueue(): SyncQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(items: SyncQueueItem[]) {
  if (typeof window === "undefined") return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    }
  } catch {
    // localStorage cheio ou indisponível — falha em silêncio
  }
}

// ── API pública ──────────────────────────────────────────────────────

/** Retorna quantos itens estão na fila (lido de forma síncrona). */
export function getPendingCount(): number {
  return loadQueue().length;
}

/** Adiciona um item à fila. */
export function addToQueue(item: {
  url: string;
  method: "POST" | "PUT" | "DELETE";
  body: unknown;
}): SyncQueueItem {
  const queueItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
    ...item,
  };
  const queue = loadQueue();
  queue.push(queueItem);
  saveQueue(queue);
  // Dispara evento customizado para componentes React re-renderizarem
  dispatchSyncEvent();
  return queueItem;
}

/** Remove um item específico da fila (após sucesso). */
export function removeFromQueue(id: string) {
  const queue = loadQueue().filter((i) => i.id !== id);
  saveQueue(queue);
  dispatchSyncEvent();
}

// ── Processamento automático ────────────────────────────────────────

let processing = false;

/**
 * Tenta reenviar todos os itens pendentes. Remove da fila só após 2xx.
 * Retorna quantos foram sincronizados com sucesso.
 */
export async function processSyncQueue(): Promise<{
  synced: number;
  failed: number;
}> {
  if (processing) return { synced: 0, failed: 0 };
  if (!navigator.onLine) return { synced: 0, failed: 0 };

  processing = true;
  dispatchSyncEvent(); // notifica "sincronizando..."

  const queue = loadQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (!navigator.onLine) break; // caiu de novo no meio

    try {
      const token = getToken();
      const res = await fetch(item.url, {
        method: item.method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: item.method !== "DELETE" ? JSON.stringify(item.body) : undefined,
      });

      if (res.ok) {
        removeFromQueue(item.id);
        synced++;
      } else if (res.status === 401) {
        // Token expirado — não adianta retry, remove da fila
        removeFromQueue(item.id);
        failed++;
      } else {
        // 4xx/5xx — marca retry, mas continua tentando os outros
        item.retryCount++;
        if (item.retryCount >= MAX_RETRIES) {
          removeFromQueue(item.id);
          failed++;
          console.error(`[sync-queue] Descartado após ${MAX_RETRIES} tentativas:`, item.url);
        }
      }
    } catch {
      // Erro de rede (TypeError) — não remove, vai tentar na próxima
      item.retryCount++;
      if (item.retryCount >= MAX_RETRIES) {
        removeFromQueue(item.id);
        failed++;
      }
    }
  }

  // Persiste retry counts atualizados
  saveQueue(loadQueue());
  processing = false;
  dispatchSyncEvent();
  return { synced, failed };
}

// ── Comunicação com React ───────────────────────────────────────────

const SYNC_EVENT = "gemgym:sync-change";

function dispatchSyncEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
}

/**
 * Hook-friendly: escuta mudanças na fila e retorna { pending, syncing }.
 * Deve ser chamado dentro de useEffect/useSyncExternalStore.
 */
export function subscribeToSync(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_EVENT, callback);
  return () => window.removeEventListener(SYNC_EVENT, callback);
}

// ── Auto-retry em reconexão + periódico ─────────────────────────────

if (typeof window !== "undefined") {
  // Ao voltar online, tenta sincronizar imediatamente
  window.addEventListener("online", () => {
    // Pequeno delay pra garantir que a conexão está estável
    setTimeout(() => processSyncQueue(), 1000);
  });

  // Fallback periódico (a cada 30 s) se o evento online não disparou
  setInterval(() => {
    if (navigator.onLine && getPendingCount() > 0) {
      processSyncQueue();
    }
  }, 30_000);
}
