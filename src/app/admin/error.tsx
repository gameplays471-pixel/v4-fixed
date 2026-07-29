"use client";

import { RouteError } from "@/components/route-error";

// Error boundary do painel admin. Isola o admin do app principal: se
// uma tela admin (exercícios, usuários) crashar, o app continua
// navegável normalmente.

export default function AdminError({
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
      title="Não foi possível carregar o painel administrativo"
    />
  );
}
