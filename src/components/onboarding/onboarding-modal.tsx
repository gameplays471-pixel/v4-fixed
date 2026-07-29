'use client'

import { useState } from 'react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles,
  Dumbbell,
  PlayCircle,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// COMPONENTE PRINCIPAL - OnboardingModal
// ============================================

interface OnboardingModalProps {
  /** Classe customizada para o modal */
  className?: string
  /** Se deve mostrar botão para reiniciar (quando fechado) */
  showRestartButton?: boolean
}

export function OnboardingModal({ className, showRestartButton = false }: OnboardingModalProps) {
  const {
    isOpen,
    currentStep,
    totalSteps,
    step,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    skip,
    complete,
    restart,
  } = useOnboarding()

  // Se não está aberto e não mostra restart button, retorna null
  if (!isOpen && !showRestartButton) {
    return null
  }

  return (
    <>
      {/* Modal do Onboarding */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && skip()}>
        <DialogContent 
          className={cn(
            "sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0",
            className
          )}
          // Impede de fechar clicando fora (força interação)
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header com progresso */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Botão pular (canto superior direito) */}
            {!isLastStep && (
              <button
                onClick={skip}
                className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                Pular
              </button>
            )}

            {/* Indicador de Progresso */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentStep 
                      ? "w-8 bg-primary" 
                      : i < currentStep 
                        ? "w-2 bg-primary/60" 
                        : "w-2 bg-muted-foreground/20"
                  )}
                  aria-label={`Ir para etapa ${i + 1}`}
                />
              ))}
            </div>

            <DialogHeader className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                {step?.icon || <Sparkles className="h-8 w-8 text-primary" />}
              </div>
              <DialogTitle className="text-2xl font-bold">
                {step?.title || `Passo ${currentStep + 1}`}
              </DialogTitle>
              <DialogDescription className="text-base mt-2 max-w-md mx-auto">
                {step?.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Conteúdo da Etapa */}
          <CardContent className="px-6 py-4">
            {step?.content && (
              <div className="rounded-xl bg-muted/50 p-6 border border-border/50">
                {step.content}
              </div>
            )}

            {/* Conteúdo padrão baseado na etapa */}
            {!step?.content && (
              <DefaultStepContent stepIndex={currentStep} />
            )}
          </CardContent>

          {/* Footer com Navegação */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
            {/* Botão Voltar */}
            <Button
              variant="ghost"
              size="lg"
              onClick={prevStep}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>

            {/* Indicador de progresso textual */}
            <span className="text-sm text-muted-foreground tabular-nums">
              {currentStep + 1} de {totalSteps}
            </span>

            {/* Botão Próximo / Começar */}
            <Button
              size="lg"
              onClick={nextStep}
              className={cn(
                "gap-1 min-w-[120px]",
                isLastStep && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão Reiniciar (visível quando onboarding está fechado) */}
      {showRestartButton && !isOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={restart}
          className="fixed bottom-4 right-4 z-50 gap-1.5 shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Ver Tour Novamente
        </Button>
      )}
    </>
  )
}

// ============================================
// CONTEÚDO PADRÃO PARA CADA ETAPA
// ============================================

function DefaultStepContent({ stepIndex }: { stepIndex: number }) {
  const steps = [
    // Passo 1: Criar Treino
    {
      title: "Crie seu primeiro treino",
      features: [
        "Escolha entre diversos tipos de exercícios",
        "Defina séries, repetições e cargas",
        "Personalize para seus objetivos",
      ],
      icon: <Dumbbell className="h-12 w-12 text-blue-500" />,
      color: "bg-blue-500/10 border-blue-500/20",
    },
    // Passo 2: Executar
    {
      title: "Execute com acompanhamento",
      features: [
        "Timer integrado para descanso",
        "Registro automático de séries",
        "Feedback em tempo real",
      ],
      icon: <PlayCircle className="h-12 w-12 text-green-500" />,
      color: "bg-green-500/10 border-green-500/20",
    },
    // Passo 3: Histórico
    {
      title: "Acompanhe sua evolução",
      features: [
        "Gráficos de progresso detalhados",
        "Histórico completo de treinos",
        "Métricas de performance",
      ],
      icon: <BarChart3 className="h-12 w-12 text-purple-500" />,
      color: "bg-purple-500/10 border-purple-500/20",
    },
  ]

  const current = steps[stepIndex]

  if (!current) return null

  return (
    <div className={cn("rounded-xl border p-6", current.color)}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Ícone grande */}
        <div className="shrink-0">
          {current.icon}
        </div>

        {/* Lista de features */}
        <ul className="space-y-3 flex-1">
          {current.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE SIMPLIFICADO (para embed direto)
// ============================================

interface EmbeddedOnboardingProps {
  steps: Array<{
    id: string
    title: string
    description: string
    icon?: React.ReactNode
    content?: React.ReactNode
  }>
  onComplete?: () => void
  onSkip?: () => void
  className?: string
}

/**
 * Versão embedded que pode ser usada sem Provider.
 * Útil para casos simples ou testes rápidos.
 */
export function EmbeddedOnboarding({ 
  steps, 
  onComplete, 
  onSkip,
  className 
}: EmbeddedOnboardingProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const nextStep = () => {
    if (isLastStep) {
      setIsOpen(false)
      onComplete?.()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skip = () => {
    setIsOpen(false)
    onSkip?.()
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <CardContent className="pt-6 pb-4">
        <div className="text-center space-y-4">
          {/* Ícone */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            {step?.icon || <Sparkles className="h-7 w-7 text-primary" />}
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{step?.title}</h3>
            <p className="text-sm text-muted-foreground">{step?.description}</p>
          </div>

          {/* Conteúdo Customizado */}
          {step?.content && (
            <div className="rounded-lg bg-muted/50 p-4 text-left">
              {step.content}
            </div>
          )}

          {/* Indicador de passos */}
          <div className="flex justify-center gap-1.5 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>

      {/* Navegação */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={skip}
          className="text-muted-foreground"
        >
          Pular
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={nextStep}
            className={cn(isLastStep && "bg-green-600 hover:bg-green-700")}
          >
            {isLastStep ? "Começar!" : "Próximo"}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Exportar barrel
export default OnboardingModal
