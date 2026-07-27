import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // 100% em dev pra você ver tudo enquanto testa; em produção, uma amostra
  // menor é suficiente pra pegar padrões de performance sem gerar volume
  // (e custo) desnecessário. Ajuste conforme o tráfego real crescer.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Desliga sozinho se a DSN não estiver configurada (ex.: preview local
  // sem .env de Sentry) — não trava nem faz barulho no build.
  enabled: !!process.env.SENTRY_DSN,
  debug: false,
});
