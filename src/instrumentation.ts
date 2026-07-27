import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captura erros que `withErrorHandling` não vê — lançados em Server
// Components, layouts, middleware — não só em rotas de API.
export const onRequestError = Sentry.captureRequestError;
