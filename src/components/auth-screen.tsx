"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AuthScreenProps {
  onAuth: (user: unknown, token?: string, rememberMe?: boolean) => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login"
        ? { email, password, rememberMe }
        : { email, password, name };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erro ao autenticar"); return; }
      toast.success(mode === "login" ? "Bem-vindo de volta!" : "Conta criada!");
      onAuth(data, data.token, mode === "login" ? rememberMe : true);
    } catch { toast.error("Erro de conexão"); } finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@hevy.com", password: "demo123", rememberMe: true }),
      });
      const data = await res.json();
      if (res.ok) onAuth(data, data.token, true);
      else toast.error(data.error);
    } catch { toast.error("Erro de conexão"); } finally { setLoading(false); }
  };

  return (
    <div
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Glow decorativo de fundo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, oklch(0.80 0.18 162 / 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-sm relative z-10">

        {/* ── Logo ── */}
        <div className="flex flex-col items-center mb-10">
          <div
            style={{
              background: "linear-gradient(135deg, var(--card-bg) 0%, oklch(0.22 0.015 255) 100%)",
              boxShadow: "0 0 0 1px oklch(1 0 0 / 0.12), 0 8px 32px oklch(0.80 0.18 162 / 0.18)",
            }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          >
            <img src="/logo.png" alt="GEMgym" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">GEMgym</h1>
          <p style={{ color: "var(--muted-fg)" }} className="text-sm mt-1.5">
            Treine. Evolua. Supere.
          </p>
        </div>

        {/* ── Card ── */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid oklch(1 0 0 / 0.10)",
            boxShadow: "0 1px 3px oklch(0 0 0 / 0.3), 0 8px 40px oklch(0 0 0 / 0.25)",
          }}
          className="rounded-2xl p-6 space-y-5"
        >

          {/* Tab switcher */}
          <div
            style={{ backgroundColor: "oklch(1 0 0 / 0.05)" }}
            className="flex gap-1 p-1 rounded-xl"
          >
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  backgroundColor: mode === m ? "var(--card-bg)" : "transparent",
                  color: mode === m ? "var(--fg)" : "var(--muted-fg)",
                  boxShadow: mode === m ? "0 1px 4px oklch(0 0 0 / 0.25)" : "none",
                }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name" style={{ color: "var(--fg)" }}>Nome</Label>
                <Input
                  id="auth-name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                  style={{ backgroundColor: "oklch(1 0 0 / 0.04)", borderColor: "oklch(1 0 0 / 0.12)" }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" style={{ color: "var(--fg)" }}>Email</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                style={{ backgroundColor: "oklch(1 0 0 / 0.04)", borderColor: "oklch(1 0 0 / 0.12)" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" style={{ color: "var(--fg)" }}>Senha</Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                style={{ backgroundColor: "oklch(1 0 0 / 0.04)", borderColor: "oklch(1 0 0 / 0.12)" }}
              />
            </div>

            {mode === "login" && (
              <label
                style={{ color: "var(--muted-fg)" }}
                className="flex items-center gap-2.5 text-sm cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--primary)" }}
                />
                Manter conectado
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-fg)",
                boxShadow: "0 4px 16px oklch(0.80 0.18 162 / 0.35)",
                opacity: loading ? 0.7 : 1,
              }}
              className="w-full h-11 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </>
              ) : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: "1px", backgroundColor: "oklch(1 0 0 / 0.08)" }} />
            <span style={{ color: "var(--muted-fg)" }} className="text-xs">ou</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "oklch(1 0 0 / 0.08)" }} />
          </div>

          {/* Demo */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            style={{
              border: "1px solid oklch(1 0 0 / 0.12)",
              color: "var(--fg)",
              backgroundColor: "oklch(1 0 0 / 0.04)",
            }}
            className="w-full h-11 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Entrar com conta demo
          </button>
        </div>

        <p style={{ color: "var(--muted-fg)" }} className="text-center text-xs mt-5">
          Ao continuar, você concorda com os termos de uso.
        </p>
      </div>
    </div>
  );
}
