"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Copy, FileText, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { PlanShareCard, PLAN_CARD_SIZE } from "@/components/plan-share-card";
import { nodeToPngBlob, shareOrDownloadImage, copyImageToClipboard, downloadBlob, buildPlanPdf, type PlanPdfExercise } from "@/lib/share-export";

interface PlanShareDialogProps {
  workoutName: string;
  description: string | null;
  exercises: PlanPdfExercise[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREVIEW_WIDTH = 240;

export function PlanShareDialog({ workoutName, description, exercises, open, onOpenChange }: PlanShareDialogProps) {
  const [busy, setBusy] = useState<"share" | "download" | "copy" | "pdf" | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { width, height } = PLAN_CARD_SIZE;
  const scale = PREVIEW_WIDTH / width;

  const getPngBlob = async () => {
    if (!cardRef.current) throw new Error("Card não renderizado");
    return nodeToPngBlob(cardRef.current);
  };

  const fileBase = `treino-${workoutName.toLowerCase().replace(/\s+/g, "-")}`;

  const handleShare = async () => {
    setBusy("share");
    try {
      const blob = await getPngBlob();
      const result = await shareOrDownloadImage(blob, workoutName, {
        title: "Meu treino no GEMgym",
        text: `Ficha do treino "${workoutName}" 💪`,
      });
      if (result === "downloaded") toast.success("Imagem baixada! Agora é só anexar no WhatsApp ou Instagram.");
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
      downloadBlob(blob, `${fileBase}.png`);
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
      const blob = await buildPlanPdf({ workoutName, description, exercises });
      downloadBlob(blob, `${fileBase}.pdf`);
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
            <FileText className="w-4 h-4 text-primary" />
            Exportar &quot;{workoutName}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <div style={{ width: width * scale, height: height * scale, overflow: "hidden", borderRadius: 20 }} className="shadow-2xl shadow-black/40 border border-white/10">
            <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <PlanShareCard ref={cardRef} workoutName={workoutName} description={description} exercises={exercises} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button className="h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/25 gap-2" onClick={handleShare} disabled={busy !== null}>
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
            Exportar ficha em PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
