/**
 * E2E HTTP: login → list exercises → create workout → finalize session → stats
 *
 * Uso:
 *   BASE_URL=https://seu-app.vercel.app EMAIL=aluno1@aluno.com PASSWORD=12345678 bun run scripts/test-e2e-ci.ts
 *   BASE_URL=http://localhost:3000 bun run scripts/test-e2e-ci.ts
 */
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const EMAIL = process.env.EMAIL || "aluno1@aluno.com";
const PASSWORD = process.env.PASSWORD || "12345678";

async function req(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log(`E2E → ${BASE} as ${EMAIL}`);

  const login = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  assert(login.res.ok, `login falhou: ${login.res.status} ${JSON.stringify(login.json)}`);
  const token = (login.json as { token?: string }).token;
  assert(token, "token ausente no login");
  const auth = { Authorization: `Bearer ${token}` };
  console.log("✓ login");

  const ex = await req("/api/exercises", { headers: auth });
  assert(ex.res.ok, `exercises: ${ex.res.status}`);
  const exercises = (ex.json as { exercises: Array<{ id: string; name: string }> }).exercises;
  assert(exercises?.length > 0, "nenhum exercício");
  console.log(`✓ exercises (${exercises.length})`);

  const picks = [exercises[0], exercises[1] || exercises[0], exercises[2] || exercises[0]];
  const create = await req("/api/workouts", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      name: `E2E ${new Date().toISOString().slice(0, 16)}`,
      defaultRest: 90,
      exercises: picks.map((e, i) => ({
        exerciseId: e.id,
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      })),
    }),
  });
  assert(create.res.ok, `create workout: ${create.res.status} ${JSON.stringify(create.json)}`);
  const workout = (create.json as { workout: { id: string } }).workout;
  assert(workout?.id, "workout.id ausente");
  console.log(`✓ workout ${workout.id}`);

  const startedAt = new Date(Date.now() - 45 * 60_000).toISOString();
  const session = await req("/api/sessions", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      workoutId: workout.id,
      workoutName: "E2E",
      startedAt,
      endedAt: new Date().toISOString(),
      durationSec: 2700,
      sets: picks.flatMap((e) =>
        [1, 2, 3].map((n) => ({
          exerciseId: e.id,
          exerciseName: e.name,
          weight: 40 + n * 2.5,
          reps: 10,
          restSeconds: 90,
          rir: 2,
        }))
      ),
    }),
  });
  assert(session.res.ok, `session: ${session.res.status} ${JSON.stringify(session.json)}`);
  console.log("✓ session finalize");

  const stats = await req("/api/stats", { headers: auth });
  assert(stats.res.ok, `stats: ${stats.res.status}`);
  const s = (stats.json as { stats: { totalSessions: number } | null }).stats;
  assert(s && s.totalSessions >= 1, "stats.totalSessions inválido");
  console.log(`✓ stats (sessions=${s.totalSessions})`);

  console.log("\nE2E OK");
}

main().catch((e) => {
  console.error("\nE2E FAIL", e);
  process.exit(1);
});
