/**
 * Aplica no banco de dados as imagens revisadas em
 * scripts/exercise-image-matches.json (gerado por match-exercise-images.ts).
 *
 * Só atualiza o campo `images` de cada exercício via slug — não mexe em
 * nenhum outro dado (treinos, usuários, etc). Seguro para rodar em produção.
 *
 * Uso:
 *   npx tsx scripts/apply-exercise-images.ts
 */
import { readFileSync } from "fs";
import { db } from "../src/lib/db";

type MatchRow = {
  slug: string;
  nome: string;
  hintUsado: string;
  match: string | null;
  score: number;
  images: string[];
  aprovado: boolean;
};

async function main() {
  const raw = readFileSync("scripts/exercise-image-matches.json", "utf-8");
  const rows: MatchRow[] = JSON.parse(raw);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.aprovado || row.images.length === 0) {
      skipped++;
      continue;
    }

    try {
      await db.exercise.update({
        where: { slug: row.slug },
        data: { images: row.images },
      });
      updated++;
      console.log(`✅ ${row.slug} -> ${row.match}`);
    } catch (e) {
      console.error(`❌ Falha ao atualizar ${row.slug}:`, e);
    }
  }

  console.log(`\n📊 ${updated} exercícios atualizados, ${skipped} pulados (sem match aprovado).`);
  console.log("Dica: rode novamente depois de revisar manualmente mais entradas no JSON.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
