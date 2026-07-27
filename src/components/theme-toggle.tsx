"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // Evita hydration mismatch — renderiza placeholder com mesmas dimensões
    return <div className="w-10 h-10 rounded-xl bg-muted/60" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all " +
        (isDark
          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          : "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20")
      }
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
    </button>
  );
}
