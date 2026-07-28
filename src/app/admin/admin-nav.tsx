"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface AdminNavProps {
  user: { name: string; email: string; role: string };
}

const navItems: Array<{ href: string; label: string; enabled: boolean }> = [
  { href: "/admin/exercicios", label: "Exercícios", enabled: true },
  { href: "/admin/usuarios", label: "Usuários", enabled: true },
  { href: "/admin/configuracoes", label: "Configurações", enabled: false },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="flex flex-col w-full h-screen sticky top-0">
      <div className="p-5 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="GEMgym" width={32} height={32} className="w-8 h-8 rounded-xl object-cover ring-1 ring-primary/25" />
          <div className="flex flex-col leading-tight">
            <span className="font-black text-sm tracking-tight">GEMgym</span>
            <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-primary/80">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                title="Em breve"
              >
                <span>{item.label}</span>
                <span className="text-[9px] font-mono uppercase tracking-wide border border-border/60 rounded px-1.5 py-0.5">
                  em breve
                </span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/60 space-y-2">
        <a
          href="/"
          className="block px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          ← Voltar ao app
        </a>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-black text-xs shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sair"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
