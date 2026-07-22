/**
 * Converte scripts/exercise-image-matches.json (gerado por
 * match-exercise-images.ts) em um arquivo .sql pronto para colar no
 * SQL Editor do Supabase. Não toca no banco — só gera o arquivo.
 *
 * Uso:
 *   bun run scripts/generate-sql.ts
 *
 * Gera: scripts/exercise-images-update.sql
 */
import { readFileSync, writeFileSync } from "fs";

type MatchRow = {
  slug: string;
  nome: string;
  hintUsado: string;
  match: string | null;
  score: number;
  images: string[];
  aprovado: boolean;
};

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function main() {
  const raw = readFileSync("scripts/exercise-image-matches.json", "utf-8");
  const rows: MatchRow[] = JSON.parse(raw);

  const lines: string[] = [
    "-- Gerado a partir de scripts/exercise-image-matches.json",
    "-- Cole este conteúdo no SQL Editor do Supabase e clique em RUN.",
    "-- Atualiza só a coluna images, por slug — não mexe em mais nada.",
    "",
  ];

  let count = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.aprovado || row.images.length === 0) {
      skipped++;
      continue;
    }
    const arr = row.images.map((u) => `'${sqlEscape(u)}'`).join(", ");
    lines.push(
      `UPDATE "Exercise" SET images = ARRAY[${arr}] WHERE slug = '${sqlEscape(row.slug)}'; -- ${row.match}`
    );
    count++;
  }

  writeFileSync("scripts/exercise-images-update.sql", lines.join("\n") + "\n");
  console.log(`✅ Gerado scripts/exercise-images-update.sql com ${count} UPDATEs (${skipped} pulados sem match aprovado).`);
  console.log("Abra esse arquivo, copie o conteúdo e cole no SQL Editor do Supabase.");
}

main();
