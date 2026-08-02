import { PrismaClient } from "@prisma/client";

// Em ambientes como Next.js Turbopack dev, o `env("DATABASE_URL")` do
// schema.prisma pode não ser resolvido em runtime. Carregamos a URL
// explicitamente do process.env e a passamos para o PrismaClient.
function loadEnvFile(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  } catch {
    /* ignore */
  }
  return env;
}

/**
 * Ajusta a URL do Postgres para serverless (Vercel) + Supabase pooler:
 * - connection_limit → quantas conexões ESSE processo Prisma pode abrir
 * - pgbouncer=true → desativa prepared statements (obrigatório no transaction mode)
 * - pool_timeout → falha rápido em vez de segurar a lambda
 */
export function withServerlessPoolParams(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const isPooler =
      u.port === "6543" ||
      u.hostname.includes("pooler") ||
      u.searchParams.get("pgbouncer") === "true";

    if (isPooler && !u.searchParams.has("pgbouncer")) {
      u.searchParams.set("pgbouncer", "true");
    }
    if (!u.searchParams.has("connection_limit")) {
      // BUG DE PERFORMANCE (corrigido): o valor era fixo em "1" pensando em
      // "1 isolate serverless = 1 conexão, o PgBouncer multiplexa entre
      // isolates". Isso só é seguro quando cada request roda numa isolate
      // nova de verdade. Aqui o app roda como processo Node ÚNICO e
      // persistente (`next dev` / `bun .next/standalone/server.js`), então
      // connection_limit=1 forçava TODAS as queries — de todos os usuários,
      // todas as abas, todas as chamadas em paralelo da própria tela do
      // jogo (summary + groups + ranking) — a competir por UMA única
      // conexão com o Postgres, enfileiradas. Sob qualquer concorrência
      // isso estourava o pool_timeout (10s) e a UI ficava travada até
      // reload. 10 conexões é folgado o bastante pro tráfego desse
      // processo único e ainda continua barato pro pooler (que já existe
      // justamente pra aguentar muito mais que isso).
      u.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT || "10");
    }
    if (!u.searchParams.has("pool_timeout")) {
      u.searchParams.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT || "10");
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

const envFile = loadEnvFile();
const rawDatabaseUrl = process.env.DATABASE_URL || envFile.DATABASE_URL;
const databaseUrl = rawDatabaseUrl ? withServerlessPoolParams(rawDatabaseUrl) : undefined;

if (!databaseUrl) {
  console.warn("[db.ts] Aviso: DATABASE_URL não encontrada em process.env nem em .env");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG === "1" ? ["warn", "error"] : [],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
