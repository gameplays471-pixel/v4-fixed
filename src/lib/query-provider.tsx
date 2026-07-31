"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

/**
 * Provider do React Query.
 *
 * Defaults:
 * - staleTime 60s, sem refetch on focus (menos hits no pooler)
 * - exercises: 10 min (catálogo quase estático)
 * - stats: 2 min (agregações caras)
 * - plans: 60s
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          gcTime: 15 * 60_000,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          retry: 1,
        },
      },
    });

    client.setQueryDefaults(queryKeys.exercises, {
      staleTime: 10 * 60_000,
      gcTime: 30 * 60_000,
    });
    client.setQueryDefaults(queryKeys.stats, {
      staleTime: 2 * 60_000,
      gcTime: 15 * 60_000,
    });
    client.setQueryDefaults(queryKeys.favorites, {
      staleTime: 5 * 60_000,
    });
    client.setQueryDefaults(queryKeys.plans, {
      staleTime: 60_000,
    });

    return client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
