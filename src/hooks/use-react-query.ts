'use client'

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

// ============================================
// TIPOS GENÉRICOS
// ============================================

export interface ApiError {
  message: string
  statusCode?: number
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Opções do useApiQuery
interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'> {
  /** Mensagem customizada para toast de erro (padrão: mensagem do erro) */
  errorMessage?: string
  /** Desabilita toast automático em caso de erro */
  showErrorToast?: boolean
  /** Título customizado para o toast */
  errorTitle?: string
  /** Callback adicional quando há erro */
  onError?: (error: ApiError) => void
}

// Retorno padronizado do useApiQuery
interface UseApiQueryResult<TData> {
  /** Dados retornados pela API */
  data: TData | undefined
  /** Se está carregando na primeira vez */
  isLoading: boolean
  /** Se está buscando dados (inclui refetch) */
  isFetching: boolean
  /** Se houve erro */
  isError: boolean
  /** Objeto de erro */
  error: ApiError | null
  /** Se tem dados válidos */
  isSuccess: boolean
  /** Função para refetch manual */
  refetch: () => void
  /** Número de tentativas realizadas */
  failureCount: number
  /** Função para resetar o estado de erro e tentar novamente */
  retry: () => void
}

// ============================================
// FETCHER GENÉRICO (com tratamento de erro)
// ============================================

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    // Tenta extrair mensagem de erro do body
    let errorMessage = `Erro ${response.status}: ${response.statusText}`
    let errorCode: string | undefined
    
    try {
      const errorBody = await response.json()
      if (errorBody?.message) {
        errorMessage = errorBody.message
      }
      if (errorBody?.code) {
        errorCode = errorBody.code
      }
    } catch {
      // Se não conseguir parsear JSON, usa mensagem padrão
    }

    const error: ApiError = {
      message: errorMessage,
      statusCode: response.status,
      code: errorCode,
    }
    throw error
  }

  return response.json()
}

// ============================================
// MENSAGENS DE ERRO PADRONIZADAS
// ============================================

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Você precisa estar autenticado para acessar este recurso.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito de dados. O recurso já pode existir.',
  422: 'Dados inválidos. Verifique os campos do formulário.',
  429: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Servidor indisponível. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível.',
}

function getErrorMessage(error: ApiError, fallbackMessage?: string): string {
  // Se foi passada mensagem customizada, usa ela
  if (fallbackMessage) return fallbackMessage
  
  // Se tem código de status, busca mensagem padronizada
  if (error.statusCode && ERROR_MESSAGES[error.statusCode]) {
    return ERROR_MESSAGES[error.statusCode]
  }
  
  // Usa a mensagem do erro ou genérica
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.'
}

function getErrorTitle(statusCode?: number): string {
  if (!statusCode) return 'Erro'
  if (statusCode >= 400 && statusCode < 500) return 'Erro de Requisição'
  if (statusCode >= 500) return 'Erro no Servidor'
  return 'Erro'
}

// ============================================
// HOOK PRINCIPAL - useApiQuery
// ============================================

/**
 * Hook padronizado para buscar dados da API com tratamento de erro consistente.
 * 
 * Características:
 * - Toast automático em caso de erro
 * - Console.error padronizado com contexto
 * - Retry integrado
 * - Loading states claros (isLoading vs isFetching)
 * 
 * @example
 * ```tsx
 * // Uso básico
 * const { data, isLoading, isError, error, retry } = useApiQuery<User>(
 *   '/api/users/1',
 *   ['users', '1']
 * )
 * 
 * // Com opções customizadas
 * const { data, isLoading, isError, retry } = useApiQuery<Stats>(
 *   '/api/stats',
 *   ['stats'],
 *   {
 *     errorMessage: 'Não foi possível carregar estatísticas',
 *     staleTime: 60_000,
 *   }
 * )
 * ```
 */
export function useApiQuery<TData>(
  url: string | null,
  queryKey: string[],
  options?: UseApiQueryOptions<TData>
): UseApiQueryResult<TData> {
  const {
    errorMessage: customErrorMessage,
    showErrorToast = true,
    errorTitle: customErrorTitle,
    onError,
    ...queryOptions
  } = options || {}

  // Usamos ref para rastrear se o erro já foi mostrado (evita setState em effect)
  const hasShownErrorRef = useRef(false)
  const [errorRetryCount, setErrorRetryCount] = useState(0)

  const query = useQuery<TData, ApiError>({
    queryKey,
    queryFn: () => fetcher<TData>(url!),
    enabled: !!url && queryOptions.enabled !== false,
    ...queryOptions,
  })

  // Efeito para mostrar toast de erro
  useEffect(() => {
    // Reset quando começa a carregar novamente
    if (query.isFetching && !query.isError) {
      hasShownErrorRef.current = false
      return
    }

    if (query.isError && query.error && !hasShownErrorRef.current && showErrorToast) {
      // Marca que já mostrou este erro
      hasShownErrorRef.current = true
      
      const title = customErrorTitle || getErrorTitle(query.error.statusCode)
      const message = getErrorMessage(query.error, customErrorMessage)
      
      toast.error(title, {
        description: message,
        duration: 5000,
        action: {
          label: 'Tentar novamente',
          onClick: () => query.refetch(),
        },
      })

      // Log padronizado no console
      console.error(`[API Error] ${title}:`, {
        url,
        queryKey,
        error: query.error,
        statusCode: query.error.statusCode,
        timestamp: new Date().toISOString(),
      })

      // Callback de erro customizado
      if (onError) {
        onError(query.error)
      }
    }
  }, [query.isError, query.error, query.isFetching, showErrorToast, customErrorMessage, customErrorTitle, onError, url, queryKey, query.refetch])

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error || null,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    failureCount: query.failureCount,
    retry: () => {
      hasShownErrorRef.current = false
      setErrorRetryCount(c => c + 1) // Força re-render
      query.refetch()
    },
  }
}

