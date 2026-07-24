import type { Slug } from "./types";

/**
 * Mapeia os nomes de grupos musculares (em português) usados no app
 * para os slugs de região corporal do react-native-body-highlighter.
 * Um mesmo slug pode aparecer tanto em bodyFront quanto em bodyBack
 * (ex: "deltoids", "forearm", "calves", "adductors", "triceps") — nesse
 * caso a região é destacada nos dois lados do manequim automaticamente.
 */
export const MUSCLE_PT_TO_SLUGS: Record<string, Slug[]> = {
  // Peito
  Peito: ["chest"],
  Peitoral: ["chest"],

  // Costas
  Costas: ["upper-back", "lower-back"],
  Romboides: ["upper-back"],
  Lombar: ["lower-back"],

  // Ombros / deltoides
  Ombros: ["deltoids"],
  "Deltoide Anterior": ["deltoids"],
  "Deltoide Lateral": ["deltoids"],
  "Deltoide Posterior": ["deltoids"],

  // Braços
  Bíceps: ["biceps"],
  Tríceps: ["triceps"],
  Antebraço: ["forearm"],
  Braquiorradial: ["forearm"],

  // Core
  Abdômen: ["abs"],
  Core: ["abs"],
  Obliquos: ["obliques"],
  Oblíquos: ["obliques"],
  Serrátil: ["obliques"],

  // Trapézio
  Trapézio: ["trapezius"],

  // Pernas
  Quadríceps: ["quadriceps"],
  "Flexores do Quadril": ["quadriceps"],
  Pernas: ["quadriceps", "hamstring", "calves", "adductors"],
  Posteriores: ["hamstring"],
  Isquiotibiais: ["hamstring"],
  Adutores: ["adductors"],
  Panturrilha: ["calves"],
  Panturrilhas: ["calves"],

  // Glúteos
  Glúteos: ["gluteal"],

  // Categorias amplas
  Cardio: ["chest", "abs", "quadriceps", "calves"],
  "Full Body": [
    "chest",
    "abs",
    "obliques",
    "upper-back",
    "lower-back",
    "deltoids",
    "biceps",
    "triceps",
    "forearm",
    "quadriceps",
    "hamstring",
    "calves",
    "gluteal",
    "adductors",
    "trapezius",
  ],
};

/** Slugs que representam grupos musculares treináveis (recebem cor de status). */
export const TRACKABLE_SLUGS: Slug[] = [
  "chest",
  "obliques",
  "abs",
  "biceps",
  "triceps",
  "forearm",
  "adductors",
  "quadriceps",
  "calves",
  "trapezius",
  "deltoids",
  "upper-back",
  "lower-back",
  "gluteal",
  "hamstring",
];
