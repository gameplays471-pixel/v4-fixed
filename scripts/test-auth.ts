// Simulate what happens after login
async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@hevy.com", password: "demo123" }),
  });
  console.log("Login status:", loginRes.status);
  const setCookie = loginRes.headers.get("set-cookie");
  console.log("Set-Cookie header:", setCookie);
  
  if (!setCookie) {
    console.log("No cookie set, aborting");
    return;
  }
  
  // Extract the cookie value
  const cookieMatch = setCookie.match(/hevy_session=([^;]+)/);
  if (!cookieMatch) {
    console.log("Could not parse cookie");
    return;
  }
  const cookie = `hevy_session=${cookieMatch[1]}`;
  console.log("Cookie to send:", cookie);
  
  // 2. Try GET /api/auth/me with cookie
  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: { Cookie: cookie },
  });
  console.log("ME status:", meRes.status);
  console.log("ME body:", await meRes.text());
  
  // 3. Try GET /api/workouts with cookie
  const getRes = await fetch("http://localhost:3000/api/workouts", {
    headers: { Cookie: cookie },
  });
  console.log("GET workouts status:", getRes.status);
  const getBody = await getRes.json();
  console.log("GET workouts count:", getBody.workouts?.length);
  
  // 4. Try POST /api/workouts with cookie
  const postRes = await fetch("http://localhost:3000/api/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      name: "Teste Debug",
      description: "Teste",
      color: "#ef4444",
      defaultRest: 90,
      exercises: [],
    }),
  });
  console.log("POST workouts status:", postRes.status);
  console.log("POST workouts body:", await postRes.text());
}

test().catch(console.error);
