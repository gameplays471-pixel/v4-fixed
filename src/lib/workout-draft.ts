// Persiste o progresso do treino ativo no localStorage, para que o usuário
// não perca as séries/pesos/tempos já registrados caso o navegador recarregue
// a página (aba em segundo plano sendo encerrada pelo sistema, queda de
// conexão, F5 sem querer, etc).

const DRAFT_KEY_PREFIX = "gemgym:workout-draft:";

export type SetDraft = {
  weight: string;
  reps: string;
  completed: boolean;
};

export type CardioDraft = {
  durationMin: string;
  distanceKm: string;
  avgBpm: string;
  intensity: string;
  completed: boolean;
};

export type WorkoutDraft = {
  workoutId: string;
  startedAt: string; // ISO
  setsMap: Record<string, SetDraft[]>;
  cardioMap: Record<string, CardioDraft>;
  collapsedExercises: string[];
  savedAt: string; // ISO
};

export function loadWorkoutDraft(workoutId: string): WorkoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY_PREFIX + workoutId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutDraft;
    if (parsed.workoutId !== workoutId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkoutDraft(draft: WorkoutDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DRAFT_KEY_PREFIX + draft.workoutId,
      JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
    );
  } catch {
    // localStorage indisponível (modo privado, quota cheia, etc) — falha em silêncio,
    // o treino continua funcionando normalmente, só sem o autosave.
  }
}

export function clearWorkoutDraft(workoutId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY_PREFIX + workoutId);
  } catch {}
}

// Para restaurar a tela certa ao recarregar o app: guarda só o ID do treino
// ativo (bem leve), lido de forma síncrona antes do primeiro render.
const ACTIVE_ID_KEY = "gemgym:active-workout-id";

export function getPersistedActiveWorkoutId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

export function setPersistedActiveWorkoutId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(ACTIVE_ID_KEY, id);
    else window.localStorage.removeItem(ACTIVE_ID_KEY);
  } catch {}
}
