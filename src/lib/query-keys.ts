// Chaves de cache do React Query centralizadas num só lugar. Usar uma
// função em vez de strings soltas espalhadas pelas telas evita o erro
// clássico de uma tela invalidar "/api/workouts" e outra invalidar
// "workouts" — que não batem e deixam cache desatualizado sem ninguém notar.
export const queryKeys = {
  stats: ["stats"] as const,
  workouts: ["workouts"] as const,
  workout: (id: string) => ["workouts", id] as const,
  sessions: (limit?: number) => ["sessions", limit ?? "all"] as const,
  sessionsInfinite: ["sessions", "infinite"] as const,
  exercises: ["exercises"] as const,
  favorites: ["favorites"] as const,
  profile: ["profile"] as const,
  bodyWeightLogs: ["bodyweight-logs"] as const,
  progressPhotos: ["progress-photos"] as const,
  gameSummary: ["game-summary"] as const,
  dailyLogs: (days?: number) => ["daily-logs", days ?? 14] as const,
  plans: ["plans"] as const,
  exerciseHistory: (id: string) => ["exercise-history", id] as const,
  groups: ["groups"] as const,
  groupRanking: (id: string) => ["groups", id, "ranking"] as const,
};
