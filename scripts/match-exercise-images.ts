/**
 * Faz o "match" automático dos nossos exercícios (em PT-BR) com o dataset
 * público e gratuito free-exercise-db (domínio público, imagens hospedadas
 * no GitHub), gerando um arquivo de revisão antes de gravar no banco.
 *
 * Fonte dos dados: https://github.com/yuhonas/free-exercise-db
 * (>800 exercícios, licença de domínio público, sem necessidade de API key)
 *
 * Uso:
 *   npx tsx scripts/match-exercise-images.ts
 *
 * Gera: scripts/exercise-image-matches.json
 * Depois de revisar/corrigir esse arquivo manualmente, rode:
 *   npx tsx scripts/apply-exercise-images.ts
 */
import { writeFileSync } from "fs";
import { exercisesData } from "../src/lib/exercises-data";

const DATASET_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

type SourceExercise = {
  id: string;
  name: string;
  equipment: string | null;
  primaryMuscles: string[];
  images: string[]; // caminhos relativos, ex: "Air_Bike/0.jpg"
};

// Dica em inglês para cada exercício nosso (tradução/nome equivalente mais
// comum no dataset). É um ponto de partida — o script ainda faz matching
// por similaridade contra os nomes reais do dataset, então nomes levemente
// diferentes ainda costumam bater. Sempre revise o resultado antes de aplicar.
const ENGLISH_HINTS: Record<string, string> = {
  "supino-reto-barra": "Barbell Bench Press",
  "supino-reto-halteres": "Dumbbell Bench Press",
  "supino-inclinado-barra": "Incline Barbell Bench Press",
  "supino-inclinado-halteres": "Incline Dumbbell Press",
  "crucifixo-halteres": "Dumbbell Flyes",
  "crossover-polia": "Cable Crossover",
  "flexao-braco": "Pushups",
  "paralelas-mergulho": "Dips - Triceps Version",
  "puxada-frontal": "Front Lat Pulldown",
  "barra-fixa": "Pullups",
  "remada-curvada-barra": "Bent Over Barbell Row",
  "remada-baixa-polia": "Seated Cable Row",
  "remada-halter-serrote": "One-Arm Dumbbell Row",
  "levantamento-terra": "Barbell Deadlift",
  "pullover-halter": "Dumbbell Pullover",
  "face-pull": "Face Pull",
  "agachamento-livre-barra": "Barbell Squat",
  "leg-press-45": "Leg Press",
  "cadeira-extensora": "Leg Extensions",
  "mesa-flexora": "Lying Leg Curls",
  "cadeira-flexora-sentada": "Seated Leg Curl",
  "stiff-barra": "Stiff-Legged Deadlift",
  "rdl-romanian-deadlift": "Romanian Deadlift",
  "afundo-lunge": "Dumbbell Lunges",
  "panturrilha-pe": "Standing Calf Raises",
  "panturrilha-sentada": "Seated Calf Raise",
  "agachamento-bulgaro": "Bulgarian Split Squat",
  "hack-machine": "Hack Squat",
  "agachamento-smith": "Smith Machine Squat",
  "cadeira-abdutora": "Hip Abductor",
  "cadeira-adutora": "Hip Adductor",
  "elevacao-pelvica-hip-thrust": "Barbell Hip Thrust",
  "gluteo-cabo-coice": "Cable Kickback",
  "desenvolvimento-militar-barra": "Military Press",
  "desenvolvimento-halteres": "Dumbbell Shoulder Press",
  "elevacao-lateral-halteres": "Side Lateral Raise",
  "elevacao-frontal-halteres": "Front Dumbbell Raise",
  "crucifixo-inverso-peck-reverse": "Reverse Machine Flyes",
  "encolhimento-halteres": "Dumbbell Shrug",
  "triceps-pulley": "Triceps Pushdown",
  "triceps-corda": "Cable Rope Pushdown",
  "triceps-frances": "Lying Triceps Extension",
  "triceps-banco": "Bench Dip",
  "mergulho-bancos": "Bench Dip",
  "rosca-direta-barra": "Barbell Curl",
  "rosca-direta-halteres": "Dumbbell Curl",
  "rosca-alternada": "Alternate Dumbbell Curl",
  "rosca-martelo": "Hammer Curl",
  "rosca-scott": "Preacher Curl",
  "rosca-concentrada": "Concentration Curl",
  "prancha-plank": "Plank",
  "abdominal-supra": "Crunches",
  "infra-banca": "Flat Bench Lying Leg Raise",
  "prancha-lateral": "Side Plank",
  "abdominal-bicicleta": "Bicycle Crunch",
  "hanging-leg-raise": "Hanging Leg Raise",
  "encolhimento-barra": "Barbell Shrug",
  "remada-alta-barra": "Upright Row",
  "punho-barra": "Wrist Curl",
  "punho-invertido": "Reverse Wrist Curl",
  "hip-thrust-barra": "Barbell Hip Thrust",
  "agachamento-goblet": "Goblet Squat",
  "stiff-halteres": "Dumbbell Stiff Legged Deadlift",
  "avanco-step-up": "Step-up",
  "sumo-squat-halter": "Dumbbell Squat",
  "good-morning": "Good Morning",
  "cadeira-adutora-cabo": "Cable Hip Adduction",
  "kettlebell-swing": "Kettlebell Swing",
  "supino-declinado-barra": "Decline Barbell Bench Press",
  "crucifixo-inclinado-halteres": "Incline Dumbbell Flyes",
  "peck-deck": "Pec Deck",
  "elevacao-lateral-polia": "Cable Lateral Raise",
  "desenvolvimento-arnold": "Arnold Press",
  "remada-unilateral-halter": "One-Arm Dumbbell Row",
  "pulldown-pulley": "Straight Arm Pulldown",
  "levantamento-terra-sumo": "Sumo Deadlift",
  "agachamento-frontal": "Front Squat",
  "cadeira-extensora-unilateral": "Leg Extensions",
  "leg-press-90": "Leg Press",
  "panturrilha-leg-press": "Leg Press Calf Raise",
  "elevacao-pelvica-unilateral": "Single Leg Glute Bridge",
  "coice-gluteo-solo": "Donkey Kicks",
  "triceps-testa-halteres": "Lying Dumbbell Triceps Extension",
  "triceps-coice": "Triceps Kickback",
  "rosca-direta-polia": "Cable Curl",
  "rosca-punho-polia": "Cable Wrist Curl",
  "abdominal-polia": "Cable Crunch",
  "abdominal-infra-barra": "Hanging Leg Raise",
  "russian-twist": "Russian Twist",
  "remada-t-bar": "T-Bar Row",
  "terra-romeno-barra": "Romanian Deadlift",
  "cadeira-flexora-deitada": "Lying Leg Curl",
  "good-morning-halteres": "Dumbbell Good Morning",
  "jump-squat": "Jump Squat",
  "burpee": "Burpee",
  "mountain-climber": "Mountain Climber",
  "flexao-diamante": "Diamond Push Up",
  "flexao-arqueira": "Archer Push Up",
  "supino-declinado-halteres": "Decline Dumbbell Bench Press",
  "crossover-baixa": "Cable Crossover",
  "crucifixo-declinado-halteres": "Decline Dumbbell Flyes",
  "flexao-inclinada": "Incline Push Up",
  "flexao-declinada": "Decline Push Up",
  "paralelas": "Dips - Triceps Version",
  "press-peito-maquina": "Machine Bench Press",
  "peck-deck-maquina": "Pec Deck",
  "supino-halteres-plano": "Flat Bench Dumbbell Press",
  "barra-fixa-supinada": "Chin-Up",
  "puxada-neutra": "Close Grip Front Lat Pulldown",
  "puxada-triangulo": "Triangle Bar Lat Pulldown",
  "remada-curvada-supinada": "Reverse Grip Bent-Over Rows",
  "remada-tbar": "T-Bar Row",
  "remada-serrote": "One-Arm Dumbbell Row",
  "remada-baixa-neutra": "Seated Cable Row",
  "pullover-polia-alta": "Straight Arm Pulldown",
  "pull-down-polia": "Lat Pulldown",
  "terra-romeno": "Romanian Deadlift",
  "terra-sumo": "Sumo Deadlift",
  "good-morning-barra": "Good Morning",
  "mesa-flexora-sentada": "Seated Leg Curl",
  "cadeira-flexora-unilateral": "Leg Curl",
  "agachamento-hack": "Hack Squat",
  "avanco-lunge": "Dumbbell Lunges",
  "avanco-lateral": "Lateral Lunge",
  "avanco-reverse": "Reverse Lunge",
  "panturrilha-pe-unilateral": "Standing Calf Raise",
  "hip-thrust-halteres": "Dumbbell Hip Thrust",
  "gluteo-coice-polia": "Cable Kickback",
  "abducao-quadril-polia": "Cable Hip Abduction",
  "elevacao-pelvica": "Glute Bridge",
  "coice-maquina": "Glute Kickback Machine",
  "agachamento-sumo-halter": "Dumbbell Squat",
  "step-up": "Step-up",
  "desenvolvimento-maquina": "Machine Shoulder Press",
  "remada-alta-halteres": "Dumbbell Upright Row",
  "elevacao-frontal-polia": "Cable Front Raise",
  "crucifixo-inverso-polia": "Cable Reverse Flyes",
  "encolhimento-maquina": "Machine Shrug",
  "triceps-frances-halter": "Standing Dumbbell Triceps Extension",
  "triceps-frances-sentado": "Seated Triceps Press",
  "triceps-polia-supinada": "Reverse Grip Triceps Pushdown",
  "mergulho-banco": "Bench Dip",
  "triceps-maquina": "Machine Triceps Extension",
  "flexao-maos-juntas": "Diamond Push Up",
  "rosca-polia": "Cable Curl",
  "rosca-martelo-polia": "Cable Hammer Curl",
  "rosca-inversa": "Reverse Barbell Curl",
  "flexao-pulso-halter": "Wrist Curl",
  "extensao-pulso-halter": "Reverse Wrist Curl",
  "encolhimento-pulso": "Reverse Wrist Curl",
  "abdominal-infra": "Leg Raise",
  "prancha": "Plank",
  "elevacao-pernas-barra": "Hanging Leg Raise",
  "abdominal-bola-suica": "Swiss Ball Crunch",
  "corrida-esteira": "Running, Treadmill",
  "bicicleta-ergometrica": "Cycling, Stationary",
  "eliptico": "Elliptical Trainer",
  "remo-ergometro": "Rowing, Stationary",
  "pular-corda": "Jump Rope",
  "burpee-salto": "Burpee",
  "battle-rope": "Battle Ropes",
  "box-jump": "Box Jump",
  "wall-ball": "Wall Ball",
  "prancha-toque-ombro": "Plank Shoulder Tap",
  "cadeira-flexora-pe": "Standing Leg Curl",
  "agachamento-pistol": "Pistol Squat",
  "sissy-squat": "Sissy Squat",
  "agachamento-pulsao": "Jump Squat",
  "thruster": "Thruster",
  "turkish-get-up": "Turkish Get-up",
  "clean-and-press": "Clean and Press",
  "snatch": "Snatch",
  "supino-fechado-barra": "Close-Grip Barbell Bench Press",
  "supino-pegada-neutra": "Neutral Grip Dumbbell Bench Press",
  "abdominal-obliquo-halter": "Dumbbell Side Bend",
  "woodchopper-polia": "Cable Woodchopper",
};

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenScore(a: string, b: string): number {
  const ta = new Set(normalize(a).split(" ").filter((w) => w.length > 2));
  const tb = new Set(normalize(b).split(" ").filter((w) => w.length > 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const w of ta) if (tb.has(w)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

async function main() {
  console.log("⬇️  Baixando dataset free-exercise-db...");
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`Falha ao baixar dataset: ${res.status}`);
  const dataset: SourceExercise[] = await res.json();
  console.log(`✅ ${dataset.length} exercícios carregados da fonte.`);

  const results: Array<{
    slug: string;
    nome: string;
    hintUsado: string;
    match: string | null;
    score: number;
    images: string[];
    aprovado: boolean;
  }> = [];

  for (const ex of exercisesData) {
    const hint = ENGLISH_HINTS[ex.slug] || ex.name;
    let best: SourceExercise | null = null;
    let bestScore = 0;

    for (const src of dataset) {
      if (!src.images || src.images.length === 0) continue;
      const score = tokenScore(hint, src.name);
      if (score > bestScore) {
        bestScore = score;
        best = src;
      }
    }

    // Threshold conservador: só aceita automaticamente se a maioria das
    // palavras baterem. Abaixo disso, fica marcado para revisão manual.
    const aprovado = bestScore >= 0.5;

    results.push({
      slug: ex.slug,
      nome: ex.name,
      hintUsado: hint,
      match: best ? best.name : null,
      score: Math.round(bestScore * 100) / 100,
      images: best ? best.images.map((p) => IMAGE_BASE + p) : [],
      aprovado,
    });
  }

  const aprovados = results.filter((r) => r.aprovado).length;
  console.log(
    `\n📊 ${aprovados}/${results.length} exercícios com match automático confiável (score ≥ 0.5).`
  );
  console.log(
    `   Os demais (${results.length - aprovados}) ficaram com "aprovado: false" — revise o campo "match" e ajuste manualmente antes de aplicar.`
  );

  writeFileSync(
    "scripts/exercise-image-matches.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\n📝 Revisão salva em scripts/exercise-image-matches.json");
  console.log(
    "   Edite o arquivo se necessário (troque 'images' ou marque aprovado: false para pular) e rode:"
  );
  console.log("   npx tsx scripts/apply-exercise-images.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
