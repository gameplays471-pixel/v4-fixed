import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
  // Session Replay ajuda MUITO a entender bug reportado por usuário sem
  // precisar pedir print/vídeo — mas grava a tela, então sampleRate baixo
  // e só em produção. Ajuste/remova se privacidade de dados for
  // preocupação (ex.: cliente white-label sensível).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 0,
  integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
