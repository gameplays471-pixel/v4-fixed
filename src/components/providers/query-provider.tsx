'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { getQueryClient } from '@/lib/query-client'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Usamos lazy initialization para evitar criar múltiplas instâncias
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
