/**
 * Feature flags simples via env (sem redeploy de código para mudar valor
 * na Vercel: Environment Variables → Redeploy).
 *
 * Valores truthy: "1" | "true" | "yes" | "on"
 * Default: ver cada flag.
 */

function envFlag(name: string, defaultEnabled: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultEnabled;
  const v = raw.trim().toLowerCase();
  if (["0", "false", "no", "off"].includes(v)) return false;
  if (["1", "true", "yes", "on"].includes(v)) return true;
  return defaultEnabled;
}

export const featureFlags = {
  /** Mini-game (metas diárias, ranking de grupo) */
  gamification: envFlag("FEATURE_GAMIFICATION", true),
  /** Live share de treino em andamento */
  liveShare: envFlag("FEATURE_LIVE_SHARE", true),
  /** Progressão automática no resumo pós-treino */
  progressionSuggestions: envFlag("FEATURE_PROGRESSION", true),
  /** Planos semanais no dashboard do aluno */
  weeklyPlans: envFlag("FEATURE_WEEKLY_PLANS", true),
} as const;

export type FeatureFlagName = keyof typeof featureFlags;

export function isFeatureEnabled(name: FeatureFlagName): boolean {
  return featureFlags[name];
}
