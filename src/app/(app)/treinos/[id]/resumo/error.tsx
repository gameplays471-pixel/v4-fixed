"use client";

import { RouteError } from "@/components/route-error";

export default function ResumoTreinoError({
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
      title="Não foi possível carregar o resumo do treino"
    />
  );
}
