import { NextRequest, NextResponse } from "next/server";

// CSP com nonce por request — reduz a superfície de XSS (ver auditoria em
// docs/performance-audit.md / discussão sobre token em localStorage em
// src/lib/api.ts). Um XSS que injeta <script> inline ou de outra origem
// não executa mais: só scripts com o nonce certo (gerado aqui, só
// conhecido nesse request) ou os que o próprio Next injeta (que reusa
// o mesmo nonce automaticamente, ver docs.nextjs.org/csp) rodam.
//
// `style-src` mantém 'unsafe-inline' de propósito: framer-motion e boa
// parte da UI usam `style={{...}}` (atributo inline), que o CSP não tem
// como "nonce-ar" — só dá pra restringir <style>/<link>, não o atributo.
// Isso é uma limitação conhecida da spec de CSP, não um descuido; o
// script-src (o que de fato importa pra XSS de execução de código) fica
// estrito mesmo assim.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://raw.githubusercontent.com https://*.public.blob.vercel-storage.com;
    font-src 'self' data:;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? "" : "upgrade-insecure-requests;"}
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // O nonce vai pro request (pra Server Components lerem via headers() e
  // repassarem pra qualquer <script>/<Script> custom, ex.: ThemeProvider)
  // e pra response (é o que o navegador de fato aplica).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  // Defesa em profundidade — não dependem do nonce, sempre vale ter.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  matcher: [
    // Roda em tudo exceto: rotas de API (CSP não faz sentido em resposta
    // JSON), assets estáticos do Next, e arquivos públicos que não são
    // documentos HTML (sw.js já tem headers próprios em next.config.ts).
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/).*)",
  ],
};
