export type SetForProgression = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  rir?: number | null;
  isPR?: boolean;
  durationSec?: number | null;
};

export type ProgressionSuggestion = {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  lastReps: number;
  suggestedWeight: number;
  suggestedReps: number;
  reason: string;
};

const LOAD_STEP = 2.5;

function bestStrengthSet(sets: SetForProgression[]): SetForProgression | null {
  const strength = sets.filter((s) => s.durationSec == null && s.weight > 0);
  if (strength.length === 0) return null;
  return strength.reduce((best, s) => {
    if (s.weight > best.weight) return s;
    if (s.weight === best.weight && s.reps > best.reps) return s;
    return best;
  });
}

export function suggestProgressions(allSets: SetForProgression[]): ProgressionSuggestion[] {
  const byExercise = new Map<string, SetForProgression[]>();
  for (const s of allSets) {
    if (s.durationSec != null) continue;
    const list = byExercise.get(s.exerciseId) ?? [];
    list.push(s);
    byExercise.set(s.exerciseId, list);
  }

  const out: ProgressionSuggestion[] = [];
  for (const [, sets] of byExercise) {
    const best = bestStrengthSet(sets);
    if (!best) continue;

    const rir = best.rir;
    let suggestedWeight = best.weight;
    let suggestedReps = best.reps;
    let reason: string;

    if (best.isPR || (rir != null && rir <= 1)) {
      suggestedWeight = Math.round((best.weight + LOAD_STEP) * 10) / 10;
      suggestedReps = best.reps;
      reason = best.isPR
        ? `PR de carga — tente +${LOAD_STEP} kg na próxima`
        : `RIR ${rir} — sobrou pouca margem; +${LOAD_STEP} kg`;
    } else if (best.reps >= 12 && (rir == null || rir <= 2)) {
      suggestedWeight = Math.round((best.weight + LOAD_STEP) * 10) / 10;
      suggestedReps = Math.max(8, best.reps - 2);
      reason = `Muitas reps (${best.reps}) — suba ${LOAD_STEP} kg`;
    } else if (best.reps < 6) {
      suggestedWeight = best.weight;
      suggestedReps = best.reps + 1;
      reason = `Poucas reps — mantenha o peso e busque +1 rep`;
    } else {
      suggestedWeight = best.weight;
      suggestedReps = best.reps + 1;
      reason = `Progressão linear — mesmo peso, +1 rep`;
    }

    if (suggestedWeight === best.weight && suggestedReps === best.reps) {
      suggestedReps = best.reps + 1;
      reason = `Tente +1 rep com ${best.weight} kg`;
    }

    out.push({
      exerciseId: best.exerciseId,
      exerciseName: best.exerciseName,
      lastWeight: best.weight,
      lastReps: best.reps,
      suggestedWeight,
      suggestedReps,
      reason,
    });
  }
  return out;
}
