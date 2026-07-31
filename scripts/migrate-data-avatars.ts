/**
 * One-shot: remove avatares data: (base64) da coluna User.avatarUrl.
 *
 * Uso:
 *   bun run scripts/migrate-data-avatars.ts
 *   bun run scripts/migrate-data-avatars.ts --upload   # tenta Blob se token existir
 *   bun run scripts/migrate-data-avatars.ts --dry-run
 *
 * Sem --upload: zera avatarUrl (null) nas linhas data: — libera espaço no Postgres.
 * Com --upload + BLOB_READ_WRITE_TOKEN: sobe pro Vercel Blob e grava a URL https.
 */
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const dryRun = process.argv.includes("--dry-run");
const tryUpload = process.argv.includes("--upload");

function withPool(url: string): string {
  try {
    const u = new URL(url);
    if (u.port === "6543" || u.hostname.includes("pooler")) {
      u.searchParams.set("pgbouncer", "true");
    }
    u.searchParams.set("connection_limit", "5");
    return u.toString();
  } catch {
    return url;
  }
}

const raw = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!raw) {
  console.error("Defina DATABASE_URL ou DIRECT_URL");
  process.exit(1);
}

// Prefer DIRECT_URL (session mode) for bulk updates
const url = withPool(process.env.DIRECT_URL || raw);
const db = new PrismaClient({ datasources: { db: { url } } });

const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
  "";

async function uploadDataUrl(userId: string, dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, b64] = match;
  const buffer = Buffer.from(b64, "base64");
  if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) return null;
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const blob = await put(`avatars/${userId}/migrated-${Date.now()}.${ext}`, buffer, {
    access: "public",
    contentType: mime,
    addRandomSuffix: true,
    token: blobToken,
  });
  return blob.url;
}

async function main() {
  const users = await db.user.findMany({
    where: { avatarUrl: { startsWith: "data:" } },
    select: { id: true, email: true, avatarUrl: true },
  });

  console.log(`Encontrados ${users.length} usuário(s) com avatar data: URL`);
  if (users.length === 0) {
    await db.$disconnect();
    return;
  }

  let cleared = 0;
  let uploaded = 0;
  let failed = 0;

  for (const u of users) {
    const sizeKb = Math.round(((u.avatarUrl?.length || 0) * 0.75) / 1024);
    console.log(`- ${u.email} (~${sizeKb} KB base64)`);

    if (dryRun) continue;

    try {
      if (tryUpload && blobToken && u.avatarUrl) {
        const url = await uploadDataUrl(u.id, u.avatarUrl);
        if (url) {
          await db.user.update({ where: { id: u.id }, data: { avatarUrl: url } });
          uploaded++;
          console.log(`  → Blob: ${url}`);
          continue;
        }
        console.warn("  → upload falhou, zerando");
      }
      await db.user.update({ where: { id: u.id }, data: { avatarUrl: null } });
      cleared++;
      console.log("  → avatarUrl = null");
    } catch (e) {
      failed++;
      console.error("  → erro", e);
    }
  }

  console.log(
    dryRun
      ? `Dry-run: ${users.length} seriam processados`
      : `Pronto. uploaded=${uploaded} cleared=${cleared} failed=${failed}`
  );
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
