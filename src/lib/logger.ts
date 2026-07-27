// Logger estruturado, sem dependência externa.
//
// Por quê JSON em vez de `console.log("string bonita")`: a Vercel já
// captura tudo que vai pra stdout/stderr no painel de Runtime Logs, e se
// cada linha for um objeto JSON, dá pra filtrar por campo (route, level,
// userId, requestId) direto ali, ou mandar pra um log drain (Axiom,
// Logtail, Datadog etc.) depois sem mudar uma linha de código — o "setup
// básico" é só isso: log estruturado agora, escolher pra onde ele escoa
// depois, conforme o volume justificar.
//
// Não é um substituto do Sentry: Sentry agrupa erros, manda alerta,
// mostra stack trace com source map. O logger aqui é pro resto — request
// concluída, tentativa de rate limit, ação de admin — coisas que você
// quer poder consultar depois, mesmo sem terem "dado erro".

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, context?: LogContext) {
  const line = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  const serialized = JSON.stringify(line);
  if (level === "error") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.log(serialized);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
};

/** Id curto pra correlacionar uma requisição entre o log do servidor e o que o usuário vê/reporta. */
export function newRequestId(): string {
  return crypto.randomUUID().split("-")[0];
}
