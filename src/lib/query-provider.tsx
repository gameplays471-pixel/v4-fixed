"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Provider único do React Query pra toda a aplicação.
 *
 * Antes, cada tela (Treinos, Histórico, Biblioteca, Stats, Corpo...) buscava
 * seus dados do zero via `useEffect` + `fetch` toda vez que montava — trocar
 * de aba e voltar recarregava tudo com loading spinner, mesmo sem nada ter
 * mudado. Com o React Query:
 *
 * - `staleTime` de 30s: dado buscado há menos de 30s é considerado "fresco"
 *   e reusado sem nova requisição ao remontar a tela.
 * - Dado mais velho que isso ainda aparece instantâneo (cache), mas dispara
 *   um refetch em segundo plano (stale-while-revalidate) — a tela já mostra
 *   o último resultado conhecido enquanto atualiza silenciosamente.
 * - `refetchOnWindowFocus: false`: evita refetch a cada troca de aba do
 *   navegador/app, que seria agressivo demais pro padrão de uso daqui
 *   (o `staleTime` já cobre a atualização em segundo plano).
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState (não useMemo) garante que o QueryClient nasce uma única vez por
  // sessão do componente e sobrevive a re-renders, sem recriar cache à toa.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
