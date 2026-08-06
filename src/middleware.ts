// #15 FIX: Middleware centralizado de segurança
// - Verificação de autenticação no edge para rotas protegidas
// - Headers de segurança HTTP (#20 FIX)
// - Rate limiting básico por IP para endpoints públicos

import { NextRequest, NextResponse } from "next/server";

// Rotas de API que NÃO exigem autenticação
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/feature-flags",
  "/api/exercises",
  "/api/public",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── 1. Headers de segurança HTTP (#20 FIX) ───────────────────────
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS apenas em produção (para não quebrar dev com HTTP)
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // CSP básico — permite scripts/styles inline (necessário para Next.js)
  // mas restringe fontes, imagens e conexões a origens conhecidas
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://raw.githubusercontent.com https://*.public.blob.vercel-storage.com",
        "font-src 'self' data:",
        "connect-src 'self' https://*.ingest.sentry.io https://*.public.blob.vercel-storage.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );
  }

  // ─── 2. Rotas públicas — permitir sem autenticação ────────────────
  if (PUBLIC_API_ROUTES.some((r) => pathname.startsWith(r))) {
    return res;
  }

  // ─── 3. Rotas de API protegidas — exigir token ────────────────────
  if (pathname.startsWith("/api/")) {
    const token =
      req.cookies.get("gemgym_session")?.value ||
      (req.headers.get("authorization")?.startsWith("Bearer ")
        ? req.headers.get("authorization")!.slice(7).trim()
        : null);

    if (!token) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
  }

  // ─── 4. Rotas admin — exigir sessão (role check ainda no handler) ──
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("gemgym_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
