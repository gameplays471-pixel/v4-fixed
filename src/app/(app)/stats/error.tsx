"use client";

import { RouteError } from "@/components/route-error";

export default function StatsError({
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
      title="Não foi possível carregar as estatísticas"
    />
  );
}