// ============================================
// HOOKS ADICIONAIS (usam useApiQuery internamente)
// ============================================

/**
 * Hook para dados paginados com tratamento de erro padronizado
 */
export function usePaginatedQuery<TData>(
  baseUrl: string,
  queryKey: string[],
  page: number = 1,
  pageSize: number = 10,
  options?: UseApiQueryOptions<PaginatedResponse<TData>>
): UseApiQueryResult<PaginatedResponse<TData>> {
  const url = `${baseUrl}?page=${page}&pageSize=${pageSize}`
  
  return useApiQuery<PaginatedResponse<TData>>(
    url,
    [...queryKey, page, pageSize],
    options
  )
}

/**
 * Hook para mutations (POST, PUT, DELETE) com toast de sucesso/erro
 */
export function useApiMutation<TVariables = unknown, TResponse = unknown>(
  url: string,
  invalidationKeys: string[][],
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: TResponse) => void
    onError?: (error: ApiError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TResponse, ApiError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const fetchOptions: RequestInit = {
        method,
        body: method !== 'DELETE' ? JSON.stringify(variables) : undefined,
      }
      
      return fetcher<TResponse>(url, fetchOptions)
    },
    onSuccess: (data) => {
      // Invalida todas as queries relacionadas após sucesso
      invalidationKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Toast de sucesso (se não desabilitado)
      if (options?.successMessage !== false) {
        const message = options?.successMessage || 'Operação realizada com sucesso!'
        toast.success('Sucesso', {
          description: message,
          duration: 3000,
        })
      }

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Toast de erro padronizado
      const message = options?.errorMessage || getErrorMessage(error)
      const title = getErrorTitle(error.statusCode)
      
      toast.error(title, {
        description: message,
        duration: 5000,
      })

      // Log padronizado
      console.error(`[Mutation Error] ${title}:`, {
        url,
        method,
        error,
        timestamp: new Date().toISOString(),
      })

      options?.onError?.(error)
    },
  })
}

/**
 * Hook para busca com debounce (útil para search inputs)
 */
export function useDebouncedSearch<TData>(
  searchUrl: (term: string) => string | null,
  queryKeyPrefix: string[],
  debounceMs: number = 300,
  options?: UseApiQueryOptions<TData[]>
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  const url = searchUrl(debouncedTerm)

  const query = useApiQuery<TData[]>(
    url,
    [...queryKeyPrefix, debouncedTerm],
    {
      ...options,
      enabled: !!url && debouncedTerm.length > 0 && (options?.enabled !== false),
    }
  )

  return {
    ...query,
    searchTerm,
    setSearchTerm,
  }
}

/**
 * Hook para prefetching de dados (pré-carregamento)
 */
export function usePrefetch<TData>() {
  const queryClient = useQueryClient()

  const prefetch = useCallback(
    (url: string, queryKey: string[]) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn: () => fetcher<TData>(url),
        staleTime: 30_000,
      })
    },
    [queryClient]
  )

  return { prefetch }
}

// ============================================
// HOOKS LEGADOS (compatibilidade)
// ============================================

/** @deprecated Use useApiQuery instead */
export function useApiData<T>(
  url: string | null,
  queryKey: string[],
  options?: {
    enabled?: boolean
    staleTime?: number
    refetchInterval?: number
  }
) {
  return useApiQuery<T>(url, queryKey, options as UseApiQueryOptions<T>)
}

/** @deprecated Use usePaginatedQuery instead */
export function usePaginatedData<T>(
  baseUrl: string,
  queryKey: string[],
  page: number = 1,
  pageSize: number = 10,
  options?: { enabled?: boolean }
) {
  return usePaginatedQuery<T>(baseUrl, queryKey, page, pageSize, options as UseApiQueryOptions<PaginatedResponse<T>>)
}

/** @deprecated Use useApiMutation instead */
export function useMutationApi<TVariables = unknown, TResponse = unknown>(
  url: string,
  invalidationKeys: string[][],
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
) {
  return useApiMutation<TVariables, TResponse>(url, invalidationKeys, method)
}

// ============================================
// EXPORTAÇÕES AUXILIARES
// ============================================

/** Utilitário para formatar mensagens de erro (reutilizável fora dos hooks) */
export { getErrorMessage, getErrorTitle, ERROR_MESSAGES }
