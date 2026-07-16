async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@hevy.com", password: "demo123" }),
  });
  const loginData = await loginRes.json();
  console.log("✓ Login:", loginRes.status, "token:", loginData.token ? "present" : "MISSING");
  
  if (!loginData.token) {
    console.log("❌ No token in login response!");
    return;
  }
  
  const token = loginData.token;
  
  // 2. GET /api/auth/me with Bearer token (no cookies)
  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log("✓ /api/auth/me with Bearer:", meRes.status, "user:", meData.user?.email || "NULL");
  
  // 3. GET /api/workouts with Bearer token
  const getWorkoutsRes = await fetch("http://localhost:3000/api/workouts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const workoutsData = await getWorkoutsRes.json();
  console.log("✓ GET /api/workouts with Bearer:", getWorkoutsRes.status, "count:", workoutsData.workouts?.length);
  
  // 4. POST /api/workouts with Bearer token (the original failing case!)
  const postRes = await fetch("http://localhost:3000/api/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Teste Bearer Token",
      description: "Treino de teste",
      color: "#3b82f6",
      defaultRest: 90,
      exercises: [],
    }),
  });
  const postData = await postRes.json();
  console.log("✓ POST /api/workouts with Bearer:", postRes.status, "id:", postData.workout?.id || postData.error);
  
  // 5. Test GET /api/workouts without token (should return 401 now)
  const noTokenRes = await fetch("http://localhost:3000/api/workouts");
  console.log("✓ GET /api/workouts WITHOUT token:", noTokenRes.status, "(should be 401)");
  
  // 6. Test GET /api/exercises (public, no auth needed)
  const exRes = await fetch("http://localhost:3000/api/exercises?");
  const exData = await exRes.json();
  console.log("✓ GET /api/exercises:", exRes.status, "count:", exData.exercises?.length);
  
  // Sample exercise with image
  const withImage = exData.exercises?.find((e: any) => e.imageUrl);
  const withGif = exData.exercises?.find((e: any) => e.gifUrl);
  console.log("   Sample with imageUrl:", withImage?.name, "->", withImage?.imageUrl?.substring(0, 60) + "...");
  console.log("   Sample with gifUrl:", withGif?.name, "->", withGif?.gifUrl?.substring(0, 60) + "...");
}

test().catch(console.error);
