// Importa todos os CSVs (exceto Exercise.csv) para o Supabase
// via Prisma. Lê os CSVs exportados do SQLite e insere preservando os IDs.
//
// Uso: bun run scripts/import-csv-to-supabase.ts

import { db } from "../src/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

const CSV_DIR = "/home/z/my-project/download";

// Parser CSV simples (não usa libs externas)
// Trata: aspas duplas, vírgulas dentro de aspas, \n dentro de aspas, "" escape
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ",") {
        current.push(field);
        field = "";
        i++;
        continue;
      } else if (char === "\n") {
        current.push(field);
        rows.push(current);
        current = [];
        field = "";
        i++;
        continue;
      } else if (char === "\r") {
        i++;
        continue;
      } else {
        field += char;
        i++;
        continue;
      }
    }
  }
  // Último field
  if (field !== "" || current.length > 0) {
    current.push(field);
    rows.push(current);
  }
  return rows;
}

function loadCSV(filename: string): Record<string, string>[] {
  const content = readFileSync(join(CSV_DIR, filename), "utf-8");
  const rows = parseCSV(content);
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).filter((r) => r.length === header.length).map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

// Converte string para valor Prisma
function toDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function toInt(s: string): number | null {
  if (s === "" || s === undefined) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function toFloat(s: string): number | null {
  if (s === "" || s === undefined) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function toBool(s: string): boolean {
  return s === "true" || s === "1" || s === "TRUE";
}

// Restaura \n nas strings (no CSV foi escapado como \\n literal)
function unescape(s: string): string {
  if (s === undefined) return "";
  return s.replace(/\\n/g, "\n");
}

async function main() {
  console.log("🚀 Importando CSVs para o Supabase (exceto Exercise)\n");

  // 1. User
  console.log("👤 User...");
  const users = loadCSV("User.csv");
  console.log(`   ${users.length} linhas no CSV`);
  if (users.length > 0) {
    await db.user.createMany({
      data: users.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        passwordHash: r.passwordHash,
        bio: r.bio || null,
        weight: toFloat(r.weight),
        height: toFloat(r.height),
        sex: r.sex || null,
        birthDate: toDate(r.birthDate),
        goal: r.goal || null,
        avatarUrl: r.avatarUrl || null,
        createdAt: toDate(r.createdAt) || new Date(),
        updatedAt: toDate(r.updatedAt) || new Date(),
      })),
      skipDuplicates: true,
    });
    console.log(`   ✅ ${users.length} usuários inseridos`);
  }

  // 3. Workout
  console.log("\n💪 Workout...");
  const workouts = loadCSV("Workout.csv");
  console.log(`   ${workouts.length} linhas no CSV`);
  if (workouts.length > 0) {
    await db.workout.createMany({
      data: workouts.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.name,
        description: r.description || null,
        defaultRest: toInt(r.defaultRest) || 90,
        color: r.color || null,
        createdAt: toDate(r.createdAt) || new Date(),
        updatedAt: toDate(r.updatedAt) || new Date(),
      })),
      skipDuplicates: true,
    });
    console.log(`   ✅ ${workouts.length} treinos inseridos`);
  }

  // 4. WorkoutExercise
  console.log("\n📋 WorkoutExercise...");
  const workoutExercises = loadCSV("WorkoutExercise.csv");
  console.log(`   ${workoutExercises.length} linhas no CSV`);
  if (workoutExercises.length > 0) {
    await db.workoutExercise.createMany({
      data: workoutExercises.map((r) => ({
        id: r.id,
        workoutId: r.workoutId,
        exerciseId: r.exerciseId,
        order: toInt(r.order) || 0,
        targetSets: toInt(r.targetSets) || 3,
        targetReps: toInt(r.targetReps) || 10,
        restSeconds: toInt(r.restSeconds) || 90,
        notes: r.notes ? unescape(r.notes) : null,
      })),
      skipDuplicates: true,
    });
    console.log(`   ✅ ${workoutExercises.length} treino-exercícios inseridos`);
  }

  // 5. WorkoutSession
  console.log("\n📅 WorkoutSession...");
  const sessions = loadCSV("WorkoutSession.csv");
  console.log(`   ${sessions.length} linhas no CSV`);
  if (sessions.length > 0) {
    await db.workoutSession.createMany({
      data: sessions.map((r) => ({
        id: r.id,
        userId: r.userId,
        workoutId: r.workoutId || null,
        workoutName: r.workoutName,
        startedAt: toDate(r.startedAt) || new Date(),
        endedAt: toDate(r.endedAt),
        durationSec: toInt(r.durationSec) || 0,
        totalVolume: toFloat(r.totalVolume) || 0,
        notes: r.notes ? unescape(r.notes) : null,
      })),
      skipDuplicates: true,
    });
    console.log(`   ✅ ${sessions.length} sessões inseridas`);
  }

  // 6. SessionSet
  console.log("\n🏋️ SessionSet...");
  const sessionSets = loadCSV("SessionSet.csv");
  console.log(`   ${sessionSets.length} linhas no CSV`);
  if (sessionSets.length > 0) {
    // Inserir em batches de 50 (PgBouncer tem limite de parâmetros)
    const BATCH = 50;
    for (let i = 0; i < sessionSets.length; i += BATCH) {
      const batch = sessionSets.slice(i, i + BATCH);
      await db.sessionSet.createMany({
        data: batch.map((r) => ({
          id: r.id,
          sessionId: r.sessionId,
          exerciseId: r.exerciseId,
          exerciseName: r.exerciseName,
          setNumber: toInt(r.setNumber) || 0,
          weight: toFloat(r.weight) || 0,
          reps: toInt(r.reps) || 0,
          rpe: toFloat(r.rpe),
          rir: toFloat(r.rir),
          restSeconds: toInt(r.restSeconds) || 90,
          completedAt: toDate(r.completedAt) || new Date(),
          isPR: toBool(r.isPR),
        })),
        skipDuplicates: true,
      });
      process.stdout.write(`\r   📦 ${Math.min(i + BATCH, sessionSets.length)}/${sessionSets.length} inseridos`);
    }
    console.log(`\n   ✅ ${sessionSets.length} sets inseridos`);
  }

  // 7. Favorite
  console.log("\n⭐ Favorite...");
  const favorites = loadCSV("Favorite.csv");
  console.log(`   ${favorites.length} linhas no CSV`);
  if (favorites.length > 0) {
    await db.favorite.createMany({
      data: favorites.map((r) => ({
        id: r.id,
        userId: r.userId,
        exerciseId: r.exerciseId,
        createdAt: toDate(r.createdAt) || new Date(),
      })),
      skipDuplicates: true,
    });
    console.log(`   ✅ ${favorites.length} favoritos inseridos`);
  }

  // Resumo final
  console.log("\n📊 Contagem final:");
  const counts = {
    users: await db.user.count(),
    exercises: await db.exercise.count(),
    workouts: await db.workout.count(),
    workoutExercises: await db.workoutExercise.count(),
    sessions: await db.workoutSession.count(),
    sessionSets: await db.sessionSet.count(),
    favorites: await db.favorite.count(),
  };
  console.log(JSON.stringify(counts, null, 2));

  await db.$disconnect();
  console.log("\n✅ Importação concluída!");
}

main().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
