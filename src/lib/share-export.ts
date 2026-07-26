// Exportação do resumo de treino como imagem compartilhável (PNG, pronta para
// Stories/Status) ou PDF (relatório detalhado). A imagem é gerada a partir de
// um nó DOM real (ver share-workout-card.tsx) usando html-to-image — assim o
// card final usa exatamente o mesmo CSS/SVG já renderizado no app, sem
// duplicar a lógica visual num <canvas> manual.

import type { WorkoutSummaryData } from "@/lib/store";

// ─── Imagem (PNG) ────────────────────────────────────────────────────────────

/**
 * Renderiza o nó em `node` para um PNG em alta resolução (pixelRatio 2, ou
 * seja: um nó de 540×960 vira uma imagem 1080×1920 — tamanho ideal para
 * Stories do Instagram e Status do WhatsApp).
 */
export async function nodeToPngBlob(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  const blob = await toBlob(node, {
    pixelRatio: 2,
    cacheBust: true,
    // Sem isso, html-to-image tenta herdar background do <body> e às vezes
    // deixa cantos transparentes em fundos com border-radius.
    backgroundColor: undefined,
  });
  if (!blob) throw new Error("Falha ao gerar imagem");
  return blob;
}

function fileNameFor(workoutName: string, ext: string) {
  const safe = workoutName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `treino-${safe || "gemgym"}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Adia a revogação: em alguns navegadores (Safari) revogar cedo demais
  // corrompe o download que acabou de começar.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export type ShareImageResult = "shared" | "downloaded" | "copied";

/**
 * Tenta compartilhar a imagem via Web Share API nativa (abre o menu do
 * sistema — WhatsApp, Instagram, Salvar em Fotos, etc). Se o navegador não
 * suportar compartilhamento de arquivos (ex.: a maioria dos desktops), cai
 * para download direto do PNG.
 */
export async function shareOrDownloadImage(
  blob: Blob,
  workoutName: string,
  opts?: { title?: string; text?: string }
): Promise<ShareImageResult> {
  const filename = fileNameFor(workoutName, "png");
  const file = new File([blob], filename, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: opts?.title ?? "Meu treino",
        text: opts?.text,
      });
      return "shared";
    } catch (e) {
      // AbortError = usuário cancelou o menu de compartilhamento — não é
      // um erro real, então nem cai pro fallback de download.
      if (e instanceof DOMException && e.name === "AbortError") return "shared";
      // Qualquer outra falha (raríssima) cai pro download abaixo.
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}

/** Copia a imagem para a área de transferência (útil pra colar direto numa conversa). */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !("ClipboardItem" in window)) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

// ─── PDF (relatório detalhado) ───────────────────────────────────────────────

function fmtVol(v: number) {
  return `${Math.round(v).toLocaleString("pt-BR")} kg`;
}

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
  return `${m}min`;
}

/**
 * Gera um PDF de uma página (ou mais, se necessário) com o relatório
 * completo do treino: cabeçalho, estatísticas, músculos trabalhados e a
 * tabela de séries por exercício. Pensado para guardar/imprimir, diferente
 * da imagem (que é o "cartão" bonito pra compartilhar).
 */
export async function buildWorkoutPdf(data: WorkoutSummaryData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  let y = 56;

  const primary: [number, number, number] = [34, 197, 94]; // #22c55e
  const muted: [number, number, number] = [110, 120, 135];
  const dark: [number, number, number] = [20, 22, 28];

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  };

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primary);
  doc.text("GEMGYM", marginX, y);
  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    new Date(data.finishedAt).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    pageWidth - marginX,
    y,
    { align: "right" }
  );
  y += 28;

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(data.workoutName, marginX, y);
  y += 30;

  // Stats
  const totalSets = data.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const prs = data.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.isPR).length, 0);

  const stats: Array<[string, string]> = [
    ["Duração", fmtDuration(data.durationSec)],
    ["Volume total", fmtVol(data.totalVolume)],
    ["Séries", String(totalSets)],
    ["Novos PRs", String(prs)],
  ];

  const statColWidth = (pageWidth - marginX * 2) / stats.length;
  stats.forEach(([label, value], i) => {
    const x = marginX + i * statColWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...dark);
    doc.text(value, x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), x, y + 14);
  });
  y += 34;

  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 24;

  // Músculos trabalhados
  const primaryMuscles = new Set<string>();
  const secondaryMuscles = new Set<string>();
  for (const ex of data.exercises) {
    if (ex.category === "Cardio") {
      primaryMuscles.add("Cardio");
      continue;
    }
    if (ex.muscleGroup) primaryMuscles.add(ex.muscleGroup);
    if (ex.secondaryMuscles) {
      for (const m of ex.secondaryMuscles.split(",")) {
        const trimmed = m.trim();
        if (trimmed && !primaryMuscles.has(trimmed)) secondaryMuscles.add(trimmed);
      }
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text("Músculos trabalhados", marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  const musclesLine = [...primaryMuscles].join(", ") || "—";
  const musclesLines = doc.splitTextToSize(musclesLine, pageWidth - marginX * 2);
  doc.text(musclesLines, marginX, y);
  y += musclesLines.length * 13 + 20;

  // Séries por exercício
  for (const ex of data.exercises) {
    ensureSpace(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...dark);
    doc.text(ex.name, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(ex.muscleGroup || "", pageWidth - marginX, y, { align: "right" });
    y += 16;

    const isCardio = ex.category === "Cardio";
    doc.setFontSize(9.5);
    for (const set of ex.sets) {
      ensureSpace(16);
      doc.setTextColor(...muted);
      let line: string;
      if (isCardio) {
        const parts: string[] = [];
        if (set.durationSec) parts.push(`${Math.round(set.durationSec / 60)} min`);
        if (set.distanceKm) parts.push(`${set.distanceKm} km`);
        if (set.avgBpm) parts.push(`${set.avgBpm} bpm`);
        if (set.intensity) parts.push(set.intensity);
        line = parts.join("  ·  ");
      } else {
        line = `${set.weight} kg  ×  ${set.reps} reps  =  ${Math.round(set.weight * set.reps)} kg`;
      }
      doc.text(line, marginX + 12, y);
      if (set.isPR) {
        doc.setTextColor(...primary);
        doc.setFont("helvetica", "bold");
        doc.text("PR", pageWidth - marginX, y, { align: "right" });
        doc.setFont("helvetica", "normal");
      }
      y += 14;
    }
    y += 10;
  }

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`Gerado no GEMgym  ·  página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 28, { align: "center" });
  }

  return doc.output("blob");
}
