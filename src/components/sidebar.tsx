"use client";

import { useAppStore, type ViewKey } from "@/lib/store";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const navItems: Array<{ key: ViewKey; label: string; emoji: string; icon: React.ReactNode }> = [
  {
    key: "dashboard", label: "Início", emoji: "🏠",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" /></svg>,
  },
  {
    key: "workouts", label: "Treinos", emoji: "🏋️",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M6.5 6.5l11 11M18.5 18.5l4-4-4-4M5.5 5.5l-4 4 4 4M2 18.5l4 4M22 5.5l-4-4" /></svg>,
  },
  {
    key: "library", label: "Exercícios", emoji: "📚",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" /></svg>,
  },
  {
    key: "history", label: "Histórico", emoji: "📅",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2" /></svg>,
  },
  {
    key: "stats", label: "Estatísticas", emoji: "📊",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M3 3v18h18M7 16l4-8 4 4 6-9" /></svg>,
  },
  {
    key: "profile", label: "Perfil", emoji: "👤",
    icon: <User className="w-4.5 h-4.5" />,
  },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="flex flex-col w-full h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/logo.png" alt="GEMgym"
              className="w-10 h-10 rounded-2xl object-cover shadow-lg ring-1 ring-primary/25 animate-glow" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg leading-tight tracking-tight">GEMgym</span>
            <span className="text-[10px] text-muted-foreground leading-tight font-medium tracking-wide uppercase">Treinos & Hipertrofia</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/60 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className={`shrink-0 transition-transform group-hover:scale-110 ${active ? "" : ""}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/60 mt-3" />

      {/* User footer */}
      <div className="p-3 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/60 transition-all group text-left"
          onClick={() => setView("profile")}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-black text-sm shrink-0 shadow-md transition-transform group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.70 0.20 200))", boxShadow: "0 2px 8px oklch(0.80 0.18 162 / 0.30)" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group"
        >
          <LogOut className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-0.5" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
