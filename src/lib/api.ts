/**
 * Cliente de API — autenticação exclusivamente via cookie httpOnly.
 *
 * O JWT de sessão é armazenado em cookie httpOnly definido pelo servidor
 * (setSessionCookie em src/lib/auth.ts). O browser o envia automaticamente
 * em todas as requisições same-origin, sem nenhum acesso via JavaScript.
 *
 * As funções getToken/setToken foram removidas — o token nunca toca o
 * localStorage, eliminando a superfície de ataque a XSS.
 */

/** Trata resposta 401 limpando a sessão local e recarregando para a tela de login */
function handleUnauthorized() {
  if (typeof window !== "undefined") {
    console.warn("Sessão expirada. Redirecionando para tela de login.");
    window.location.reload();
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include", // garante envio do cookie em requisições same-origin
    headers: { "Content-Type": "application/json" },
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Sessão expirada");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
  return data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
  return data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Sessão expirada");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Utilitários de formatação
// ---------------------------------------------------------------------------

export function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
  return Math.round(vol).toString();
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${s}s`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function relativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  if (days < 30) return `${Math.floor(days / 7)}sem atrás`;
  return formatDate(d);
}
