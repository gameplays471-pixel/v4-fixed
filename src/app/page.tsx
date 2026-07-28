'use client'

import { useState } from 'react'
import { useApiQuery } from '@/hooks/use-react-query'
import { ApiErrorDisplay, QueryContainer } from '@/components/api-error-display'
import { 
  OnboardingProvider, 
  OnboardingModal, 
  type OnboardingStep 
} from '@/components/onboarding'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Users, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertTriangle,
  Bug,
  Dumbbell,
  BarChart3,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface Stats {
  users: number
  sessions: number
  revenue: number
  growth: number
}

interface Activity {
  id: string
  title: string
  type: 'strength' | 'cardio' | 'flexibility'
  duration: number
  status: 'completed' | 'in_progress' | 'pending'
  date: string
}

// ============================================
// ETAPAS DO ONBOARDING (3 telas)
// ============================================

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'create-workout',
    title: 'Crie seu primeiro treino',
    description: 'Personalize seus exercícios com séries, repetições e cargas adaptadas aos seus objetivos.',
    icon: <Dumbbell className="h-8 w-8 text-blue-600" />,
    color: '#3b82f6',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Dumbbell, label: 'Força', desc: 'Musculação', color: 'text-red-500 bg-red-50 dark:bg-red-950' },
            { icon: PlayCircle, label: 'Cardio', desc: 'Aeróbico', color: 'text-green-500 bg-green-50 dark:bg-green-950' },
            { icon: Activity, label: 'Flexibilidade', desc: 'Alongamento', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
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
    id: 'execute-workout',
    title: 'Execute com acompanhamento',
    description: 'Siga seu treino com timer integrado e registro automático de cada série realizada.',
    icon: <PlayCircle className="h-8 w-8 text-green-600" />,
    color: '#22c55e',
    content: (
      <div className="space-y-4">
        {/* Simulação de timer */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
          <p className="text-sm opacity-80 mb-2">Tempo de descanso</p>
          <p className="text-5xl font-mono font-bold">00:45</p>
          <div className="mt-3 flex justify-center gap-2">
            {[10, 30, 60, 90].map((s) => (
              <span key={s} className="px-2 py-0.5 bg-white/20 rounded text-sm">
                {s}s
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> 3/4 séries</span>
          <span className="flex items-center gap-1"><Target className="h-4 w-4" /> 12 reps</span>
        </div>
      </div>
    ),
  },
  {
    id: 'view-history',
    title: 'Acompanhe sua evolução',
    description: 'Veja gráficos de progresso, histórico completo e métricas para atingir suas metas.',
    icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
    color: '#a855f7',
    content: (
      <div className="space-y-4">
        {/* Simulação de gráfico */}
        <div className="bg-muted/50 rounded-xl p-4 border">
          <div className="flex justify-between items-end h-24 gap-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
              const heights = [40, 65, 45, 80, 70, 90, 75]
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-violet-400 rounded-t-md transition-all"
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
            { value: '12', label: 'Treinos', icon: Trophy },
            { value: '89%', label: 'Conclusão', icon: Target },
            { value: '+15%', label: 'Progresso', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
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
// COMPONENTES DE UI AUXILIARES
// ============================================

function StatusBadge({ status }: { status: Activity['status'] }) {
  const variants = {
    completed: 'default',
    in_progress: 'secondary',
    pending: 'outline',
  } as const
  
  const icons = {
    completed: <CheckCircle2 className="h-3 w-3 mr-1" />,
    in_progress: <PlayCircle className="h-3 w-3 mr-1" />,
    pending: <Circle className="h-3 w-3 mr-1" />,
  }
  
  const labels = {
    completed: 'Concluído',
    in_progress: 'Em andamento',
    pending: 'Pendente',
  }

  return (
    <Badge variant={variants[status]} className="gap-1">
      {icons[status]}
      {labels[status]}
    </Badge>
  )
}

function TypeBadge({ type }: { type: Activity['type'] }) {
  const colors = {
    strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cardio: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    flexibility: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }
  
  const labels = {
    strength: 'Força',
    cardio: 'Cardio',
    flexibility: 'Flexibilidade',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[type]}`}>
      {labels[type]}
    </span>
  )
}

// ============================================
// SEÇÃO DE ESTATÍSTICAS (com useApiQuery)
// ============================================

function StatsSection() {
  const query = useApiQuery<Stats>('/api/demo?type=stats', ['demo', 'stats'], {
    errorMessage: 'Não foi possível carregar as estatísticas do dashboard.',
    staleTime: 30_000,
  })

  return (
    <QueryContainer
      query={query}
      errorProps={{ title: 'Erro nas Estatísticas', variant: 'inline' }}
    >
      {(stats, isRefreshing) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Estatísticas</h2>
              <p className="text-muted-foreground">Visão geral do dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Atualizando...
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Usuários', value: stats.users.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
              { title: 'Sessões', value: stats.sessions.toLocaleString(), icon: Activity, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
              { title: 'Receita', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900' },
              { title: 'Crescimento', value: `${stats.growth}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900' },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isRefreshing ? 'opacity-70' : ''}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isRefreshing && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              ✓ Dados carregados • Cache ativo por 30s
            </p>
          )}
        </div>
      )}
    </QueryContainer>
  )
}

// ============================================
// SEÇÃO DE ATIVIDADES (com useApiQuery)
// ============================================

function ActivitiesSection() {
  const query = useApiQuery<Activity[]>('/api/demo?type=activities', ['demo', 'activities'], {
    errorMessage: 'Falha ao carregar atividades. Tente novamente mais tarde.',
    staleTime: 60_000,
  })

  return (
    <QueryContainer
      query={query}
      loadingComponent={
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      {(activities, isRefreshing) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Atividades</h2>
              <p className="text-muted-foreground">Seus treinos e exercícios</p>
            </div>
            {isRefreshing && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className={`grid gap-3 ${isRefreshing ? 'opacity-70' : ''}`}>
            {activities.map((activity) => (
              <Card key={activity.id} className="transition-colors hover:bg-muted/50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">{activity.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.duration} min
                        <TypeBadge type={activity.type} />
                      </div>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isRefreshing && (
            <p className="text-xs text-muted-foreground">
              ✓ {activities.length} atividades • Cache ativo por 1min
            </p>
          )}
        </div>
      )}
    </QueryContainer>
  )
}

// ============================================
// SEÇÃO DE DEMO DE ERROS
// ============================================

const ERROR_DEMOS = [
  { type: '400', label: 'Bad Request', description: 'Requisição inválida' },
  { type: '401', label: 'Unauthorized', description: 'Não autenticado' },
  { type: '403', label: 'Forbidden', description: 'Sem permissão' },
  { type: '404', label: 'Not Found', description: 'Recurso não existe' },
  { type: '500', label: 'Server Error', description: 'Erro interno' },
  { type: '503', label: 'Service Unavailable', description: 'Serviço indisponível' },
]

function ErrorDemoSection() {
  const [selectedError, setSelectedError] = useState<string | null>(null)

  const query = useApiQuery<never>(
    selectedError ? `/api/demo?type=error&errorType=${selectedError}` : null,
    ['demo', 'error', selectedError || 'none'],
    {
      showErrorToast: true,
      retry: false,
    }
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bug className="h-6 w-6" />
          Demo de Tratamento de Erro
        </h2>
        <p className="text-muted-foreground">
          Teste como os erros são exibidos de forma padronizada
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ERROR_DEMOS.map((demo) => (
          <Button
            key={demo.type}
            variant={selectedError === demo.type ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setSelectedError(demo.type)}
          >
            {demo.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedError(null)}
        >
          Limpar
        </Button>
      </div>

      {query.isError && query.error && (
        <ApiErrorDisplay
          error={query.error}
          onRetry={() => query.retry()}
          isRetrying={query.isFetching}
          variant="full"
        />
      )}

      {!selectedError && !query.isError && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Selecione um tipo de erro acima para testar o tratamento padronizado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// PÁGINA PRINCIPAL (com Onboarding!)
// ============================================

export default function Home() {
  const [activeTab, setActiveTab] = useState('stats')

  return (
    // Provider envolve toda a aplicação
    <OnboardingProvider
      steps={ONBOARDING_STEPS}
      storageKey="main-tour"
      onComplete={() => console.log('✅ Onboarding completado!')}
      onSkip={() => console.log('⏭️ Onboarding pulado')}
    >
      <div className="min-h-screen flex flex-col">
        {/* Modal do Onboarding - aparece automaticamente no primeiro acesso! */}
        <OnboardingModal showRestartButton />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                🚀 App Demo Completa
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                React Query + Error Handling + <strong>Onboarding</strong>. 
                Tour guiado para novos usuários!
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Onboarding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tour de 3 passos no primeiro login. Clique "Ver Tour Novamente"!
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Erros Padronizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Toast automático + ApiErrorDisplay em toda a aplicação.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Cache Inteligente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    React Query com stale-while-revalidate. Navegação instantânea!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Estatísticas
                </TabsTrigger>
                <TabsTrigger value="activities" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Atividades
                </TabsTrigger>
                <TabsTrigger value="errors" className="gap-2">
                  <Bug className="h-4 w-4" />
                  Erros
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-6">
                <StatsSection />
              </TabsContent>
              
              <TabsContent value="activities" className="mt-6">
                <ActivitiesSection />
              </TabsContent>
              
              <TabsContent value="errors" className="mt-6">
                <ErrorDemoSection />
              </TabsContent>
            </Tabs>

            {/* Instructions */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Como Testar o Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>🎯 Primeiro Acesso:</strong> Limpe o localStorage (F12 → Application → Local Storage → Clear) e recarregue a página.</p>
                <p><strong>🔄 Reiniciar Tour:</strong> Clique no botão flutuante "Ver Tour Novamente" no canto inferior direito.</p>
                <p><strong>📱 3 Etapas:</strong> Criar Treino → Executar → Ver Histórico. Cada uma com conteúdo interativo!</p>
                <p><strong>💾 Persistência:</strong> O estado é salvo no localStorage. Usuário não vê novamente após completar.</p>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                React Query • Error Handling • Onboarding System
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>v1.0.0</span>
                <span>•</span>
                <span>Tour Guiado</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </OnboardingProvider>
  )
}
