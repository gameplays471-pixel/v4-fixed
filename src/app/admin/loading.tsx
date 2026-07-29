import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Skeleton do painel admin. Cobrindo o segmento /admin inteiro, então
// pega tanto /admin/exercicios quanto /admin/usuarios (que têm o mesmo
// formato de "tabela com filtros"). Reflete a estrutura típica: barra
// de busca + filtros no topo, e linhas da tabela com avatar/nome/badge.

export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-fade-in">
      <LoadingSkeleton className="h-11 rounded-xl" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-10 w-40 rounded-md" />
        <LoadingSkeleton className="h-10 w-40 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className="h-14 rounded-xl border border-border/60"
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );
}
