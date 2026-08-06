// Cliente de API com autenticação via cookie httpOnly (primário)
// O Bearer token via localStorage foi removido por segurança (#3 FIX):
// qualquer XSS poderia ler localStorage.getItem("gemgym_token") e roubar
// a sessão. O cookie httpOnly não é acessível via JavaScript.
//
// Para cross-origin (preview URLs), o cookie é enviado via
// credentials: "same-origin" — se necessário cross-origin no futuro,
// usar credentials: "include" + CORS com origins explícitas.

export const TOKEN_KEY = "gemgym_token";

// getToken/setToken mantidos como no-op para compatibilidade com
// componentes que ainda referenciam essas funções, mas não armazenam
// mais o token no localStorage.
export function getToken(): string | null {
  return null; // Token não é mais armazenado client-side
}

export function setToken(_token: string | null, _remember: boolean = true) {
  // No-op: autenticação via cookie httpOnly apenas.
  // Limpa qualquer token residual de versões anteriores.
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

// authHeaders não envia mais Bearer token — cookie é enviado automaticamente
function authHeaders(): HeadersInit {
  return {};
}

/** Trata resposta 401 limpando a sessão local e recarregando p/ tela de login */
function handleUnauthorized() {
  setToken(null);
  // Evita loop infinito se já estamos em contexto de auth
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
    console.warn("Sessão expirada. Recarregando para tela de login.");
    window.location.reload();
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "same-origin", // garante envio do cookie httpOnly
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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) {
    if (data.details) console.error(`API ${res.status} em ${url}:`, data.details);
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) {
    if (data.details) console.error(`API ${res.status} em ${url}:`, data.details);
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) {
    if (data.details) console.error(`API ${res.status} em ${url}:`, data.details);
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
  return data;
}

// Utilitários
export function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
  return Math.round(vol).toString();
}

// Aplica a máscara (11) 91234-5678 enquanto a pessoa digita — usado tanto
// no cadastro (auth-screen.tsx) quanto na edição de perfil (profile.tsx).
// Centralizado aqui pra evitar as duas telas divergirem com o tempo.
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  let formatted = digits;
  if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length > 7) {
    const splitAt = digits.length > 10 ? 7 : 6;
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, splitAt)}-${digits.slice(splitAt)}`;
  }
  return formatted;
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
