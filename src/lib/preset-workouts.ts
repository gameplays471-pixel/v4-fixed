/**
 * Treinos pré-setados do painel admin (atribuição a alunos).
 * Os exercícios são referenciados por `slug` e resolvidos para IDs na
 * hora do seed / criação no banco (ver POST /api/admin/workout-templates/seed).
 */

export type PresetExercise = {
  slug: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  notes?: string;
  /** Cardio */
  targetDurationSec?: number;
  targetDistanceKm?: number;
  targetIntensity?: string;
};

export type PresetWorkout = {
  key: string;
  name: string;
  description: string;
  defaultRest: number;
  color: string;
  templateGoal: "emagrecimento" | "hipertrofia";
  templateSex: "M" | "F";
  templateLevel: "iniciante" | "intermediario";
  exercises: PresetExercise[];
};

export const PRESET_WORKOUTS: PresetWorkout[] = [
  // ── Emagrecimento · Homem · Iniciante ─────────────────────────────────
  {
    key: "emagrecimento-m-iniciante",
    name: "Emagrecimento — Homem (Iniciante)",
    description:
      "Full body 3x/semana. Foco em gasto calórico, técnica e consistência. Combine com déficit calórico leve e caminhada diária.",
    defaultRest: 60,
    color: "#22c55e",
    templateGoal: "emagrecimento",
    templateSex: "M",
    templateLevel: "iniciante",
    exercises: [
      { slug: "agachamento-goblet", targetSets: 3, targetReps: 12, restSeconds: 60, notes: "Halter no peito, desça controlado" },
      { slug: "flexao-braco", targetSets: 3, targetReps: 10, restSeconds: 60, notes: "Joelhos no chão se necessário" },
      { slug: "remada-halter-serrote", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "desenvolvimento-halteres", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "hip-thrust-halteres", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "prancha", targetSets: 3, targetReps: 1, restSeconds: 45, notes: "Segure 30–40s por série", targetDurationSec: 35 },
      {
        slug: "caminhada-inclinada-esteira",
        targetSets: 1,
        targetReps: 1,
        restSeconds: 0,
        targetDurationSec: 1200,
        targetIntensity: "Moderada",
        notes: "20 min, inclinação 5–8%",
      },
    ],
  },

  // ── Emagrecimento · Homem · Intermediário ─────────────────────────────
  {
    key: "emagrecimento-m-intermediario",
    name: "Emagrecimento — Homem (Intermediário)",
    description:
      "Full body com mais volume e finisher metabólico. 3–4x/semana. Mantenha RIR 1–2 e caminhada diária.",
    defaultRest: 60,
    color: "#16a34a",
    templateGoal: "emagrecimento",
    templateSex: "M",
    templateLevel: "intermediario",
    exercises: [
      { slug: "agachamento-livre-barra", targetSets: 4, targetReps: 10, restSeconds: 75 },
      { slug: "supino-reto-halteres", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "remada-curvada-barra", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "afundo-lunge", targetSets: 3, targetReps: 12, restSeconds: 60, notes: "Por perna" },
      { slug: "desenvolvimento-militar-barra", targetSets: 3, targetReps: 8, restSeconds: 60 },
      { slug: "elevacao-pelvica-hip-thrust", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "abdominal-bicicleta", targetSets: 3, targetReps: 20, restSeconds: 45 },
      {
        slug: "corrida-esteira",
        targetSets: 1,
        targetReps: 1,
        restSeconds: 0,
        targetDurationSec: 900,
        targetIntensity: "Intensa",
        notes: "15 min intervalado (1 min forte / 1 min leve)",
      },
    ],
  },

  // ── Emagrecimento · Mulher · Iniciante ────────────────────────────────
  {
    key: "emagrecimento-f-iniciante",
    name: "Emagrecimento — Mulher (Iniciante)",
    description:
      "Full body com ênfase em pernas/glúteos e core. 3x/semana + caminhada. Técnica primeiro, carga depois.",
    defaultRest: 60,
    color: "#4ade80",
    templateGoal: "emagrecimento",
    templateSex: "F",
    templateLevel: "iniciante",
    exercises: [
      { slug: "agachamento-goblet", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "hip-thrust-halteres", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "remada-halter-serrote", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "flexao-inclinada", targetSets: 3, targetReps: 10, restSeconds: 60, notes: "Mãos em banco se precisar" },
      { slug: "elevacao-lateral-halteres", targetSets: 3, targetReps: 12, restSeconds: 45 },
      { slug: "cadeira-abdutora", targetSets: 3, targetReps: 15, restSeconds: 45 },
      { slug: "prancha", targetSets: 3, targetReps: 1, restSeconds: 45, notes: "25–35s", targetDurationSec: 30 },
      {
        slug: "caminhada-inclinada-esteira",
        targetSets: 1,
        targetReps: 1,
        restSeconds: 0,
        targetDurationSec: 1200,
        targetIntensity: "Moderada",
        notes: "20 min",
      },
    ],
  },

  // ── Emagrecimento · Mulher · Intermediário ────────────────────────────
  {
    key: "emagrecimento-f-intermediario",
    name: "Emagrecimento — Mulher (Intermediário)",
    description:
      "Mais volume em glúteos/pernas + upper leve e finisher. 3–4x/semana com déficit controlado.",
    defaultRest: 60,
    color: "#15803d",
    templateGoal: "emagrecimento",
    templateSex: "F",
    templateLevel: "intermediario",
    exercises: [
      { slug: "agachamento-bulgaro", targetSets: 3, targetReps: 10, restSeconds: 75, notes: "Por perna" },
      { slug: "hip-thrust-barra", targetSets: 4, targetReps: 10, restSeconds: 75 },
      { slug: "leg-press-45", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "puxada-frontal", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "supino-reto-halteres", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "cadeira-abdutora", targetSets: 3, targetReps: 15, restSeconds: 45 },
      { slug: "abdominal-supra", targetSets: 3, targetReps: 15, restSeconds: 45 },
      {
        slug: "eliptico",
        targetSets: 1,
        targetReps: 1,
        restSeconds: 0,
        targetDurationSec: 900,
        targetIntensity: "Moderada",
        notes: "15 min pós-treino",
      },
    ],
  },

  // ── Hipertrofia · Homem · Iniciante ───────────────────────────────────
  {
    key: "hipertrofia-m-iniciante",
    name: "Hipertrofia — Homem (Iniciante)",
    description:
      "Full body para ganho de massa. 3x/semana, progressão de carga semanal, superávit calórico leve e proteína adequada.",
    defaultRest: 90,
    color: "#3b82f6",
    templateGoal: "hipertrofia",
    templateSex: "M",
    templateLevel: "iniciante",
    exercises: [
      { slug: "agachamento-livre-barra", targetSets: 3, targetReps: 8, restSeconds: 120, notes: "Prioridade técnica" },
      { slug: "supino-reto-barra", targetSets: 3, targetReps: 8, restSeconds: 90 },
      { slug: "remada-curvada-barra", targetSets: 3, targetReps: 8, restSeconds: 90 },
      { slug: "desenvolvimento-halteres", targetSets: 3, targetReps: 10, restSeconds: 75 },
      { slug: "rosca-direta-barra", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "triceps-corda", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "prancha", targetSets: 3, targetReps: 1, restSeconds: 45, notes: "30–40s", targetDurationSec: 35 },
    ],
  },

  // ── Hipertrofia · Homem · Intermediário ───────────────────────────────
  {
    key: "hipertrofia-m-intermediario",
    name: "Hipertrofia — Homem (Intermediário)",
    description:
      "Upper/full com volume moderado-alto. Use 3–4x/semana (ou alterne A/B). RIR 1–2, progressão de carga.",
    defaultRest: 90,
    color: "#2563eb",
    templateGoal: "hipertrofia",
    templateSex: "M",
    templateLevel: "intermediario",
    exercises: [
      { slug: "agachamento-livre-barra", targetSets: 4, targetReps: 6, restSeconds: 150 },
      { slug: "supino-inclinado-halteres", targetSets: 4, targetReps: 8, restSeconds: 90 },
      { slug: "puxada-frontal", targetSets: 3, targetReps: 10, restSeconds: 75 },
      { slug: "remada-t-bar", targetSets: 3, targetReps: 8, restSeconds: 90 },
      { slug: "desenvolvimento-militar-barra", targetSets: 3, targetReps: 8, restSeconds: 90 },
      { slug: "stiff-barra", targetSets: 3, targetReps: 8, restSeconds: 90 },
      { slug: "rosca-alternada", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "triceps-testa-halteres", targetSets: 3, targetReps: 10, restSeconds: 60 },
      { slug: "elevacao-lateral-halteres", targetSets: 3, targetReps: 12, restSeconds: 45 },
    ],
  },

  // ── Hipertrofia · Mulher · Iniciante ──────────────────────────────────
  {
    key: "hipertrofia-f-iniciante",
    name: "Hipertrofia — Mulher (Iniciante)",
    description:
      "Full body com prioridade em glúteos e pernas. 3x/semana, progressão gradual e alimentação em superávit leve.",
    defaultRest: 90,
    color: "#60a5fa",
    templateGoal: "hipertrofia",
    templateSex: "F",
    templateLevel: "iniciante",
    exercises: [
      { slug: "agachamento-goblet", targetSets: 3, targetReps: 10, restSeconds: 90 },
      { slug: "hip-thrust-halteres", targetSets: 3, targetReps: 12, restSeconds: 75 },
      { slug: "leg-press-45", targetSets: 3, targetReps: 12, restSeconds: 75 },
      { slug: "puxada-frontal", targetSets: 3, targetReps: 10, restSeconds: 75 },
      { slug: "supino-reto-halteres", targetSets: 3, targetReps: 10, restSeconds: 75 },
      { slug: "cadeira-extensora", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "mesa-flexora", targetSets: 3, targetReps: 12, restSeconds: 60 },
      { slug: "elevacao-lateral-halteres", targetSets: 2, targetReps: 12, restSeconds: 45 },
    ],
  },

  // ── Hipertrofia · Mulher · Intermediário ──────────────────────────────
  {
    key: "hipertrofia-f-intermediario",
    name: "Hipertrofia — Mulher (Intermediário)",
    description:
      "Volume maior em glúteos/pernas + upper complementar. 3–4x/semana. Foque em progressão de carga nos compostos.",
    defaultRest: 90,
    color: "#1d4ed8",
    templateGoal: "hipertrofia",
    templateSex: "F",
    templateLevel: "intermediario",
    exercises: [
      { slug: "agachamento-livre-barra", targetSets: 4, targetReps: 8, restSeconds: 120 },
      { slug: "hip-thrust-barra", targetSets: 4, targetReps: 8, restSeconds: 90 },
      { slug: "agachamento-bulgaro", targetSets: 3, targetReps: 10, restSeconds: 75, notes: "Por perna" },
      { slug: "stiff-barra", targetSets: 3, targetReps: 10, restSeconds: 90 },
      { slug: "puxada-frontal", targetSets: 3, targetReps: 10, restSeconds: 75 },
      { slug: "supino-inclinado-halteres", targetSets: 3, targetReps: 10, restSeconds: 75 },
      { slug: "cadeira-abdutora", targetSets: 3, targetReps: 15, restSeconds: 45 },
      { slug: "elevacao-lateral-halteres", targetSets: 3, targetReps: 12, restSeconds: 45 },
      { slug: "abdominal-supra", targetSets: 3, targetReps: 15, restSeconds: 45 },
    ],
  },
];
