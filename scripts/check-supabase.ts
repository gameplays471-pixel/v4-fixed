import { db } from "../src/lib/db";
async function main() {
  const counts = {
    users: await db.user.count(),
    exercises: await db.exercise.count(),
    workouts: await db.workout.count(),
    workoutExercises: await db.workoutExercise.count(),
    sessions: await db.workoutSession.count(),
    sessionSets: await db.sessionSet.count(),
    favorites: await db.favorite.count(),
  };
  console.log("Counts:", JSON.stringify(counts, null, 2));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
