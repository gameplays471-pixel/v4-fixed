"use client";

import { RouteError } from "@/components/route-error";

// Error boundary da página pública de treino compartilhado. Diferente
// dos outros: aqui não existe sidebar nem auth, e o link costuma ser
// aberto de fora (WhatsApp, etc.) por alguém sem conta — o fallback
// precisa ser autocontido.

export default function SharedWorkoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Não foi possível abrir este treino"
      description="O link pode estar expirado ou tivemos um problema técnico. Tente abrir o app para conferir seus treinos salvos."
    />
  );
}
