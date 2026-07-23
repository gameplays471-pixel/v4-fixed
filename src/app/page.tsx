"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { AuthScreen } from "@/components/auth-screen";
import { Sidebar } from "@/components/sidebar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getToken, setToken } from "@/lib/api";

// Lazy loading com named exports requer .then(m => ({ default: m.ComponentName }))
const DashboardView = lazy(() => import("@/components/views/dashboard").then((m) => ({ default: m.DashboardView })));
const LibraryView = lazy(() => import("@/components/views/library").then((m) => ({ default: m.LibraryView })));
const WorkoutsView = lazy(() => import("@/components/views/workouts").then((m) => ({ default: m.WorkoutsView })));
const WorkoutSummaryView = lazy(() => import("@/components/views/workout-summary").then((m) => ({ default: m.WorkoutSummaryView })));
const ActiveWorkoutView = lazy(() => import("@/components/views/active-workout").then((m) => ({ default: m.ActiveWorkoutView })));
const HistoryView = lazy(() => import("@/components/views/history").then((m) => ({ default: m.HistoryView })));
const StatsView = lazy(() => import("@/components/views/stats").then((m) => ({ default: m.StatsView })));
const ProfileView = lazy(() => import("@/components/views/profile").then((m) => ({ default: m.ProfileView })));

function MobileTopbar() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  const navItems = [
    { key: "dashboard", label: "Início", icon: <HomeIcon /> },
    { key: "workouts", label: "Treinos", icon: <DumbbellIcon /> },
    { key: "library", label: "Exercícios", icon: <BookIcon /> },
    { key: "history", label: "Histórico", icon: <HistoryIcon /> },
    { key: "stats", label: "Stats", icon: <ChartIcon /> },
  ];

  return (
    <header className="md:hidden sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 h-14 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="GEMgym" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-base">GEMgym</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">Treinos</span>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  const navItems = [
    { key: "dashboard", label: "Início", icon: <HomeIcon /> },
    { key: "workouts", label: "Treinos", icon: <DumbbellIcon /> },
    { key: "library", label: "Exercícios", icon: <BookIcon /> },
    { key: "history", label: "Histórico", icon: <HistoryIcon /> },
    { key: "stats", label: "Stats", icon: <ChartIcon /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-area-bottom">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
              view === item.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={item.label}
          >
            <div className="w-6 h-6 transition-transform duration-200 group-hover:scale-110">{item.icon}</div>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Loading fallback para lazy loaded views
function ViewLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-fade-in p-4">
          <LoadingSkeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingSkeleton className="h-48 w-full rounded-xl" />
            <LoadingSkeleton className="h-48 w-full rounded-xl" />
          </div>
          <LoadingSkeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function Home() {
  const view = useAppStore((s) => s.view);
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão: usa Bearer token (se houver) + cookie fallback no servidor
    const token = getToken();
    fetch("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
        if (!data.user) {
          setToken(null);
          useAppStore.getState().setView("auth");
        } else {
          // Se havia um treino em andamento (salvo no localStorage), volta
          // direto pra tela dele em vez do dashboard — evita perder o treino
          // ao recarregar a página.
          if (useAppStore.getState().activeWorkoutId) {
            useAppStore.getState().setView("active-workout");
          } else if (useAppStore.getState().view === "auth") {
            useAppStore.getState().setView("dashboard");
          }
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAuth = (u: unknown, token?: string, rememberMe: boolean = true) => {
    if (token) setToken(token, rememberMe);
    setUser(u);
    useAppStore.getState().setView("dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    useAppStore.getState().setView("auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-border bg-sidebar transition-all duration-300">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar mobile */}
        <MobileTopbar />

        <div className="flex-1 overflow-y-auto pb-24 md:pb-8 scroll-smooth">
          <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
            <ViewLoader>
              {view === "dashboard" && <DashboardView />}
              {view === "library" && <LibraryView />}
              {view === "workouts" && <WorkoutsView />}
              {view === "active-workout" && <ActiveWorkoutView />}
              {view === "workout-summary" && <WorkoutSummaryView />}
              {view === "history" && <HistoryView />}
              {view === "stats" && <StatsView />}
              {view === "profile" && <ProfileView />}
            </ViewLoader>
          </div>
        </div>
      </main>

      {/* Bottom nav mobile */}
      <MobileBottomNav />
    </div>
  );
}

// Ícones da navegação
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" />
  </svg>
);

const DumbbellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M6.5 6.5l-2.5-2.5M17.5 17.5l2.5 2.5M3 21l4-4M21 3l-4 4" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M3 3v18h18M7 16l4-8 4 4 6-9" />
  </svg>
);
