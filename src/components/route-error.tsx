"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Título curto, específico da tela (ex: "Não foi possível carregar as estatísticas") */
  title?: string;
  description?: string;
}

/**
 * UI de fallback para os `error.tsx` de cada rota dentro de `(app)`.
 *
 * Diferente do `global-error.tsx` (que substitui todo o documento porque
 * intercepta falhas no próprio root layout), esse componente é renderizado
 * *dentro* do layout normal — a sidebar/topbar continuam de pé e só o
 * conteúdo daquela tela é trocado pelo fallback. Um crash em "Stats", por
 * exemplo, não derruba mais o resto do app.
 */
export function RouteError({
  error,
  reset,
  title = "Não foi possível carregar esta tela",
  description = "O erro já foi registrado automaticamente. O resto do app continua funcionando normalmente — tente de novo ou navegue para outra área.",
}: RouteErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mb-1.5 text-lg font-black tracking-tight">{title}</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {error.digest && (
        <p className="mb-6 font-mono text-[11px] text-muted-foreground/60">
          Ref: {error.digest}
        </p>
      )}
      <Button
        onClick={reset}
        className="h-10 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-md shadow-primary/20"
      >
        Tentar novamente
      </Button>
    </div>
  );
}
