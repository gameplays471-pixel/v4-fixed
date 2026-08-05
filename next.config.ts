import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // "standalone" é usado só pelo script `build` (self-hosting/Docker), que
  // copia .next/standalone manualmente depois. Na Vercel (`vercel-build`)
  // esse modo não é usado pra nada — o deploy é empacotado de outro jeito —
  // e combinado com o Turbopack (padrão a partir do Next 16) ele dispara um
  // bug conhecido onde o arquivo de trace `middleware.js.nft.json` não é
  // gerado, quebrando o build com ENOENT. A Vercel sempre define a env var
  // VERCEL=1 durante o build, então usamos isso pra desativar o standalone
  // só nesse ambiente. Ver: github.com/vercel/next.js/issues (múltiplas
  // issues abertas sobre Turbopack + output:standalone + middleware).
  output: process.env.VERCEL ? undefined : "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
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
