"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy, FileText, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { ShareWorkoutCard, SHARE_CARD_SIZE, type ShareFormat } from "@/components/share-workout-card";
import { nodeToPngBlob, shareOrDownloadImage, copyImageToClipboard, downloadBlob, buildWorkoutPdf } from "@/lib/share-export";
import type { WorkoutSummaryData } from "@/lib/store";

interface ShareWorkoutDialogProps {
  data: WorkoutSummaryData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Largura de exibição do preview dentro do dialog — o card em si sempre é
// renderizado no tamanho real (540px) para a captura sair nítida; aqui só
// escalamos visualmente com CSS transform.
const PREVIEW_WIDTH = 220;

export function ShareWorkoutDialog({ data, open, onOpenChange }: ShareWorkoutDialogProps) {
  const [format, setFormat] = useState<ShareFormat>("story");
  const [busy, setBusy] = useState<"share" | "download" | "copy" | "pdf" | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { width, height } = SHARE_CARD_SIZE[format];
  const scale = PREVIEW_WIDTH / width;

  const getPngBlob = async () => {
    if (!cardRef.current) throw new Error("Card não renderizado");
    return nodeToPngBlob(cardRef.current);
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const blob = await getPngBlob();
      const result = await shareOrDownloadImage(blob, data.workoutName, {
        title: "Meu treino no GEMgym",
        text: `Concluí o treino "${data.workoutName}" 💪`,
      });
      if (result === "downloaded") {
        toast.success("Imagem baixada! Agora é só anexar no WhatsApp ou Instagram.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    setBusy("download");
    try {
      const blob = await getPngBlob();
      downloadBlob(blob, `treino-${format}.png`);
      toast.success("Imagem baixada!");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    setBusy("copy");
    try {
      const blob = await getPngBlob();
      const ok = await copyImageToClipboard(blob);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } else {
        toast.error("Seu navegador não suporta copiar imagens — use baixar.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível copiar a imagem");
    } finally {
      setBusy(null);
    }
  };

  const handlePdf = async () => {
    setBusy("pdf");
    try {
      const blob = await buildWorkoutPdf(data);
      downloadBlob(blob, `treino-${data.workoutName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("PDF gerado!");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Compartilhar treino
          </DialogTitle>
        </DialogHeader>

        {/* Alternância de formato */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border/50">
          {(["story", "square"] as ShareFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 h-9 rounded-lg text-xs font-bold transition-colors ${
                format === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              {f === "story" ? "Story (9:16)" : "Post (1:1)"}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex justify-center py-2">
          <div
            style={{ width: width * scale, height: height * scale, overflow: "hidden", borderRadius: 20 }}
            className="shadow-2xl shadow-black/40 border border-white/10"
          >
            <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <ShareWorkoutCard ref={cardRef} data={data} format={format} />
            </div>
          </div>
        </div>

        {/* Ações principais */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            className="h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/25 gap-2"
            onClick={handleShare}
            disabled={busy !== null}
          >
            {busy === "share" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Compartilhar (WhatsApp, Instagram...)
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11 rounded-xl font-semibold gap-2" onClick={handleDownload} disabled={busy !== null}>
              {busy === "download" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Baixar
            </Button>
            <Button variant="outline" className="h-11 rounded-xl font-semibold gap-2" onClick={handleCopy} disabled={busy !== null}>
              {busy === "copy" ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>

          <Button variant="ghost" className="h-11 rounded-xl font-semibold gap-2 text-muted-foreground" onClick={handlePdf} disabled={busy !== null}>
            {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Exportar relatório em PDF
          </Button>
        </div>

        <p className="text-[11px] text-center text-muted-foreground -mt-1">
          Dica: no celular, &quot;Compartilhar&quot; abre direto o menu para postar no Story do WhatsApp ou Instagram.
        </p>
      </DialogContent>
    </Dialog>
  );
}
