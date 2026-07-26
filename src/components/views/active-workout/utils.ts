export function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// ─── Sugestão de progressão de carga ───────────────────────────────────────

export type LastSetRecord = { weight: number; reps: number; rir?: number | null };

export type LoadSuggestion = {
  /** Peso sugerido pra hoje, já arredondado pro incremento de placa mais comum. */
  weight: number;
  /** Texto curto pra mostrar na UI explicando de onde veio a sugestão. */
  message: string;
};

// Menor incremento de placa comum em academia — usado como "degrau" de subida.
const PLATE_INCREMENT = 2.5;

/**
 * Sugere a carga de hoje a partir do set mais pesado do treino anterior
 * (o "top set"), usando RIR (reps in reserve) quando o usuário registrou —
 * senão cai para uma heurística mais conservadora baseada só em reps x meta.
 *
 * Regras (a partir do pior RIR entre os sets no peso máximo da vez passada):
 * - RIR não registrado: só sugere subir se a média de reps ficou 2+ acima
 *   da meta (sinal forte de que sobrou); senão não opina (dado insuficiente).
 * - RIR ≥ 3 (sobrou fôlego): sugere subir 1 incremento de placa.
 * - RIR 1–2 (desafiador, no ponto certo): mantém o peso, sugere +1 rep.
 * - RIR 0 (foi até o limite): mantém o peso — nunca sugere subir logo
 *   depois de uma sessão levada à falha.
 *
 * Retorna `null` quando não há dado suficiente pra uma sugestão confiável
 * (ex.: sem histórico, ou heurística sem RIR sem sinal claro).
 */
export function suggestNextLoad(
  lastSets: LastSetRecord[] | undefined,
  targetReps: number
): LoadSuggestion | null {
  if (!lastSets || lastSets.length === 0) return null;

  const maxWeight = Math.max(...lastSets.map((s) => s.weight));
  if (!maxWeight || maxWeight <= 0) return null;

  const topSets = lastSets.filter((s) => s.weight === maxWeight);
  const avgReps = topSets.reduce((acc, s) => acc + s.reps, 0) / topSets.length;

  const recordedRirs = topSets
    .map((s) => s.rir)
    .filter((r): r is number => r != null && !Number.isNaN(r));

  // Sem RIR registrado nesse set: heurística conservadora baseada só em reps.
  if (recordedRirs.length === 0) {
    if (targetReps > 0 && avgReps >= targetReps + 2) {
      const weight = roundToIncrement(maxWeight + PLATE_INCREMENT);
      return {
        weight,
        message: `Você fez ${formatNumber(avgReps)} reps (meta era ${targetReps}) — tente ${formatNumber(weight)}kg hoje.`,
      };
    }
    return null;
  }

  const worstRir = Math.min(...recordedRirs);

  if (worstRir >= 3) {
    const weight = roundToIncrement(maxWeight + PLATE_INCREMENT);
    return {
      weight,
      message: `RIR ${worstRir} na última vez (sobrou fôlego) — que tal ${formatNumber(weight)}kg hoje?`,
    };
  }

  if (worstRir <= 0) {
    return {
      weight: maxWeight,
      message: `RIR 0 na última vez (foi até o limite) — mantenha ${formatNumber(maxWeight)}kg e foque na execução.`,
    };
  }

  // RIR 1–2: desafiador mas controlado — mantém o peso, busca 1 rep a mais.
  return {
    weight: maxWeight,
    message: `RIR ${worstRir} na última vez — mantenha ${formatNumber(maxWeight)}kg e tente +1 rep hoje.`,
  };
}

function roundToIncrement(value: number, increment: number = PLATE_INCREMENT) {
  return Math.round(value / increment) * increment;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
