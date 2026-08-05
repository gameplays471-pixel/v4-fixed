import { PrismaClient } from '@prisma/client'

/**
 * Singleton do PrismaClient.
 * A DATABASE_URL é lida exclusivamente de process.env — injetada pelo
 * ambiente de execução (Docker, Vercel, .env carregado pelo Next.js).
 * Nunca lemos o arquivo .env manualmente aqui.
 */

if (!process.env.DATABASE_URL) {
  console.warn(
    '[db] AVISO: DATABASE_URL não encontrada em process.env. ' +
    'Certifique-se de definir a variável no ambiente antes de iniciar.'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
