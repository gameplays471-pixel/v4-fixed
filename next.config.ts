import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // FIX: Next.js 16 + Turbopack não gera middleware.js.nft.json,
  // causando ENOENT no Vercel build. Excluir do file tracing resolve.
  // Nota: outputFileTracingExcludes deixou de ser experimental a partir
  // do Next.js 15 e agora é uma opção de nível raiz.
  outputFileTracingExcludes: {
    "*": [
      ".next/server/middleware.js.nft.json",
    ],
  },
  allowedDevOrigins: [
    "*.space-z.ai",
    "preview-*.space-z.ai",
  ],
  images: {
    // Necessário pro `next/image` conseguir otimizar imagens que não são
    // servidas pelo próprio domínio do app. Hoje só existem duas origens
    // externas reais em uso:
    //  - raw.githubusercontent.com: imagens dos exercícios (ver
    //    scripts/exercise-images-update.sql, importadas do free-exercise-db)
    //  - *.public.blob.vercel-storage.com: fotos de progresso do usuário
    //    (upload via @vercel/blob, ver src/lib/blob-token.ts)
    // Se o admin cadastrar imagem de exercício em outro domínio pelo painel,
    // adicione o hostname aqui — por segurança não usamos um wildcard `**`
    // liberando qualquer host.
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      // ── Headers de segurança globais (#20 FIX) ────────────────────
      // Aplicados em TODAS as rotas via Next.js config.
      // O middleware (src/middleware.ts) também seta esses headers
      // para requests que passam pelo edge — a duplicação é
      // intencional (defense in depth: se o middleware falhar,
      // o Next.js config ainda aplica).
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS: 2 anos com includeSubDomains + preload
          // Só efetivo em HTTPS (HTTP headers são ignorados pelo browser)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // O arquivo do service worker nunca pode ficar em cache "velho"
        // no navegador/CDN, senão uma atualização do app não chega no
        // celular de quem já instalou o PWA.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Só faz upload de source maps se o projeto Sentry estiver configurado
  // (variáveis de CI/Vercel) — sem isso, o build continua normal, só sem
  // stack trace legível no Sentry (mostra código minificado).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  // Evita que ad-blockers barrem os eventos do Sentry (eles filtram
  // `/sentry` na URL) — os eventos passam pelo seu próprio domínio.
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
