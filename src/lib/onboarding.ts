// Guarda se o usuário já viu o tour de boas-vindas, pra não mostrar de
// novo em todo login. Segue o mesmo padrão de outras flags client-only do
// app (ver USER_CACHE_KEY em app/(app)/layout.tsx, PENDING_CLONE_KEY em
// app/w/[slug]/clone-workout-button.tsx): armazenamento simples no
// localStorage, sem persistir no backend — é só uma preferência de UI.

const ONBOARDING_SEEN_KEY = "gemgym:onboarding-seen";

export function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ONBOARDING_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
  } catch {}
}
