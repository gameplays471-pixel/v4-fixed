// Controla se o tour de boas-vindas deve aparecer automaticamente a cada
// login/cadastro. Ao contrário do comportamento antigo ("mostra só uma vez
// na vida"), agora o tour aparece em TODO login, a menos que a pessoa
// clique explicitamente em "Não mostrar novamente" dentro do próprio tour.
//
// Usamos uma chave nova (em vez de reaproveitar a antiga de "já visto"),
// porque a semântica mudou: antes, só ter visto o tour uma vez já bastava
// pra suprimir ele pra sempre — o que causava o bug de ele nunca mais
// aparecer em cadastros seguintes no mesmo navegador (bastava ter sido
// visto uma única vez, em qualquer teste anterior). Agora só a ação
// explícita de opt-out suprime.
//
// Armazenamento simples no localStorage, sem persistir no backend — é só
// uma preferência de UI (mesmo padrão de USER_CACHE_KEY em
// app/(app)/layout.tsx e PENDING_CLONE_KEY em
// app/w/[slug]/clone-workout-button.tsx).

const ONBOARDING_OPT_OUT_KEY = "gemgym:onboarding-opt-out";

export function hasOptedOutOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ONBOARDING_OPT_OUT_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingOptOut() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_OPT_OUT_KEY, "1");
  } catch {}
}
