"use client";

import { useAppStore, type ViewKey } from "@/lib/store";
import { LogOut, User } from "lucide-react";

interface SidebarProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const navItems: Array<{ key: ViewKey; label: string; icon: React.ReactNode }> = [
  {
    key: "dashboard",
    label: "Início",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    key: "workouts",
    label: "Treinos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14.4 14.4 9.6 9.6M18.5 18.5l4-4-4-4M5.5 5.5l-4 4 4 4M2 18.5l4 4M22 5.5l-4-4" />
        <path d="M6.5 6.5 17.5 17.5M9.6 9.6c-1 1.7-2.4 3-4.1 4M14.4 14.4c1 1.7 2.4 3 4.1 4" />
      </svg>
    ),
  },
  {
    key: "library",
    label: "Exercícios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "Histórico",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    key: "stats",
    label: "Estatísticas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 3v18h18M7 16l4-8 4 4 6-9" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Perfil",
    icon: <User className="w-5 h-5" />,
  },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout();
  };

  return (
    <div className="flex flex-col w-full h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">H</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight">Hevy Web</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Treinos & Hipertrofia</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              view === item.key
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer" onClick={() => setView("profile")}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );
}
