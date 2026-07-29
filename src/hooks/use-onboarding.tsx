'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

// ============================================
// TIPOS
// ============================================

export interface OnboardingStep {
  id: string
  title: string
  description: string
  /** Ícone ou emoji para representar a etapa */
  icon?: React.ReactNode
  /** Componente customizado para renderizar conteúdo da etapa */
  content?: React.ReactNode
  /** Cor principal da etapa (para indicador visual) */
  color?: string
  /** Imagem/ilustração opcional */
  image?: string | React.ReactNode
}

interface OnboardingContextType {
  /** Se o onboarding está visível */
  isOpen: boolean
  /** Etapa atual (0-indexed) */
  currentStep: number
  /** Total de etapas */
  totalSteps: number
  /** Avançar para próxima etapa */
  nextStep: () => void
  /** Voltar para etapa anterior */
  prevStep: () => void
  /** Ir para uma etapa específica */
  goToStep: (step: number) => void
  /** Pular/fechar o onboarding */
  skip: () => void
  /** Completar o onboarding */
  complete: () => void
  /** Reiniciar o onboarding (útil para debug) */
  restart: () => void
  /** Etapa atual */
  step: OnboardingStep | null
  /** Se é a primeira etapa */
  isFirstStep: boolean
  /** Se é a última etapa */
  isLastStep: boolean
}

// ============================================
// CONTEXT
// ============================================

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding deve ser usado dentro de um OnboardingProvider')
  }
  return context
}

// ============================================
// STORAGE KEY
// ============================================

const ONBOARDING_STORAGE_KEY = 'onboarding_completed'
const ONBOARDING_STEP_KEY = 'onboarding_current_step'

// ============================================
// PROVIDER
// ============================================

interface OnboardingProviderProps {
  children: React.ReactNode
  steps: OnboardingStep[]
  /** Chave única para identificar este onboarding (permite múltiplos tours) */
  storageKey?: string
  /** Forçar mostrar o onboarding mesmo se já completado (útil para debug) */
  forceShow?: boolean
  /** Callback quando onboarding é completado */
  onComplete?: () => void
  /** Callback quando onboarding é pulado */
  onSkip?: () => void
}

export function OnboardingProvider({
  children,
  steps,
  storageKey = 'default',
  forceShow = false,
  onComplete,
  onSkip,
}: OnboardingProviderProps) {
  const getStorageKey = (key: string) => `${ONBOARDING_STORAGE_KEY}_${storageKey}`
  
  // Lazy initialization - lê do localStorage na primeira renderização
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const completed = localStorage.getItem(getStorageKey(storageKey))
    return forceShow || !completed
  })

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 0
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY)
    if (savedStep) {
      return Math.min(parseInt(savedStep, 10), steps.length - 1)
    }
    return 0
  })

  // Salva etapa atual quando muda
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(ONBOARDING_STEP_KEY, currentStep.toString())
    }
  }, [currentStep, isOpen])

  // Declara complete primeiro (usado por nextStep)
  const complete = useCallback(() => {
    localStorage.setItem(getStorageKey(storageKey), 'true')
    localStorage.removeItem(ONBOARDING_STEP_KEY)
    setIsOpen(false)
    onComplete?.()
  }, [storageKey, onComplete, getStorageKey])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      complete()
    }
  }, [currentStep, steps.length, complete])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }, [steps.length])

  const skip = useCallback(() => {
    localStorage.setItem(getStorageKey(storageKey), 'skipped')
    localStorage.removeItem(ONBOARDING_STEP_KEY)
    setIsOpen(false)
    onSkip?.()
  }, [storageKey, onSkip, getStorageKey])

  const restart = useCallback(() => {
    localStorage.removeItem(getStorageKey(storageKey))
    localStorage.removeItem(ONBOARDING_STEP_KEY)
    setCurrentStep(0)
    setIsOpen(true)
  }, [storageKey, getStorageKey])

  const value: OnboardingContextType = {
    isOpen,
    currentStep,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    goToStep,
    skip,
    complete,
    restart,
    step: steps[currentStep] || null,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

// ============================================
// HOOKS AUXILIARES
// ============================================

/** Verifica se o onboarding foi completado */
export function useOnboardingStatus(storageKey: string = 'default'): {
  isCompleted: boolean
  isSkipped: boolean
  reset: () => void
} {
  const getStorageKey = (key: string) => `${ONBOARDING_STORAGE_KEY}_${key}`
  
  const getStatus = useCallback(() => {
    const status = localStorage.getItem(getStorageKey(storageKey))
    return {
      isCompleted: status === 'true',
      isSkipped: status === 'skipped',
    }
  }, [storageKey, getStorageKey])

  const reset = useCallback(() => {
    localStorage.removeItem(getStorageKey(storageKey))
  }, [storageKey, getStorageKey])

  return { ...getStatus(), reset }
}
