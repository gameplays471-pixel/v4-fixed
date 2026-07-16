// Seed do banco de dados
import { db } from "../src/lib/db";
import { exercisesData } from "../src/lib/exercises-data";
import { readFileSync, existsSync } from "fs";

type ImageMap = Record<string, { imageUrl: string | null; gifUrl: string | null }>;

async function main() {
  console.log("🌱 Iniciando seed...");

  // Carrega cache de imagens (se existir)
  let imageMap: ImageMap = {};
  if (existsSync("/home/z/my-project/scripts/exercise-images.json")) {
    imageMap = JSON.parse(
      readFileSync("/home/z/my-project/scripts/exercise-images.json", "utf-8")
    );
    console.log(`📸 Cache de imagens: ${Object.keys(imageMap).length} exercícios`);
  }

  // Limpar dados existentes (cuidado: apaga tudo!)
  console.log("🧹 Limpando dados existentes...");
  await db.sessionSet.deleteMany();
  await db.workoutSession.deleteMany();
  await db.workoutExercise.deleteMany();
  await db.workout.deleteMany();
  await db.favorite.deleteMany();
  await db.exercise.deleteMany();
  await db.user.deleteMany();

  // Criar usuário demo
  console.log("👤 Criando usuário demo...");
  const user = await db.user.create({
    data: {
      email: "demo@hevy.com",
      name: "Atleta Demo",
      passwordHash: "demo123", // simplificado para demo
      bio: "Foco em hipertrofia há 3 anos. Treino ABC 5x na semana.",
      weight: 78.5,
      height: 178,
      sex: "M",
      birthDate: new Date("1998-05-12"),
      goal: "Hipertrofia",
    },
  });

  // Criar exercícios
  console.log(`📚 Inserindo ${exercisesData.length} exercícios...`);
  for (const ex of exercisesData) {
    const cached = imageMap[ex.slug];
    await db.exercise.create({
      data: {
        name: ex.name,
        slug: ex.slug,
        muscleGroup: ex.muscleGroup,
        secondaryMuscles: ex.secondaryMuscles ?? null,
        equipment: ex.equipment ?? null,
        category: ex.category,
        equipmentType: ex.equipmentType ?? null,
        level: ex.level,
        description: ex.description ?? null,
        executionSteps: ex.executionSteps ?? null,
        commonMistakes: ex.commonMistakes ?? null,
        tips: ex.tips ?? null,
        imageUrl: ex.imageUrl ?? cached?.imageUrl ?? null,
        gifUrl: ex.gifUrl ?? cached?.gifUrl ?? null,
        videoUrl: ex.videoUrl ?? null,
      },
    });
  }

  // Criar treino demo (ABC)
  console.log("💪 Criando treinos demo...");
  const supinoReto = await db.exercise.findUnique({ where: { slug: "supino-reto-barra" } });
  const supinoIncHal = await db.exercise.findUnique({ where: { slug: "supino-inclinado-halteres" } });
  const crucifixo = await db.exercise.findUnique({ where: { slug: "crucifixo-halteres" } });
  const crossover = await db.exercise.findUnique({ where: { slug: "crossover-polia" } });
  const tricepsPulley = await db.exercise.findUnique({ where: { slug: "triceps-pulley" } });
  const tricepsCorda = await db.exercise.findUnique({ where: { slug: "triceps-corda" } });
  const puxada = await db.exercise.findUnique({ where: { slug: "puxada-frontal" } });
  const remadaCurvada = await db.exercise.findUnique({ where: { slug: "remada-curvada-barra" } });
  const remadaBaixa = await db.exercise.findUnique({ where: { slug: "remada-baixa-polia" } });
  const roscaDireta = await db.exercise.findUnique({ where: { slug: "rosca-direta-barra" } });
  const roscaMartelo = await db.exercise.findUnique({ where: { slug: "rosca-martelo" } });
  const agachamento = await db.exercise.findUnique({ where: { slug: "agachamento-livre-barra" } });
  const legPress = await db.exercise.findUnique({ where: { slug: "leg-press-45" } });
  const cadeiraExt = await db.exercise.findUnique({ where: { slug: "cadeira-extensora" } });
  const mesaFlex = await db.exercise.findUnique({ where: { slug: "mesa-flexora" } });
  const panturrilha = await db.exercise.findUnique({ where: { slug: "panturrilha-pe" } });

  if (supinoReto && supinoIncHal && crucifixo && crossover && tricepsPulley && tricepsCorda) {
    const treinoA = await db.workout.create({
      data: {
        userId: user.id,
        name: "Treino A - Peito e Tríceps",
        description: "Foco em hipertrofia do peito e tríceps",
        defaultRest: 90,
        color: "#ef4444",
      },
    });

    await db.workoutExercise.createMany({
      data: [
        { workoutId: treinoA.id, exerciseId: supinoReto.id, order: 1, targetSets: 4, targetReps: 8, restSeconds: 120 },
        { workoutId: treinoA.id, exerciseId: supinoIncHal.id, order: 2, targetSets: 4, targetReps: 10, restSeconds: 90 },
        { workoutId: treinoA.id, exerciseId: crucifixo.id, order: 3, targetSets: 3, targetReps: 12, restSeconds: 60 },
        { workoutId: treinoA.id, exerciseId: crossover.id, order: 4, targetSets: 3, targetReps: 15, restSeconds: 60 },
        { workoutId: treinoA.id, exerciseId: tricepsPulley.id, order: 5, targetSets: 4, targetReps: 10, restSeconds: 60 },
        { workoutId: treinoA.id, exerciseId: tricepsCorda.id, order: 6, targetSets: 3, targetReps: 12, restSeconds: 60 },
      ],
    });
  }

  if (puxada && remadaCurvada && remadaBaixa && roscaDireta && roscaMartelo) {
    const treinoB = await db.workout.create({
      data: {
        userId: user.id,
        name: "Treino B - Costas e Bíceps",
        description: "Foco em hipertrofia das costas e bíceps",
        defaultRest: 90,
        color: "#10b981",
      },
    });

    await db.workoutExercise.createMany({
      data: [
        { workoutId: treinoB.id, exerciseId: puxada.id, order: 1, targetSets: 4, targetReps: 10, restSeconds: 90 },
        { workoutId: treinoB.id, exerciseId: remadaCurvada.id, order: 2, targetSets: 4, targetReps: 8, restSeconds: 120 },
        { workoutId: treinoB.id, exerciseId: remadaBaixa.id, order: 3, targetSets: 3, targetReps: 12, restSeconds: 90 },
        { workoutId: treinoB.id, exerciseId: roscaDireta.id, order: 4, targetSets: 4, targetReps: 10, restSeconds: 60 },
        { workoutId: treinoB.id, exerciseId: roscaMartelo.id, order: 5, targetSets: 3, targetReps: 12, restSeconds: 60 },
      ],
    });
  }

  if (agachamento && legPress && cadeiraExt && mesaFlex && panturrilha) {
    const treinoC = await db.workout.create({
      data: {
        userId: user.id,
        name: "Treino C - Pernas",
        description: "Foco em hipertrofia de pernas",
        defaultRest: 120,
        color: "#f59e0b",
      },
    });

    await db.workoutExercise.createMany({
      data: [
        { workoutId: treinoC.id, exerciseId: agachamento.id, order: 1, targetSets: 4, targetReps: 8, restSeconds: 180 },
        { workoutId: treinoC.id, exerciseId: legPress.id, order: 2, targetSets: 4, targetReps: 10, restSeconds: 120 },
        { workoutId: treinoC.id, exerciseId: cadeiraExt.id, order: 3, targetSets: 3, targetReps: 12, restSeconds: 60 },
        { workoutId: treinoC.id, exerciseId: mesaFlex.id, order: 4, targetSets: 3, targetReps: 12, restSeconds: 60 },
        { workoutId: treinoC.id, exerciseId: panturrilha.id, order: 5, targetSets: 4, targetReps: 15, restSeconds: 45 },
      ],
    });
  }

  // Criar histórico de sessões demo (últimos 30 dias)
  console.log("📅 Criando histórico demo...");
  const now = new Date();
  const treinos = await db.workout.findMany({ where: { userId: user.id }, include: { exercises: { include: { exercise: true } } } });

  for (let i = 0; i < 12; i++) {
    const daysAgo = Math.floor(Math.random() * 25) + 1;
    const sessionDate = new Date(now);
    sessionDate.setDate(now.getDate() - daysAgo);
    sessionDate.setHours(6 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

    const workout = treinos[i % treinos.length];
    if (!workout) continue;

    const startedAt = new Date(sessionDate);
    const endedAt = new Date(sessionDate.getTime() + 60 * 60 * 1000); // ~1h

    let totalVolume = 0;
    const setsData: Array<{ exerciseId: string; exerciseName: string; setNumber: number; weight: number; reps: number; restSeconds: number }> = [];

    for (const wExercise of workout.exercises) {
      const baseWeight = wExercise.exercise.muscleGroup === "Pernas" ? 80 : wExercise.exercise.muscleGroup === "Peito" ? 50 : 30;
      for (let s = 1; s <= wExercise.targetSets; s++) {
        const w = baseWeight + (s - 1) * 2.5;
        const reps = Math.max(6, wExercise.targetReps - (s - 1));
        totalVolume += w * reps;
        setsData.push({
          exerciseId: wExercise.exerciseId,
          exerciseName: wExercise.exercise.name,
          setNumber: s,
          weight: w,
          reps,
          restSeconds: wExercise.restSeconds,
        });
      }
    }

    const session = await db.workoutSession.create({
      data: {
        userId: user.id,
        workoutId: workout.id,
        workoutName: workout.name,
        startedAt,
        endedAt,
        durationSec: 3600,
        totalVolume,
      },
    });

    for (const sd of setsData) {
      await db.sessionSet.create({
        data: {
          sessionId: session.id,
          ...sd,
        },
      });
    }
  }

  console.log("✅ Seed concluído!");
  console.log(`   - ${exercisesData.length} exercícios`);
  console.log(`   - ${treinos.length} treinos`);
  console.log("   - 12 sessões de histórico");
  console.log("   - 1 usuário demo (demo@hevy.com / demo123)");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
