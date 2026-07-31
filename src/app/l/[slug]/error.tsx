"use client";

import { RouteError } from "@/components/route-error";

// Error boundary da página pública de treino ao vivo. Igual à de /w/[slug]:
// sem sidebar nem auth, link geralmente aberto por alguém sem conta.

export default function LiveWorkoutError({
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
      title="Não foi possível abrir esta transmissão"
      description="O link pode estar expirado, a transmissão pode ter terminado, ou tivemos um problema técnico."
    />
  );
}
