import { PRESET_WORKOUTS } from "./preset-workouts";

export type PresetPlanDay = {
  order: number;
  label: string;
  suggestedWeekday: number;
  workoutKey: string;
};

export type PresetPlan = {
  key: string;
  name: string;
  description: string;
  daysPerWeek: number;
  templateGoal: "emagrecimento" | "hipertrofia";
  templateSex: "M" | "F";
  templateLevel: "iniciante" | "intermediario";
  days: PresetPlanDay[];
};

function findWorkoutKey(
  goal: PresetPlan["templateGoal"],
  sex: PresetPlan["templateSex"],
  level: PresetPlan["templateLevel"]
): string {
  const found = PRESET_WORKOUTS.find(
    (w) => w.templateGoal === goal && w.templateSex === sex && w.templateLevel === level
  );
  return found?.key ?? `${goal}-${sex}-${level}`;
}

function makePlan(
  goal: PresetPlan["templateGoal"],
  sex: PresetPlan["templateSex"],
  level: PresetPlan["templateLevel"]
): PresetPlan {
  const key = findWorkoutKey(goal, sex, level);
  const goalLabel = goal === "emagrecimento" ? "Emagrecimento" : "Hipertrofia";
  const sexLabel = sex === "M" ? "Masculino" : "Feminino";
  const levelLabel = level === "iniciante" ? "Iniciante" : "Intermediário";
  const focus =
    goal === "emagrecimento"
      ? "Full body com gasto calórico controlado"
      : "Sobrecarga progressiva e volume por grupo";

  return {
    key: `plan-${goal}-${sex}-${level}`,
    name: `Plano ${goalLabel} ${levelLabel} (${sexLabel})`,
    description: `3× por semana · ${focus}. Dias A/B/C com o treino base do programa.`,
    daysPerWeek: 3,
    templateGoal: goal,
    templateSex: sex,
    templateLevel: level,
    days: [
      { order: 1, label: "Dia A — Principal", suggestedWeekday: 1, workoutKey: key },
      { order: 2, label: "Dia B — Principal", suggestedWeekday: 3, workoutKey: key },
      { order: 3, label: "Dia C — Principal", suggestedWeekday: 5, workoutKey: key },
    ],
  };
}

export const PRESET_PLANS: PresetPlan[] = (
  ["emagrecimento", "hipertrofia"] as const
).flatMap((goal) =>
  (["M", "F"] as const).flatMap((sex) =>
    (["iniciante", "intermediario"] as const).map((level) => makePlan(goal, sex, level))
  )
);
