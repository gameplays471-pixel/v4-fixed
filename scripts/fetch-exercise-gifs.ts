/**
 * Script para buscar GIFs animados no Wikimedia Commons.
 * Salva o resultado no mesmo cache de imagens.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { exercisesData } from "../src/lib/exercises-data";

type ImageMap = Record<string, { imageUrl: string | null; gifUrl: string | null }>;
const cachePath = "/home/z/my-project/scripts/exercise-images.json";
const logPath = "/home/z/my-project/scripts/fetch-gif-progress.log";

// Termos de busca em inglês para GIFs no Commons
const GIF_SEARCH: Record<string, string> = {
  "Supino Reto com Barra": "Bench press animation",
  "Supino Reto com Halteres": "Bench press dumbbell",
  "Supino Inclinado com Barra": "Incline bench press",
  "Crucifixo com Halteres": "Dumbbell fly animation",
  "Flexão de Braço": "Push-up animation",
  "Puxada Frontal": "Lat pulldown",
  "Barra Fixa": "Pull-up animation",
  "Remada Curvada com Barra": "Bent over row",
  "Remada Baixa na Polia": "Cable row",
  "Levantamento Terra": "Deadlift animation",
  "Agachamento Livre com Barra": "Squat animation",
  "Leg Press 45°": "Leg press",
  "Cadeira Extensora": "Leg extension",
  "Mesa Flexora": "Leg curl",
  "Stiff com Barra": "Straight leg deadlift",
  "Afundo (Lunge)": "Lunge animation",
  "Panturrilha em Pé": "Calf raise",
  "Agachamento Búlgaro": "Split squat",
  "Elevação Pélvica (Hip Thrust)": "Hip thrust",
  "Desenvolvimento com Halteres": "Shoulder press dumbbell",
  "Elevação Lateral com Halteres": "Lateral raise",
  "Elevação Frontal com Halteres": "Front raise",
  "Tríceps Pulley": "Triceps pushdown",
  "Tríceps Francês": "Skull crusher",
  "Tríceps no Banco": "Bench dip",
  "Rosca Direta com Barra": "Biceps curl",
  "Rosca Direta com Halteres": "Dumbbell curl",
  "Rosca Martelo": "Hammer curl",
  "Rosca Concentrada": "Concentration curl",
  "Prancha (Plank)": "Plank exercise",
  "Abdominal Supra": "Crunch exercise",
  "Abdominal Bicicleta": "Bicycle crunch",
  "Hanging Leg Raise": "Hanging leg raise",
  "Remada Alta com Barra": "Upright row",
  "Hip Thrust com Barra": "Hip thrust",
  "Agachamento Goblet": "Goblet squat",
  "Avanço (Step-up)": "Step up exercise",
  "Kettlebell Swing": "Kettlebell swing",
  "Agachamento Frontal": "Front squat",
  "Burpee": "Burpee exercise",
  "Mountain Climber": "Mountain climber exercise",
  "Flexão Diamante": "Diamond push up",
  "Jump Squat (Agachamento com Salto)": "Jump squat",
  "Russian Twist": "Russian twist",
  "Levantamento Terra Romeno com Barra": "Romanian deadlift",
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

async function getCommonsGif(searchTerm: string): Promise<string | null> {
  try {
    // 1. Search for GIF files
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      searchTerm
    )}&srnamespace=6&format=json&srlimit=10`;
    const searchData = await (await fetchWithTimeout(searchUrl)).json();
    const results = searchData?.query?.search || [];

    for (const r of results) {
      const title = r.title as string;
      // Apenas arquivos .gif
      if (title.toLowerCase().endsWith(".gif")) {
        // 2. Get URL via imageinfo
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          title
        )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json`;
        const infoData = await (await fetchWithTimeout(infoUrl)).json();
        const pages = infoData?.query?.pages || {};
        const firstPage = Object.values(pages)[0] as any;
        const gifUrl =
          firstPage?.imageinfo?.[0]?.thumburl || firstPage?.imageinfo?.[0]?.url;
        if (gifUrl) return gifUrl;
      }
    }
  } catch (e) {
    log(`  ERRO fetch: ${(e as Error).message}`);
  }
  return null;
}

async function main() {
  writeFileSync(logPath, "");

  let cache: ImageMap = {};
  if (existsSync(cachePath)) {
    cache = JSON.parse(readFileSync(cachePath, "utf-8"));
    log(`Cache existente: ${Object.keys(cache).length} exercícios`);
  }

  const total = Object.keys(GIF_SEARCH).length;
  let processed = 0;
  let successGif = 0;

  for (const ex of exercisesData) {
    if (!GIF_SEARCH[ex.name]) {
      processed++;
      continue;
    }

    if (cache[ex.slug]?.gifUrl) {
      processed++;
      successGif++;
      continue;
    }

    log(`[${processed + 1}/${total}] ${ex.name} -> '${GIF_SEARCH[ex.name]}'`);

    let gifUrl: string | null = null;
    try {
      gifUrl = await getCommonsGif(GIF_SEARCH[ex.name]);
    } catch (e) {
      log(`  Erro: ${(e as Error).message}`);
    }

    cache[ex.slug] = {
      imageUrl: cache[ex.slug]?.imageUrl || null,
      gifUrl,
    };
    if (gifUrl) successGif++;
    log(`  ${gifUrl ? "✓ gif" : "✗ gif"}`);

    writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    // Rate limit Wikimedia (mais gentil)
    await new Promise((r) => setTimeout(r, 1500));
    processed++;
  }

  log(`\n✅ Concluído: ${successGif}/${total} com GIF`);
  log(`Cache salvo em: ${cachePath}`);
}

main().catch((e) => {
  log(`Erro fatal: ${e?.message || e}`);
  log(`Stack: ${e?.stack || ""}`);
  process.exit(1);
});
