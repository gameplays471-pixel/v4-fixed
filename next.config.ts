import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  allowedDevOrigins: [
    "*.space-z.ai",
    "preview-*.space-z.ai",
  ],
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
