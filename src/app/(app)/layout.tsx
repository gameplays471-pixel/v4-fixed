"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { AuthScreen } from "@/components/auth-screen";
import { Sidebar } from "@/components/sidebar";
import { getToken, setToken, apiPost } from "@/lib/api";
import { LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PENDING_CLONE_KEY } from "@/app/w/[slug]/clone-workout-button";

const USER_CACHE_KEY = "gemgym:user-cache";

function getCachedUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCachedUser(u: AppUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

type AppUser = { name: string; email: string; role?: string };

function MobileTopbar({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu ao trocar de rota
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="GEMgym" width={32} height={32} priority className="w-8 h-8 rounded-xl object-cover ring-1 ring-primary/20 shadow-md shadow-primary/20" />
            <span className="font-black text-base tracking-tight">GEMgym</span>
          </Link>

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
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                Meu perfil
              </Link>
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
const BodyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const bottomNavItems = [
  { href: "/", label: "Início", icon: <HomeIcon /> },
  { href: "/treinos", label: "Treinos", icon: <DumbbellIcon />, matchPrefix: true },
  { href: "/biblioteca", label: "Exercícios", icon: <BookIcon /> },
  { href: "/historico", label: "Histórico", icon: <HistoryIcon /> },
  { href: "/stats", label: "Stats", icon: <ChartIcon /> },
  { href: "/corpo", label: "Corpo", icon: <BodyIcon /> },
];

function isActivePath(pathname: string, item: (typeof bottomNavItems)[number]) {
  if (item.href === "/") return pathname === "/";
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(item.href + "/");
  return pathname === item.href;
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1">
        {bottomNavItems.map((item) => {
          const active = isActivePath(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeWorkoutId = useAppStore((s) => s.activeWorkoutId);
  const [user, setUser] = useState<AppUser | null>(() => getCachedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch("/api/auth/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setCachedUser(data.user);
        setLoading(false);
        if (!data.user) setToken(null);
      })
      .catch(() => {
        // Se a rede caiu mas temos um token OU cache de usuário,
        // não derrubar — o usuário pode estar no meio de um treino.
        // O token será verificado quando a conexão voltar.
        const cached = getCachedUser();
        if (token || cached) {
          if (cached && !user) setUser(cached);
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se existe um treino em andamento (persistido) e o usuário abriu o app
  // "do zero" na raiz, leva ele direto de volta pro treino em vez do
  // dashboard — preserva o comportamento antigo sem sequestrar navegação
  // para quem já está em outra tela de propósito.
  useEffect(() => {
    if (user && activeWorkoutId && pathname === "/") {
      router.replace(`/treinos/${activeWorkoutId}/ativo`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeWorkoutId, pathname]);

  const handleAuth = (u: unknown, token?: string, rememberMe = true) => {
    if (token) setToken(token, rememberMe);
    setUser(u as AppUser);

    // Se a pessoa veio de um link de treino compartilhado (/w/[slug]) e
    // precisou logar/criar conta pra clonar, a intenção ficou guardada em
    // sessionStorage — concluímos o clone agora que já há um token válido,
    // em vez de mandar ela de volta pro dashboard vazio.
    const pendingSlug = typeof window !== "undefined" ? sessionStorage.getItem(PENDING_CLONE_KEY) : null;
    if (pendingSlug) {
      sessionStorage.removeItem(PENDING_CLONE_KEY);
      apiPost("/api/workouts/clone", { slug: pendingSlug })
        .then(() => {
          toast.success("Treino clonado pra sua conta!");
          router.push("/treinos");
        })
        .catch((e) => {
          console.error("Erro ao clonar treino pendente:", e);
          toast.error("Não foi possível clonar o treino compartilhado.");
          router.push("/");
        });
      return;
    }

    router.push("/");
  };

  const handleLogout = async () => {
    setCachedUser(null);
    await fetch("/api/auth/logout", { method: "POST" });
    setToken(null);
    setUser(null);
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
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}