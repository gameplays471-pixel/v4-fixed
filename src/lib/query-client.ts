import { QueryClient } from '@tanstack/react-query'

// Configuração otimizada do QueryClient para Next.js
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tempo em ms que os dados são considerados "fresh" (não precisam revalidar)
        staleTime: 60 * 1000, // 1 minuto
        
        // Tempo em ms que dados não-usados ficam no cache antes de serem removidos
        gcTime: 5 * 60 * 1000, // 5 minutos (anteriormente chamado cacheTime)
        
        // Se true, refetch quando a janela ganha foco (usuário volta da aba)
        refetchOnWindowFocus: false, // Desabilitado para evitar requests desnecessários
        
        // Se true, refetch quando a conexão voltar online
        refetchOnReconnect: true,
        
        // Se true, refetch quando o componente remonta
        refetchOnMount: 'always', // Sempre tenta buscar dados ao montar
        
        // Número de tentativas de retry em caso de falha
        retry: 2,
        
        // Delay exponencial entre retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Retry em mutations geralmente não é desejado (pode criar duplicados)
        retry: false,
      },
    },
  })
}

// Singleton do query client para SSR (Server-Side Rendering)
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: sempre cria um novo client (para evitar compartilhar estado entre requisições)
    return makeQueryClient()
  } else {
    // Browser: usa singleton para manter cache entre navegações
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}
