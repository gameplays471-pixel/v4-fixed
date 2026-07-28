'use client'

import { useState } from 'react'
import { 
  OnboardingProvider, 
  OnboardingModal, 
  type OnboardingStep 
} from '@/components/onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  Dumbbell, 
  PlayCircle, 
  BarChart3, 
  CheckCircle2,
  LogOut,
  BookOpen,
  ArrowRight
} from 'lucide-react'

// ============================================
// ETAPAS DO TUTORIAL (Onboarding)
// ============================================

const TUTORIAL_STEPS: OnboardingStep[] = [
  {
    id: 'bem-vindo',
    title: 'Bem-vindo ao App!',
    description: 'Vamos fazer um tour rápido pelas principais funcionalidades do sistema.',
    icon: <Sparkles className="h-8 w-8 text-blue-600" />,
    color: '#3b82f6',
    content: (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">
          Este guia vai te ajudar a conhecer todas as funcionalidades em menos de 1 minuto!
        </p>
      </div>
    ),
  },
  {
    id: 'criar-treino',
    title: 'Crie seus Treinos',
    description: 'Personalize exercícios, séries e repetições de forma simples e intuitiva.',
    icon: <Dumbbell className="h-8 w-8 text-emerald-600" />,
    color: '#10b981',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Dumbbell, label: 'Força', desc: 'Musculação', color: 'text-red-500 bg-red-50 dark:bg-red-950' },
            { icon: PlayCircle, label: 'Cardio', desc: 'Aeróbico', color: 'text-green-500 bg-green-50 dark:bg-green-950' },
            { icon: Sparkles, label: 'Flexibilidade', desc: 'Alongamento', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg p-3 text-center ${item.color}`}>
              <item.icon className="h-6 w-6 mx-auto mb-1" />
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs opacity-70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'executar',
    title: 'Execute com Timer',
    description: 'Acompanhe seu treino com timer integrado e registro automático.',
    icon: <PlayCircle className="h-8 w-8 text-orange-600" />,
    color: '#f97316',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white text-center">
          <p className="text-sm opacity-80 mb-2">Tempo de descanso</p>
          <p className="text-5xl font-mono font-bold">00:45</p>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> 3/4 séries</span>
          <span className="flex items-center gap-1">12 reps</span>
        </div>
      </div>
    ),
  },
  {
    id: 'historico',
    title: 'Acompanhe seu Progresso',
    description: 'Veja gráficos de evolução e mantenha-se motivado.',
    icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
    color: '#a855f7',
    content: (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-xl p-4 border">
          <div className="flex justify-between items-end h-20 gap-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => {
              const heights = [40, 65, 45, 80, 70, 90]
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-violet-400 rounded-t-md"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{day}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex justify-around text-center">
          {[
            { value: '12', label: 'Treinos' },
            { value: '89%', label: 'Conclusão' },
            { value: '+15%', label: 'Progresso' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

// ============================================
// TELA DE LOGIN
// ============================================

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simula login
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Dumbbell className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
            <CardDescription>
              Faça login para acessar sua conta
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Digite qualquer e-mail e senha para testar o tutorial
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// TELA PRINCIPAL (Após Login)
// ============================================

function Dashboard({ onLogout, showTutorial }: { onLogout: () => void; showTutorial: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">MeuApp</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={showTutorial}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Ver Tutorial
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Saudação */}
          <div className="text-center space-y-3 py-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Olá, Usuário! 👋
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Bem-vindo ao sistema. Clique em &quot;Ver Tutorial&quot; para conhecer as funcionalidades.
            </p>
          </div>

          {/* Cards de Ação Rápida */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  Treinos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Crie e gerencie seus treinos personalizados
                </p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  Executar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Execute treinos com timer integrado
                </p>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acompanhe sua evolução e resultados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dica */}
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Dica:</p>
                  <p className="text-sm text-muted-foreground">
                    É seu primeiro acesso? O tutorial guiado aparece automaticamente para novos usuários. 
                    Você pode revisá-lo a qualquer momento clicando no botão &quot;Ver Tutorial&quot;.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 MeuApp • Sistema com Tutorial Interativo
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)

  const handleLogin = () => {
    setIsLoggedIn(true)
    // Mostra onboarding apenas para novos usuários
    if (isNewUser) {
      setShowOnboarding(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowOnboarding(false)
  }

  const handleShowTutorial = () => {
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setIsNewUser(false) // Marca como usuário que já viu o tutorial
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setIsNewUser(false)
  }

  // Tela de Login (se não está logado)
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Dashboard com Onboarding
  return (
    <OnboardingProvider
      steps={TUTORIAL_STEPS}
      storageKey="app-tutorial"
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
    >
      <Dashboard onLogout={handleLogout} showTutorial={handleShowTutorial} />
      
      {/* Modal do Tutorial - aparece após login de novo usuário ou quando solicitado */}
      <OnboardingModal showRestartButton />
    </OnboardingProvider>
  )
}
