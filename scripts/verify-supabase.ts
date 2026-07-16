import { db } from "../src/lib/db";
async function main() {
  console.log("=== Estado atual do Supabase ===");
  console.log("");
  
  const [users, exercises, workouts, wExercises, sessions, sSets, favs] = await Promise.all([
    db.user.findMany({ select: { id: true, email: true, name: true } }),
    db.exercise.count(),
    db.workout.findMany({ select: { id: true, name: true, userId: true } }),
    db.workoutExercise.count(),
    db.workoutSession.count(),
    db.sessionSet.count(),
    db.favorite.count(),
  ]);

  console.log(`👤 Users (${users.length}):`);
  for (const u of users) console.log(`   - ${u.email} (${u.name})`);
  console.log("");
  console.log(`📚 Exercises: ${exercises}`);
  console.log(`💪 Workouts (${workouts.length}):`);
  for (const w of workouts) console.log(`   - ${w.name} (user: ${w.userId})`);
  console.log(`📋 WorkoutExercises: ${wExercises}`);
  console.log(`📅 WorkoutSessions: ${sessions}`);
  console.log(`🏋️  SessionSets: ${sSets}`);
  console.log(`⭐ Favorites: ${favs}`);

  // Verificar integridade referencial: pegar 1 workout e ver se exercises estão linkados
  if (workouts.length > 0) {
    const w0 = workouts[0];
    const wex = await db.workoutExercise.findMany({
      where: { workoutId: w0.id },
      include: { exercise: { select: { name: true } } },
      orderBy: { order: "asc" },
    });
    console.log("");
    console.log(`🔗 Integridade: Treino "${w0.name}" tem ${wex.length} exercícios:`);
    for (const we of wex) {
      console.log(`   ${we.order}. ${we.exercise.name} - ${we.targetSets}x${we.targetReps} reps, descanso ${we.restSeconds}s`);
    }
  }

  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
