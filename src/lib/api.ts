// Cliente de API com suporte a Bearer token (localStorage) + cookie fallback
// Trata 401 redirecionando para a tela de login

export const TOKEN_KEY = "gemgym_token";

// O token em localStorage só existe pra suportar o preview em iframe
// (`*.space-z.ai` / `preview-*.space-z.ai`, ver `allowedDevOrigins` em
// next.config.ts) — cenário em que cookies podem não ser confiáveis
// (partição/bloqueio de cookie de terceiro em iframe). Em produção, front
// e API estão sempre na mesma origem na Vercel (só o banco é externo), e
// aí o cookie httpOnly já basta sozinho — não precisa de token legível
// por JS voando por aí. Fora dessa origem de preview, o token devolvido
// pelo login NUNCA é gravado em localStorage/sessionStorage: um XSS em
// produção não tem mais nenhum token de sessão pra roubar por lá, só o
// cookie httpOnly (inacessível a JS).
function isPreviewSandboxOrigin(): boolean {
  if (typeof window === "undefined") return false;
  return /(^|\.)space-z\.ai$/.test(window.location.hostname);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (!isPreviewSandboxOrigin()) return null;
  // Prioriza localStorage (login persistente); cai para sessionStorage
  // (login válido só nesta aba/sessão do navegador) se não achar.
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Salva o token de autenticação.
 * @param remember Se true (padrão), usa localStorage e o login persiste
 *   entre sessões do navegador ("Manter conectado"). Se false, usa
 *   sessionStorage e a sessão termina ao fechar a aba/navegador.
 *
 * Fora da origem de preview, gravar um token não-nulo é sempre um no-op —
 * ver comentário acima de `isPreviewSandboxOrigin`. `setToken(null)` (usado
 * no logout) continua funcionando em qualquer origem, pra sempre limpar
 * resíduo de uma sessão anterior de preview.
 */
export function setToken(token: string | null, remember: boolean = true) {
  if (typeof window === "undefined") return;
  // Sempre limpa os dois primeiro para não deixar token velho para trás.
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (token && isPreviewSandboxOrigin()) {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  }
  // Login válido novo: libera a trava de reload-guard (ver handleUnauthorized)
  // pra próxima expiração de sessão ainda conseguir recarregar 1x.
  if (token) sessionStorage.removeItem(RELOAD_GUARD_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Trata resposta 401 limpando a sessão local e recarregando p/ tela de login */
const RELOAD_GUARD_KEY = "gemgym_401_reload_guard";

function handleUnauthorized() {
  setToken(null);
  if (typeof window === "undefined") return;
  // Evita loop infinito de reload: o app não tem uma rota /auth própria
  // (a tela de login aparece sem trocar a URL), então checar o pathname
  // nunca funcionava como proteção real. Em vez disso, usamos uma trava em
  // sessionStorage: só permitimos 1 reload automático por "rodada". Se
  // mesmo depois de recarregar o 401 persistir (ex.: cache de service
  // worker desatualizado, ou qualquer outra causa que um reload sozinho
  // não resolve), paramos de tentar — a tela de login aparece assim que
  // /api/auth/me também refletir a sessão inválida, sem ficar recarregando
  // pra sempre. A trava é limpa a cada login bem-sucedido (ver setToken).
  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) {
    console.warn("Sessão expirada, mas evitando novo reload automático (possível loop).");
    return;
  }
  sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  console.warn("Sessão expirada. Recarregando para tela de login.");
  window.location.reload();
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
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
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error(data.error || "Sessão expirada");
  }
  if (!res.ok) {
    // Em 400 de validação (zod), o backend manda `details` (campo + motivo
    // exato) além de `error` (mensagem genérica "Dados inválidos"). Antes
    // isso era descartado e só sobrava o texto genérico no toast — sem
    // nenhum jeito de saber, nem no console do navegador, qual campo
    // reprovou. Logamos aqui pra facilitar diagnóstico.
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
