'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Logar erro crítico para serviço de monitoramento
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Erro Crítico da Aplicação
            </h1>
            <p className="text-muted-foreground">
              Ocorreu um erro grave no sistema. Nossa equipe foi notificada.
            </p>
          </div>

          {/* Error Details (dev only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="rounded-lg bg-muted p-4 text-sm font-mono text-left overflow-auto max-h-32 border border-border">
              {error.message}
            </div>
          )}

          {error.digest && (
            <p className="text-xs text-muted-foreground">
              ID do Erro: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button onClick={reset} size="lg" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar Aplicação
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
