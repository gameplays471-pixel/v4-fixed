/**
 * Middleware centralizado de autenticação e segurança.
 *
 * Responsabilidades:
 *  1. Proteger rotas de API privadas — retorna 401 sem JWT válido.
 *  2. Adicionar headers de segurança em todas as respostas.
 *
 * Rotas públicas (sem autenticação obrigatória):
 *  - POST /api/auth/login
 *  - POST /api/auth/signup
 *  - GET  /api/auth/me        (retorna null — não lança 401)
 *  - GET  /api/exercises      (catálogo público)
 *  - GET  /api/exercises/:id  (detalhe público)
 *  - GET  /api               (health check)
 *
 * As rotas individuais continuam verificando getCurrentUser() para
 * garantir ownership — o middleware é a primeira linha de defesa.
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ---------------------------------------------------------------------------
// Rotas de API que NÃO exigem autenticação no middleware
// ---------------------------------------------------------------------------
const PUBLIC_API_PATTERNS: RegExp[] = [
  /^\/api\/auth\/(login|signup|me)$/,
  /^\/api\/exercises(\/[^/]+)?$/,  // GET /api/exercises e /api/exercises/:id
  /^\/api$/,                        // health check
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PATTERNS.some((pattern) => pattern.test(pathname));
}

// ---------------------------------------------------------------------------
// Headers de segurança aplicados em todas as respostas
// ---------------------------------------------------------------------------
function applySecurityHeaders(res: NextResponse): NextResponse {
  // Evita que o browser interprete o Content-Type incorretamente
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Impede que a página seja embutida em iframes (clickjacking)
  res.headers.set("X-Frame-Options", "DENY");
  // Força HTTPS por 1 ano em produção
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  // Política de referrer conservadora
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Desativa features desnecessárias
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}

// ---------------------------------------------------------------------------
// Verificação do JWT (mesmo algoritmo de auth.ts, sem acesso ao banco)
// ---------------------------------------------------------------------------
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[middleware] JWT_SECRET não definido em produção.");
    }
    return new TextEncoder().encode(
      "hevy-dev-secret-CHANGE-THIS-IN-PRODUCTION-min32chars!!"
    );
  }
  return new TextEncoder().encode(secret);
}

async function verifyJwt(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

function extractToken(req: NextRequest): string | null {
  // 1. Bearer token no header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  // 2. Cookie de sessão
  return req.cookies.get("hevy_session")?.value ?? null;
}

// ---------------------------------------------------------------------------
// Middleware principal
// ---------------------------------------------------------------------------
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Só intercepta rotas de API privadas
  if (pathname.startsWith("/api/")) {
    if (!isPublicApiRoute(pathname)) {
      const token = extractToken(req);
      const valid = token ? await verifyJwt(token) : false;

      if (!valid) {
        const res = NextResponse.json(
          { error: "Não autorizado" },
          { status: 401 }
        );
        return applySecurityHeaders(res);
      }
    }
  }

  // Passa a requisição adiante com headers de segurança
  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

// ---------------------------------------------------------------------------
// Configuração do matcher — exclui arquivos estáticos e _next
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Intercepta tudo exceto:
     * - _next/static  (arquivos estáticos do Next.js)
     * - _next/image   (otimização de imagens)
     * - favicon.ico, robots.txt, public/
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|logo\\.svg|.*\\.png$).*)",
  ],
};
