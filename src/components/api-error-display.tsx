'use client'

import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { type ApiError, getErrorTitle, getErrorMessage } from '@/hooks/use-react-query'

// ============================================
// TIPOS
// ============================================

interface ApiErrorDisplayProps {
  error: ApiError | null
  onRetry: () => void
  isRetrying?: boolean
  /** Título customizado */
  title?: string
  /** Mensagem customizada */
  message?: string
  /** Esconde o botão de retry */
  hideRetry?: boolean
  /** Variante visual: 'inline' (dentro de cards) ou 'full' (tela inteira) */
  variant?: 'inline' | 'full'
}

// ============================================
// ÍCONES POR TIPO DE ERRO
// ============================================

function ErrorIcon({ statusCode }: { statusCode?: number }) {
  if (!statusCode) return <AlertTriangle className="h-6 w-6 text-destructive" />
  
  if (statusCode >= 400 && statusCode < 500) {
    return <ShieldAlert className="h-6 w-6 text-orange-500" />
  }
  
  if (statusCode === 0 || !navigator.onLine) {
    return <WifiOff className="h-6 w-6 text-yellow-500" />
  }
  
  if (statusCode >= 500) {
    return <ServerCrash className="h-6 w-6 text-destructive" />
  }
  
  return <AlertTriangle className="h-6 w-6 text-destructive" />
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente para exibir erros de API de forma padronizada.
 * 
 * @example
 * ```tsx
 * const { isError, error, retry } = useApiQuery('/api/data', ['data'])
 * 
 * return (
 *   <>
 *     {isError && <ApiErrorDisplay error={error} onRetry={retry} />}
 *   </>
 * )
 * ```
 */
export function ApiErrorDisplay({
  error,
  onRetry,
  isRetrying = false,
  title: customTitle,
  message: customMessage,
  hideRetry = false,
  variant = 'inline',
}: ApiErrorDisplayProps) {
  if (!error) return null

  const title = customTitle || getErrorTitle(error.statusCode)
  const message = customMessage || getErrorMessage(error)

  // Variante full: ocupa a tela toda (para erros críticos)
  if (variant === 'full') {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="pt-6 pb-4 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <ErrorIcon statusCode={error.statusCode} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>

              {/* Detalhes técnicos em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <div className="w-full rounded-md bg-muted p-3 text-xs font-mono text-left overflow-auto max-h-24 border">
                  <p>Status: {error.statusCode || 'N/A'}</p>
                  <p>Message: {error.message}</p>
                  {error.code && <p>Code: {error.code}</p>}
                </div>
              )}

              {!hideRetry && (
                <Button 
                  onClick={onRetry} 
                  disabled={isRetrying}
                  variant="default"
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Variante inline: dentro de conteúdo existente
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <ErrorIcon statusCode={error.statusCode} />
          </div>
          
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-sm text-muted-foreground">{message}</p>
            
            {/* Detalhes técnicos em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs font-mono text-muted-foreground/70 truncate">
                [{error.statusCode}] {error.message}
              </p>
            )}
          </div>

          {!hideRetry && (
            <Button 
              onClick={onRetry} 
              disabled={isRetrying}
              variant="outline" 
              size="sm"
              className="shrink-0 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              Tentar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// COMPONENTE COMPOUTO (com loading + erro + dados)
// ============================================

interface QueryContainerProps<T> {
  /** Resultado do useApiQuery */
  query: {
    data: T | undefined
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    error: ApiError | null
    refetch: () => void
  }
  /** Render function para os dados */
  children: (data: T, isRefetching: boolean) => React.ReactNode
  /** Componente de loading customizado */
  loadingComponent?: React.ReactNode
  /** Props para o componente de erro */
  errorProps?: Partial<Omit<ApiErrorDisplayProps, 'error' | 'onRetry'>>
}

/**
 * Container que gerencia estados de loading/erro/dados automaticamente.
 * 
 * @example
 * ```tsx
 * const query = useApiQuery('/api/users', ['users'])
 * 
 * return (
 *   <QueryContainer query={query}>
 *     {(users, isRefreshing) => <UserList users={users} refreshing={isRefreshing} />}
 *   </QueryContainer>
 * )
 * ```
 */
export function QueryContainer<T>({
  query,
  children,
  loadingComponent,
  errorProps,
}: QueryContainerProps<T>) {
  // Loading state inicial
  if (query.isLoading) {
    return <>{loadingComponent || <DefaultLoadingSkeleton />}</>
  }

  // Error state
  if (query.isError) {
    return (
      <ApiErrorDisplay
        error={query.error}
        onRetry={query.refetch}
        isRetrying={query.isFetching}
        {...errorProps}
      />
    )
  }

  // Success state
  if (query.data) {
    return <>{children(query.data, query.isFetching && !query.isLoading)}</>
  }

  return null
}

// ============================================
// SKELETON PADRÃO
// ============================================

function DefaultLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-48 rounded-md bg-muted" />
        <div className="h-4 w-64 rounded-md bg-muted" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export default ApiErrorDisplay
