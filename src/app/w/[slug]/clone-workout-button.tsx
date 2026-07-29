"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getToken, apiPost } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

// Chave usada pra "lembrar" que o usuário queria clonar um treino enquanto
// ele ainda não tinha conta/login — consumida por (app)/layout.tsx logo
// após um login ou cadastro bem-sucedido (ver handleAuth lá).
export const PENDING_CLONE_KEY = "gemgym:pending-clone-slug";

interface CloneWorkoutButtonProps {
  slug: string;
  workoutName: string;
}

export function CloneWorkoutButton({ slug, workoutName }: CloneWorkoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    // Sem login: guarda a intenção e manda pra tela de entrada — o clone
    // de verdade acontece automaticamente assim que a pessoa autenticar
    // (não precisamos de uma rota de login dedicada com "?redirect=").
    if (!getToken()) {
      sessionStorage.setItem(PENDING_CLONE_KEY, slug);
      toast.info("Entre ou crie uma conta pra clonar este treino.");
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      await apiPost<{ workout: { id: string } }>("/api/workouts/clone", { slug });
      toast.success(`"${workoutName}" clonado pra sua conta!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts });
      router.push("/treinos");
    } catch (e) {
      console.error("Erro ao clonar treino:", e);
      toast.error("Não foi possível clonar este treino.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClone}
      disabled={loading}
      className="w-full h-12 rounded-xl font-bold text-base bg-primary shadow-lg shadow-primary/25 gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
      {loading ? "Clonando..." : "Clonar treino pra minha conta"}
    </Button>
  );
}
