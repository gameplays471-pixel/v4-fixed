'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Logar o erro para serviço de monitoramento
    console.error('Route Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Algo deu errado</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ocorreu um erro inesperado ao carregar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mostrar digest em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="rounded-md bg-muted p-3 text-sm font-mono text-muted-foreground overflow-auto max-h-24">
              {error.message}
            </div>
          )}
          
          {error.digest && (
            <p className="text-xs text-muted-foreground text-center">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              onClick={reset} 
              variant="default" 
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
