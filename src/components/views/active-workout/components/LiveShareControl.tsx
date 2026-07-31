import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Radio, Copy, Check, Loader2, Square } from "lucide-react";
import { toast } from "sonner";

interface LiveShareControlProps {
  sharing: boolean;
  slug: string | null;
  loading: boolean;
  onStart: () => Promise<string | null>;
  onStop: () => void;
}

export function LiveShareControl({ sharing, slug, loading, onStart, onStop }: LiveShareControlProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (!sharing) {
      const ok = await onStart();
      if (!ok) return;
    }
    setOpen(true);
  };

  const handleStop = () => {
    onStop();
    setOpen(false);
    toast.info("Transmissão ao vivo encerrada.");
  };

  const link = slug && typeof window !== "undefined" ? `${window.location.origin}/l/${slug}` : null;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar — selecione e copie manualmente.");
    }
  };

  return (
    <>
      <Button
        variant={sharing ? "default" : "ghost"}
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className={`h-9 rounded-xl gap-1.5 px-3 shrink-0 ${sharing ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/25" : "text-muted-foreground"}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Radio className={`w-3.5 h-3.5 ${sharing ? "animate-pulse" : ""}`} />
        )}
        <span className="text-xs font-bold hidden sm:inline">{sharing ? "AO VIVO" : "Transmitir"}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              Transmissão ao vivo
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Quem tiver este link vê seu progresso em tempo real — exercício atual, séries concluídas e tempo decorrido — sem precisar de login. Ninguém vê nada até você compartilhar, e o link para de funcionar assim que você encerrar a transmissão ou finalizar o treino.
          </p>

          {link ? (
            <div className="flex items-center gap-2">
              <Input value={link} readOnly onFocus={(e) => e.target.select()} className="h-11 text-sm" />
              <Button type="button" onClick={handleCopy} className="h-11 w-11 shrink-0 rounded-xl p-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-destructive">Não foi possível gerar o link agora.</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleStop}
            className="w-full h-11 rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Encerrar transmissão
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
