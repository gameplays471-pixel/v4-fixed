import { readFileSync } from "fs";
import path from "path";

export type PersoGemMode = "treinador" | "sql" | "duvidas";

const PROMPT_FILES: Record<PersoGemMode, string> = {
  treinador: "TreinadorGemGym.md",
  sql: "personalgemgym.md",
  duvidas: "duvidas.md",
};

export function loadPersoGemPrompt(mode: PersoGemMode): string {
  const fileName = PROMPT_FILES[mode] ?? PROMPT_FILES.duvidas;
  const candidates = [
    path.join(process.cwd(), "prompts", fileName),
    path.join(process.cwd(), "..", "prompts", fileName),
  ];

  for (const filePath of candidates) {
    try {
      return readFileSync(filePath, "utf-8");
    } catch {
      // try next
    }
  }

  const fallbacks: Record<PersoGemMode, string> = {
    treinador:
      "Você é o PersoGem do GEMgym. Entreviste o aluno antes de montar qualquer treino. Português do Brasil.",
    sql:
      "Você é o PersoGem do GEMgym. Gere JSON de treinos com slugs de exercícios ou SQL para Supabase. Português do Brasil.",
    duvidas:
      "Você é o PersoGem do GEMgym. Responda dúvidas de treino e técnica de forma clara e segura. Português do Brasil.",
  };
  return fallbacks[mode];
}
