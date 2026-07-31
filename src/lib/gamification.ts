// Regras do mini-game centralizadas aqui para não duplicar a fórmula de
// pontuação entre o resumo pessoal (/api/gamification/summary) e o
// ranking de grupo (/api/groups/[id]/ranking) — se um dia os pesos
// mudarem, muda num lugar só.

export const GAME_POINTS = {
  WORKOUT: 10, // por treino concluído (WorkoutSession) na semana
  DIET_DAY: 5, // por dia marcado "segui a dieta"
  WATER_DAY: 5, // por dia em que a meta de água foi batida
} as const;

export type WeekRange = { start: Date; end: Date };

/**
 * Semana de segunda a domingo (hora do servidor, mesma convenção usada em
 * /api/stats para o cálculo de sequência) contendo `reference`.
 * `start` é meia-noite de segunda; `end` é 23:59:59.999 de domingo.
 */
export function getWeekRange(reference: Date = new Date()): WeekRange {
  const day = reference.getDay(); // 0=domingo .. 6=sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/** Meia-noite do dia de `reference` (ou hoje) — chave de agrupamento do DailyLog. */
export function startOfDay(reference: Date = new Date()): Date {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function computeGameScore(counts: { workouts: number; dietDays: number; waterDays: number }): number {
  return (
    counts.workouts * GAME_POINTS.WORKOUT +
    counts.dietDays * GAME_POINTS.DIET_DAY +
    counts.waterDays * GAME_POINTS.WATER_DAY
  );
}

/** Gera um código de convite curto e fácil de digitar (sem caracteres ambíguos). */
export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
