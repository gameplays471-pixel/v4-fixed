// Exporta TODAS as tabelas para CSV, compatíveis com import no Supabase.
// Saída: /home/z/my-project/download/{table}.csv para cada tabela.
//
// Uso: bun run scripts/export-all-csv.ts

import { Database } from "bun:sqlite";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DB_PATH = "/home/z/my-project/db/custom.db.sqlite-backup";
const OUT_DIR = "/home/z/my-project/download";

const TABLES: Array<{ name: string; columns: string[] }> = [
  {
    name: "User",
    columns: [
      "id", "email", "name", "passwordHash", "bio", "weight", "height",
      "sex", "birthDate", "goal", "avatarUrl", "createdAt", "updatedAt",
    ],
  },
  {
    name: "Exercise",
    columns: [
      "id", "name", "slug", "muscleGroup", "secondaryMuscles", "equipment",
      "category", "equipmentType", "level", "description", "executionSteps",
      "commonMistakes", "tips", "createdAt", "updatedAt",
    ],
  },
  {
    name: "Workout",
    columns: [
      "id", "userId", "name", "description", "defaultRest", "color",
      "createdAt", "updatedAt",
    ],
  },
  {
    name: "WorkoutExercise",
    columns: [
      "id", "workoutId", "exerciseId", "order", "targetSets", "targetReps",
      "restSeconds", "notes",
    ],
  },
  {
    name: "WorkoutSession",
    columns: [
      "id", "userId", "workoutId", "workoutName", "startedAt", "endedAt",
      "durationSec", "totalVolume", "notes",
    ],
  },
  {
    name: "SessionSet",
    columns: [
      "id", "sessionId", "exerciseId", "exerciseName", "setNumber",
      "weight", "reps", "rpe", "rir", "restSeconds", "completedAt", "isPR",
    ],
  },
  {
    name: "Favorite",
    columns: ["id", "userId", "exerciseId", "createdAt"],
  },
];

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function normalizeValue(col: string, v: unknown): string {
  if (v === null || v === undefined) return "";
  // Colunas de data: converter para ISO
  if (col === "createdAt" || col === "updatedAt" || col === "startedAt" || col === "endedAt" || col === "completedAt" || col === "birthDate") {
    if (typeof v === "string") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d.toISOString();
    }
    if (v instanceof Date) return v.toISOString();
    // número = epoch ms (SQLite pode armazenar assim)
    if (typeof v === "number") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? String(v) : d.toISOString();
    }
  }
  // Boolean: SQLite armazena como 0/1, converter para true/false
  if (col === "isPR") {
    if (v === 1 || v === true) return "true";
    if (v === 0 || v === false) return "false";
  }
  return String(v);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const db = new Database(DB_PATH, { readonly: true });

  for (const { name, columns } of TABLES) {
    // Verifica se a tabela existe
    const exists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(name);
    if (!exists) {
      console.log(`⏭  Tabela ${name} não existe, pulando.`);
      continue;
    }

    const rows = db.prepare(`SELECT ${columns.map((c) => `"${c}"`).join(", ")} FROM "${name}"`).all() as Record<string, unknown>[];

    const header = columns.join(",");
    const lines = rows.map((row) => columns.map((col) => csvEscape(normalizeValue(col, row[col])).replace(/\n/g, "\\n")).join(","));
    const csv = [header, ...lines].join("\n");

    const outFile = join(OUT_DIR, `${name}.csv`);
    writeFileSync(outFile, csv, "utf-8");
    console.log(`✅ ${name}: ${rows.length} linhas → ${outFile} (${(csv.length / 1024).toFixed(1)} KB)`);
  }

  db.close();
  console.log("\n📋 Resumo para import no Supabase:");
  console.log("   Ordem recomendada (respeitando FKs):");
  console.log("   1. User.csv");
  console.log("   2. Exercise.csv");
  console.log("   3. Workout.csv");
  console.log("   4. WorkoutExercise.csv");
  console.log("   5. WorkoutSession.csv");
  console.log("   6. SessionSet.csv");
  console.log("   7. Favorite.csv");
  console.log("\n   No Supabase Dashboard → Table Editor → Tabela → 'Import data from CSV'");
}

main();
