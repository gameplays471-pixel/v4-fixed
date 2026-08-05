/**
 * Rate limiter em memória com janela deslizante (sliding window).
 *
 * Adequado para instância única (um processo Node/Bun).
 * Para ambientes multi-instância (ex: Vercel serverless), substitua
 * pelo Upstash Rate Limit (@upstash/ratelimit) apontando para um Redis.
 *
 * Uso:
 *   const { success, retryAfter } = await rateLimit(identifier, options);
 *   if (!success) return 429;
 */

interface RateLimitEntry {
  timestamps: number[]; // timestamps das requisições na janela atual
}

// Mapa global — persiste entre requisições no mesmo processo
const store = new Map<string, RateLimitEntry>();

// Limpeza periódica para evitar vazamento de memória
// Entradas sem requisições recentes são removidas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.timestamps.length === 0 || now - entry.timestamps.at(-1)! > 10 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Número máximo de requisições permitidas na janela */
  limit: number;
  /** Tamanho da janela em milissegundos */
  windowMs: number;
}

export interface RateLimitResult {
  /** true se a requisição é permitida */
  success: boolean;
  /** Número de requisições restantes na janela */
  remaining: number;
  /** Segundos até a próxima requisição ser permitida (0 se success=true) */
  retryAfter: number;
}

/**
 * Verifica e registra uma requisição para o identificador dado.
 *
 * @param identifier  Chave única (ex: `login:${ip}` ou `signup:${ip}`)
 * @param options     Configuração da janela e limite
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  // Busca ou cria entrada
  let entry = store.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  // Remove timestamps fora da janela atual (sliding window)
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= options.limit) {
    // Calcula quando a requisição mais antiga sair da janela
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + options.windowMs - now) / 1000);
    return { success: false, remaining: 0, retryAfter };
  }

  // Registra a requisição atual
  entry.timestamps.push(now);
  const remaining = options.limit - entry.timestamps.length;
  return { success: true, remaining, retryAfter: 0 };
}

/**
 * Extrai o IP do cliente de um NextRequest.
 * Considera proxies via X-Forwarded-For (Vercel, Nginx, etc.).
 */
export function getClientIp(req: import("next/server").NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
