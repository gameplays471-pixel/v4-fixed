import { db } from "../src/lib/db";
async function main() {
  const total = await db.exercise.count();
  console.log(`Total exercises: ${total}`);
  // Sample first 3
  const sample = await db.exercise.findMany({ take: 3, orderBy: { name: "asc" } });
  console.log("Sample:");
  for (const e of sample) {
    console.log(`  - ${e.name} [${e.muscleGroup}] slug=${e.slug}`);
  }
  await db.$disconnect();
}
main();
