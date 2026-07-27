"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Precisa ter <html>/<body> próprios porque, quando acionado, esse
// componente substitui o root layout inteiro (é o último degrau antes de
// uma tela branca crua do navegador). Por isso não importa fontes/CSS do
// layout principal — mantém só o essencial pra sempre renderizar, mesmo
// se o que quebrou for o próprio layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Algo deu errado</h1>
          <p style={{ fontSize: 14, color: "#a3a3a3", marginBottom: 20 }}>
            O erro já foi registrado automaticamente. Tente recarregar a página.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#737373", marginBottom: 20, fontFamily: "monospace" }}>
              Ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#22c55e",
              color: "#052e16",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
