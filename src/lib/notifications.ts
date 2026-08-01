// Notificações do sistema — usadas principalmente pelo timer de descanso
// (ver hooks/useRestTimer.ts) para avisar quando o tempo acaba mesmo que o
// usuário tenha trocado de aba ou de app.
//
// Limitação importante (e honesta): isso funciona enquanto a aba/processo do
// navegador continua vivo em segundo plano — é o caso de "troquei de aba" ou
// "abri o Instagram e voltei". Não é uma push notification de verdade: se o
// navegador for fechado ou o celular tiver a tela bloqueada por muito tempo
// e o sistema operacional suspender o app, nada dispara. Resolver esse caso
// exigiria um servidor de push (Web Push + VAPID) mandando a notificação de
// fora — isso é uma mudança de infraestrutura maior, não só de frontend.

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/** Pede permissão ao usuário. Não faz nada se já foi concedida/negada antes. */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

/**
 * Dispara a notificação de "descanso concluído". Prefere
 * `ServiceWorkerRegistration.showNotification`, que produz uma notificação
 * de sistema (ícone, vibração, ação de toque) mesmo com a aba em segundo
 * plano; cai para `new Notification` se não houver service worker ativo.
 */
export async function notifyRestDone(exerciseName?: string): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  const title = "Descanso concluído! 🔥";
  const body = exerciseName ? `Hora de voltar para ${exerciseName}` : "Hora de continuar o treino";
  // `renotify` e `vibrate` existem na spec (e em NotificationOptions do
  // ServiceWorkerRegistration.showNotification), mas o lib.dom.d.ts usado
  // pelo TypeScript no build da Vercel não os declara em `NotificationOptions`
  // — por isso o tipo extendido abaixo, em vez de `NotificationOptions` puro.
  type ExtendedNotificationOptions = NotificationOptions & {
    renotify?: boolean;
    vibrate?: number | number[];
  };
  const options: ExtendedNotificationOptions = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "gemgym-rest-timer", // substitui uma notificação anterior em vez de empilhar
    renotify: true,
    // Padrão mais perceptível — em muitos mobiles o SO faz ducking
    // automático da música de fundo ao tocar notificação com som.
    vibrate: [220, 80, 220, 80, 320],
    requireInteraction: true, // fica visível até o usuário interagir
    silent: false,
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
  } catch (err) {
    console.warn("[notifications] Falha ao mostrar notificação:", err);
  }
}
