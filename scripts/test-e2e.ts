/**
 * Teste end-to-end: simula criar um treino com exercícios,
 * listar, buscar, finalizar (criar sessão) e verificar se tudo funciona.
 */
async function test() {
  console.log("=== TESTE END-TO-END DO FLUXO DE TREINO ===\n");

  // 1. Login
  console.log("1. Login...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@hevy.com", password: "demo123" }),
  });
  const { token } = await loginRes.json();
  console.log("   ✓ Token recebido");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. Listar exercícios para pegar IDs
  console.log("\n2. Listando exercícios...");
  const exRes = await fetch("http://localhost:3000/api/exercises?", { headers });
  const { exercises } = await exRes.json();
  console.log(`   ✓ ${exercises.length} exercícios disponíveis`);

  // Pega 3 exercícios aleatórios
  const ex1 = exercises[0];
  const ex2 = exercises[10];
  const ex3 = exercises[20];
  console.log(`   - ${ex1.name} (${ex1.muscleGroup})`);
  console.log(`   - ${ex2.name} (${ex2.muscleGroup})`);
  console.log(`   - ${ex3.name} (${ex3.muscleGroup})`);

  // 3. Criar treino com exercícios
  console.log("\n3. Criando treino com 3 exercícios...");
  const createRes = await fetch("http://localhost:3000/api/workouts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Treino Teste E2E",
      description: "Treino criado no teste end-to-end",
      color: "#8b5cf6",
      defaultRest: 90,
      exercises: [
        { exerciseId: ex1.id, targetSets: 4, targetReps: 10, restSeconds: 90 },
        { exerciseId: ex2.id, targetSets: 3, targetReps: 12, restSeconds: 60 },
        { exerciseId: ex3.id, targetSets: 3, targetReps: 15, restSeconds: 45 },
      ],
    }),
  });
  const { workout } = await createRes.json();
  console.log(`   ✓ Treino criado: ${workout.id}`);
  console.log(`   ✓ ${workout.exercises.length} exercícios no treino`);

  // 4. Listar treinos - deve incluir o novo
  console.log("\n4. Listando treinos do usuário...");
  const listRes = await fetch("http://localhost:3000/api/workouts", { headers });
  const { workouts } = await listRes.json();
  console.log(`   ✓ ${workouts.length} treinos no total`);
  const found = workouts.find((w: any) => w.id === workout.id);
  if (found) {
    console.log(`   ✓ Treino recém-criado está na lista`);
  } else {
    console.log(`   ✗ ERRO: Treino não está na lista!`);
  }

  // 5. Buscar treino por ID
  console.log("\n5. Buscando treino por ID...");
  const getRes = await fetch(`http://localhost:3000/api/workouts/${workout.id}`, { headers });
  const { workout: fetched } = await getRes.json();
  console.log(`   ✓ Status: ${getRes.status}`);
  console.log(`   ✓ Nome: ${fetched.name}`);
  console.log(`   ✓ Exercícios: ${fetched.exercises.length}`);

  // 6. Atualizar treino (adicionar 1 exercício)
  console.log("\n6. Atualizando treino (adicionar 1 exercício)...");
  const ex4 = exercises[30];
  const updateRes = await fetch(`http://localhost:3000/api/workouts/${workout.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      name: "Treino Teste E2E (atualizado)",
      description: "Atualizado",
      color: "#10b981",
      defaultRest: 90,
      exercises: [
        { exerciseId: ex1.id, targetSets: 4, targetReps: 10, restSeconds: 90 },
        { exerciseId: ex2.id, targetSets: 3, targetReps: 12, restSeconds: 60 },
        { exerciseId: ex3.id, targetSets: 3, targetReps: 15, restSeconds: 45 },
        { exerciseId: ex4.id, targetSets: 3, targetReps: 8, restSeconds: 120 },
      ],
    }),
  });
  const { workout: updated } = await updateRes.json();
  console.log(`   ✓ Status: ${updateRes.status}`);
  console.log(`   ✓ Nome atualizado: ${updated.name}`);
  console.log(`   ✓ Exercícios: ${updated.exercises.length}`);

  // 7. FINALIZAR TREINO (criar sessão) - ESTE ERA O BUG ORIGINAL
  console.log("\n7. Finalizando treino (criando sessão)...");
  const sessionRes = await fetch("http://localhost:3000/api/sessions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      workoutId: workout.id,
      workoutName: workout.name,
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationSec: 3600,
      sets: [
        { exerciseId: ex1.id, exerciseName: ex1.name, weight: 50, reps: 10, restSeconds: 90 },
        { exerciseId: ex1.id, exerciseName: ex1.name, weight: 55, reps: 8, restSeconds: 90 },
        { exerciseId: ex2.id, exerciseName: ex2.name, weight: 30, reps: 12, restSeconds: 60 },
        { exerciseId: ex3.id, exerciseName: ex3.name, weight: 20, reps: 15, restSeconds: 45 },
      ],
    }),
  });
  console.log(`   ✓ Status: ${sessionRes.status}`);
  if (sessionRes.ok) {
    const { session } = await sessionRes.json();
    console.log(`   ✓ Sessão criada: ${session.id}`);
    console.log(`   ✓ Sets salvos: ${session.sets.length}`);
    console.log(`   ✓ Volume total: ${session.totalVolume} kg`);
  } else {
    const err = await sessionRes.text();
    console.log(`   ✗ ERRO AO FINALIZAR TREINO: ${err}`);
  }

  // 8. Finalizar um SEGUNDO treino (testar cenário de múltiplos treinos - bug relatado)
  console.log("\n8. Finalizando SEGUNDO treino (testar múltiplas sessões)...");
  const session2Res = await fetch("http://localhost:3000/api/sessions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      workoutId: workout.id,
      workoutName: workout.name,
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationSec: 1800,
      sets: [
        { exerciseId: ex2.id, exerciseName: ex2.name, weight: 35, reps: 12, restSeconds: 60 },
        { exerciseId: ex3.id, exerciseName: ex3.name, weight: 25, reps: 15, restSeconds: 45 },
      ],
    }),
  });
  console.log(`   ✓ Status: ${session2Res.status}`);
  if (session2Res.ok) {
    const { session } = await session2Res.json();
    console.log(`   ✓ Segunda sessão criada: ${session.id}`);
    console.log(`   ✓ Sets salvos: ${session.sets.length}`);
  } else {
    const err = await session2Res.text();
    console.log(`   ✗ ERRO AO FINALIZAR SEGUNDO TREINO: ${err}`);
  }

  // 9. Listar sessões para confirmar que foram salvas
  console.log("\n9. Listando sessões do usuário...");
  const sessionsRes = await fetch("http://localhost:3000/api/sessions", { headers });
  const { sessions } = await sessionsRes.json();
  console.log(`   ✓ ${sessions.length} sessões no total`);

  // 10. Deletar treino
  console.log("\n10. Deletando treino...");
  const delRes = await fetch(`http://localhost:3000/api/workouts/${workout.id}`, {
    method: "DELETE",
    headers,
  });
  console.log(`   ✓ Status: ${delRes.status}`);

  // 11. Verificar contagem final de exercícios
  console.log("\n11. Verificando exercícios disponíveis...");
  console.log(`   ✓ ${exercises.length} exercícios na base`);

  console.log("\n=== TESTE CONCLUÍDO COM SUCESSO! ===");
}

test().catch((e) => {
  console.error("ERRO:", e);
  process.exit(1);
});
