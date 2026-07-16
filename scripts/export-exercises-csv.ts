// Exporta a tabela de exercícios do SQLite local para CSV
// Formato compatível com o import do Supabase Dashboard.
// Uso: bun run scripts/export-exercises-csv.ts
//
// Saída: /home/z/my-project/download/exercises.csv

import { Database } from "bun:sqlite";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DB_PATH = "/home/z/my-project/db/custom.db.sqlite-backup";
const OUT_DIR = "/home/z/my-project/download";
const OUT_FILE = join(OUT_DIR, "exercises.csv");

// Colunas na mesma ordem do schema Prisma (sem id e datas, que o Supabase gera)
// O Supabase vai gerar novos ids via default(cuid()) — precisamos deixar isso
// acontecer, então não exportamos o id.
//
// Como o Prisma usa cuid() no cliente (não no DB), o PostgreSQL não vai gerar
// ids automaticamente. Para o import via Supabase CSV, a melhor estratégia é
// exportar TODAS as colunas incluindo o id (cuid manual) e importar tudo.
// Mas como os workoutExercises/sessionSets fazem referência via exerciseId,
// e o seed faria isso de forma consistente, vamos exportar o id também.
//
// Decisão: exportar id + todas as colunas. Assim o usuário pode importar
// exercises.csv e depois (opcional) importar as outras tabelas mantendo os ids.

const COLUMNS = [
  "id",
  "name",
  "slug",
  "muscleGroup",
  "secondaryMuscles",
  "equipment",
  "category",
  "equipmentType",
  "level",
  "description",
  "executionSteps",
  "commonMistakes",
  "tips",
  "createdAt",
  "updatedAt",
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Se contém vírgula, aspas, quebra de linha, envolve em aspas duplas e duplica aspas
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const db = new Database(DB_PATH, { readonly: true });

  // Verificar contagem
  const total = db.prepare("SELECT COUNT(*) as c FROM Exercise").get() as { c: number };
  console.log(`📊 Total de exercícios no SQLite: ${total.c}`);

  // Buscar todos os exercícios
  const rows = db.prepare(`SELECT ${COLUMNS.join(", ")} FROM Exercise ORDER BY name`).all() as Record<string, unknown>[];

  // Converter datas para ISO string (formato que Supabase aceita)
  const normalized = rows.map((row) => {
    const out: Record<string, string> = {};
    for (const col of COLUMNS) {
      const v = row[col];
      if (v instanceof Date) {
        out[col] = v.toISOString();
      } else if (typeof v === "string" && col === "createdAt" || col === "updatedAt") {
        // SQLite pode ter armazenado como string ISO ou timestamp
        const d = new Date(v);
        out[col] = isNaN(d.getTime()) ? v : d.toISOString();
      } else {
        out[col] = v === null ? "" : String(v);
      }
    }
    return out;
  });

  // Montar CSV
  const header = COLUMNS.join(",");
  const lines = normalized.map((row) => COLUMNS.map((col) => csvEscape(row[col])).join(","));
  const csv = [header, ...lines].join("\n");

  writeFileSync(OUT_FILE, csv, "utf-8");

  console.log(`✅ Exportado: ${OUT_FILE}`);
  console.log(`   ${normalized.length} exercícios`);
  console.log(`   ${(csv.length / 1024).toFixed(1)} KB`);

  // Mostrar preview dos primeiros 3
  console.log("\n--- Preview (3 primeiros) ---");
  for (const row of normalized.slice(0, 3)) {
    console.log(`  - ${row.name} [${row.muscleGroup}] / ${row.equipment || "sem equipamento"}`);
  }

  db.close();
}

main();
