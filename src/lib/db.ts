import { PrismaClient } from '@prisma/client'

// Em ambientes como Next.js Turbopack dev, o `env("DATABASE_URL")` do
// schema.prisma pode não ser resolvido em runtime. Carregamos a URL
// explicitamente do process.env e a passamos para o PrismaClient.
// Se process.env.DATABASE_URL estiver vazio, lemos do .env diretamente.
function loadEnvFile(): Record<string, string> {
  const env: Record<string, string> = {}
  try {
    // @ts-ignore — fs é runtime
    const fs = require('fs')
    const path = require('path')
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        let value = trimmed.slice(eqIdx + 1).trim()
        // Remover aspas duplas ou simples envolventes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        env[key] = value
      }
    }
  } catch {}
  return env
}

const envFile = loadEnvFile()
const databaseUrl = process.env.DATABASE_URL || envFile.DATABASE_URL

if (!databaseUrl) {
  console.warn('[db.ts] Aviso: DATABASE_URL não encontrada em process.env nem em .env')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db