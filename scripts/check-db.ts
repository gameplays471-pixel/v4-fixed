import { db } from "../src/lib/db";

async function main() {
  const users = await db.user.findMany({ select: { id: true, email: true, name: true, passwordHash: true } });
  console.log('USERS:', JSON.stringify(users, null, 2));
  
  const workouts = await db.workout.findMany({ include: { exercises: true } });
  console.log('WORKOUTS:', JSON.stringify(workouts.map(w => ({ id: w.id, userId: w.userId, name: w.name, exerciseCount: w.exercises.length })), null, 2));
  
  const exerciseCount = await db.exercise.count();
  console.log('EXERCISE COUNT:', exerciseCount);
  
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
