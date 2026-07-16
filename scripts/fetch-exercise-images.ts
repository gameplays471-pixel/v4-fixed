/**
 * Script simplificado para buscar imagens (Openverse) - versão robusta.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { exercisesData } from "../src/lib/exercises-data";

type ImageMap = Record<string, { imageUrl: string | null; gifUrl: string | null }>;
const cachePath = "/home/z/my-project/scripts/exercise-images.json";
const logPath = "/home/z/my-project/scripts/fetch-progress.log";

const PT_TO_EN: Record<string, string> = {
  "Supino Reto com Barra": "barbell bench press",
  "Supino Reto com Halteres": "dumbbell bench press",
  "Supino Inclinado com Barra": "incline barbell press",
  "Supino Inclinado com Halteres": "incline dumbbell press",
  "Crucifixo com Halteres": "dumbbell fly",
  "Crossover na Polia": "cable crossover",
  "Flexão de Braço": "push up",
  "Paralelas (Mergulho)": "dips exercise",
  "Puxada Frontal": "lat pulldown",
  "Barra Fixa": "pull up",
  "Remada Curvada com Barra": "barbell row",
  "Remada Baixa na Polia": "cable row",
  "Remada com Halter (Serrote)": "dumbbell row",
  "Levantamento Terra": "deadlift",
  "Pullover com Halter": "dumbbell pullover",
  "Face Pull": "face pull",
  "Agachamento Livre com Barra": "barbell squat",
  "Leg Press 45°": "leg press",
  "Cadeira Extensora": "leg extension",
  "Mesa Flexora": "leg curl",
  "Cadeira Flexora Sentada": "seated leg curl",
  "Stiff com Barra": "stiff leg deadlift",
  "RDL (Romanian Deadlift)": "romanian deadlift",
  "Afundo (Lunge)": "lunge",
  "Panturrilha em Pé": "calf raise standing",
  "Panturrilha Sentada": "seated calf raise",
  "Agachamento Búlgaro": "bulgarian split squat",
  "Hack Machine": "hack squat",
  "Agachamento Livre no Smith": "smith machine squat",
  "Cadeira Abdutora": "hip abductor",
  "Cadeira Adutora": "hip adductor",
  "Elevação Pélvica (Hip Thrust)": "hip thrust",
  "Glúteo no Cabo (Coice)": "cable kickback",
  "Desenvolvimento Militar com Barra": "overhead press",
  "Desenvolvimento com Halteres": "shoulder press",
  "Elevação Lateral com Halteres": "lateral raise",
  "Elevação Frontal com Halteres": "front raise",
  "Crucifixo Inverso (Peck Reverse)": "reverse fly",
  "Encolhimento com Halteres": "dumbbell shrug",
  "Tríceps Pulley": "triceps pushdown",
  "Tríceps Corda": "triceps rope",
  "Tríceps Francês": "skull crusher",
  "Tríceps no Banco": "bench dip",
  "Mergulho entre Bancos": "tricep dip",
  "Rosca Direta com Barra": "barbell curl",
  "Rosca Direta com Halteres": "dumbbell curl",
  "Rosca Alternada": "bicep curl",
  "Rosca Martelo": "hammer curl",
  "Rosca Scott": "preacher curl",
  "Rosca Concentrada": "concentration curl",
  "Prancha (Plank)": "plank exercise",
  "Abdominal Supra": "abdominal crunch",
  "Infra na Banca": "reverse crunch",
  "Prancha Lateral": "side plank",
  "Abdominal Bicicleta": "bicycle crunch",
  "Hanging Leg Raise": "hanging leg raise",
  "Encolhimento com Barra": "barbell shrug",
  "Remada Alta com Barra": "upright row",
  "Punho com Barra": "wrist curl",
  "Punho Invertido": "reverse curl",
  "Hip Thrust com Barra": "barbell hip thrust",
  "Agachamento Goblet": "goblet squat",
  "Stiff com Halteres": "dumbbell deadlift",
  "Avanço (Step-up)": "step up exercise",
  "Sumo Squat com Halter": "sumo squat",
  "Good Morning": "good morning lift",
  "Cadeira Adutora no Cabo": "cable adductor",
  "Wall Ball (Remada Face Pull com Kettlebell)": "kettlebell row",
  "Kettlebell Swing": "kettlebell swing",
  "Supino Declinado com Barra": "decline bench press",
  "Crucifixo Inclinado com Halteres": "incline fly",
  "Peck Deck (Máquina)": "pec deck",
  "Elevação Lateral na Polia": "cable lateral raise",
  "Desenvolvimento Arnold": "arnold press",
  "Remada Unilateral com Halter": "one arm row",
  "Pulldown com Pulley": "close grip pulldown",
  "Levantamento Terra Sumô": "sumo deadlift",
  "Agachamento Frontal": "front squat",
  "Cadeira Extensora Unilateral": "single leg extension",
  "Leg Press 90° (Vertical)": "vertical leg press",
  "Panturrilha no Leg Press": "leg press calf",
  "Elevação Pélvica Unilateral": "single leg thrust",
  "Coice de Glúteo no Solo": "donkey kick",
  "Tríceps Testa com Halteres": "dumbbell skull crusher",
  "Tríceps Coice": "triceps kickback",
  "Rosca 21": "bicep curl",
  "Rosca Direta na Polia": "cable curl",
  "Rosca Punho na Polia": "wrist curl cable",
  "Abdominal na Polia (Crunch)": "cable crunch",
  "Abdominal Infra na Barra": "hanging abs",
  "Hollow Body (Corpo Oco)": "hollow hold",
  "Russian Twist": "russian twist",
  "Remada Cavalinho (T-Bar)": "t bar row",
  "Levantamento Terra Romeno com Barra": "romanian deadlift",
  "Cadeira Flexora Deitada": "lying leg curl",
  "Good Morning com Halteres": "dumbbell good morning",
  "Agachamento Pulsatório": "pulse squat",
  "Jump Squat (Agachamento com Salto)": "jump squat",
  "Burpee": "burpee",
  "Mountain Climber": "mountain climber",
  "Flexão Diamante": "diamond push up",
  "Flexão Arqueira": "archer push up",
};

function log(msg: string) {
  console.log(msg);
  writeFileSync(logPath, msg + "\n", { flag: "a" });
}

async function fetchWithTimeout(url: string, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "HevyWeb/1.0 (https://example.com; contact@example.com)",
        Accept: "application/json",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getOpenverseImage(queryEn: string): Promise<string | null> {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
      queryEn
    )}&page_size=3&mature=false`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results || [];
    for (const r of results) {
      if (r.url && typeof r.url === "string" && r.url.startsWith("http")) {
        return r.url;
      }
    }
  } catch (e) {
    log(`  ERRO fetch: ${(e as Error).message}`);
  }
  return null;
}

async function main() {
  // Limpa log anterior
  writeFileSync(logPath, "");

  let cache: ImageMap = {};
  if (existsSync(cachePath)) {
    cache = JSON.parse(readFileSync(cachePath, "utf-8"));
    log(`Cache existente: ${Object.keys(cache).length} exercícios`);
  }

  const total = exercisesData.length;
  let processed = 0;
  let successImg = 0;

  for (const ex of exercisesData) {
    if (cache[ex.slug]?.imageUrl) {
      processed++;
      successImg++;
      continue;
    }

    const queryEn = PT_TO_EN[ex.name] || ex.name;
    log(`[${processed + 1}/${total}] ${ex.name} -> buscando '${queryEn}'`);

    let imageUrl: string | null = null;
    try {
      imageUrl = await getOpenverseImage(queryEn);
    } catch (e) {
      log(`  Erro inesperado: ${(e as Error).message}`);
    }

    cache[ex.slug] = {
      imageUrl,
      gifUrl: cache[ex.slug]?.gifUrl || null,
    };
    if (imageUrl) successImg++;
    log(`  ${imageUrl ? "✓ img" : "✗ img"}`);

    writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    await new Promise((r) => setTimeout(r, 1100));
    processed++;
  }

  log(`\n✅ Concluído: ${successImg}/${total} com imagem`);
  log(`Cache salvo em: ${cachePath}`);
}

main().catch((e) => {
  log(`Erro fatal: ${e?.message || e}`);
  log(`Stack: ${e?.stack || ""}`);
  process.exit(1);
});
