"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { AuthScreen } from "@/components/auth-screen";
import { Sidebar } from "@/components/sidebar";
import { DashboardView } from "@/components/views/dashboard";
import { LibraryView } from "@/components/views/library";
import { WorkoutsView } from "@/components/views/workouts";
import { WorkoutSummaryView } from "@/components/views/workout-summary";
import { ActiveWorkoutView } from "@/components/views/active-workout";
import { HistoryView } from "@/components/views/history";
import { StatsView } from "@/components/views/stats";
import { ProfileView } from "@/components/views/profile";
import { getToken, setToken } from "@/lib/api";
import { LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AppUser = { name: string; email: string };

function MobileTopbar({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const setView = useAppStore((s) => s.setView);
  const view = useAppStore((s) => s.view);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on view change
  useEffect(() => { setMenuOpen(false); }, [view]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <button className="flex items-center gap-2.5" onClick={() => setView("dashboard")}>
            <img src="/logo.png" alt="GEMgym" className="w-8 h-8 rounded-xl object-cover ring-1 ring-primary/20 shadow-md shadow-primary/20" />
            <span className="font-black text-base tracking-tight">GEMgym</span>
          </button>

          {/* Avatar / menu */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-sm shadow-md shadow-primary/25 active:scale-95 transition-transform"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="md:hidden fixed top-16 right-3 z-50 w-56 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
            >
              <div className="p-3 border-b border-border/50">
                <p className="font-bold text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); setView("profile"); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                Meu perfil
              </button>
              <button
                onClick={() => { setMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileBottomNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  const navItems = [
    { key: "dashboard" as const, label: "Início", icon: <HomeIcon /> },
    { key: "workouts" as const, label: "Treinos", icon: <DumbbellIcon /> },
    { key: "library" as const, label: "Exercícios", icon: <BookIcon /> },
    { key: "history" as const, label: "Histórico", icon: <HistoryIcon /> },
    { key: "stats" as const, label: "Stats", icon: <ChartIcon /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label={item.label}
            >
              <motion.div
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`w-6 h-6 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.icon}
              </motion.div>
              <span className={`text-[10px] font-semibold leading-none transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Home() {
  const view = useAppStore((s) => s.view);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch("/api/auth/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
        if (!data.user) {
          setToken(null);
          useAppStore.getState().setView("auth");
        } else {
          if (useAppStore.getState().activeWorkoutId) useAppStore.getState().setView("active-workout");
          else if (useAppStore.getState().view === "auth") useAppStore.getState().setView("dashboard");
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAuth = (u: unknown, token?: string, rememberMe = true) => {
    if (token) setToken(token, rememberMe);
    setUser(u as AppUser);
    useAppStore.getState().setView("dashboard");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setToken(null);
    setUser(null);
    useAppStore.getState().setView("auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-border/60 bg-sidebar">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      <main className="flex-1 min-w-0 flex flex-col">
        <MobileTopbar user={user} onLogout={handleLogout} />

        <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="container max-w-5xl mx-auto px-4 py-6 md:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {view === "dashboard" && <DashboardView />}
                {view === "library" && <LibraryView />}
                {view === "workouts" && <WorkoutsView />}
                {view === "active-workout" && <ActiveWorkoutView />}
                {view === "workout-summary" && <WorkoutSummaryView />}
                {view === "history" && <HistoryView />}
                {view === "stats" && <StatsView />}
                {view === "profile" && <ProfileView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}

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
