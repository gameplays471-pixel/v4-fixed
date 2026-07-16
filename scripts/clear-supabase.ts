import { db } from "../src/lib/db";
async function main() {
  console.log("🧹 Limpando todas as tabelas no Supabase...");
  // Ordem respeitando FKs (filhas primeiro)
  const r1 = await db.sessionSet.deleteMany();
  console.log(`  SessionSet: ${r1.count} deletados`);
  const r2 = await db.workoutSession.deleteMany();
  console.log(`  WorkoutSession: ${r2.count} deletados`);
  const r3 = await db.workoutExercise.deleteMany();
  console.log(`  WorkoutExercise: ${r3.count} deletados`);
  const r4 = await db.workout.deleteMany();
  console.log(`  Workout: ${r4.count} deletados`);
  const r5 = await db.favorite.deleteMany();
  console.log(`  Favorite: ${r5.count} deletados`);
  const r6 = await db.exercise.deleteMany();
  console.log(`  Exercise: ${r6.count} deletados`);
  const r7 = await db.user.deleteMany();
  console.log(`  User: ${r7.count} deletados`);
  console.log("✅ Limpo!");
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
