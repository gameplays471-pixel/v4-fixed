"use client";

import { RouteError } from "@/components/route-error";

export default function AtivoTreinoError({
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
      title="Não foi possível carregar o treino em andamento"
      description="O erro já foi registrado automaticamente. Seus sets já preenchidos ficam salvos localmente neste aparelho — tente novamente para continuar de onde parou."
    />
  );
}
