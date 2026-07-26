"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost, apiDelete, formatDate } from "@/lib/api";
import { compressImage } from "@/lib/progress-photo";
import {
  Scale, Plus, Trash2, Camera, Images, ArrowLeftRight, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type BodyWeightLog = {
  id: string;
  weight: number;
  bodyFatPercent: number | null;
  loggedAt: string;
  notes: string | null;
};

type ProgressPhoto = {
  id: string;
  url: string;
  takenAt: string;
  weight: number | null;
  notes: string | null;
};

export function BodyView() {
  // ── Peso / % de gordura ──────────────────────────────────────────────
  const [logs, setLogs] = useState<BodyWeightLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  // ── Fotos de progresso ────────────────────────────────────────────────
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<ProgressPhoto | null>(null);

  // ── Comparação lado a lado ────────────────────────────────────────────
  const [beforeId, setBeforeId] = useState<string>("");
  const [afterId, setAfterId] = useState<string>("");

  const loadLogs = () => {
    setLogsLoading(true);
    apiGet<{ logs: BodyWeightLog[] }>("/api/bodyweight")
      .then((d) => setLogs(d.logs))
      .finally(() => setLogsLoading(false));
  };

  const loadPhotos = () => {
    setPhotosLoading(true);
    apiGet<{ photos: ProgressPhoto[] }>("/api/progress-photos")
      .then((d) => {
        setPhotos(d.photos);
        // Preenche a comparação com "primeira" x "mais recente" assim que
        // houver pelo menos 2 fotos, só na carga inicial.
        if (d.photos.length >= 2) {
          setBeforeId((prev) => prev || d.photos[d.photos.length - 1].id);
          setAfterId((prev) => prev || d.photos[0].id);
        }
      })
      .finally(() => setPhotosLoading(false));
  };

  useEffect(() => {
    loadLogs();
    loadPhotos();
  }, []);

  // ── Ações: peso ───────────────────────────────────────────────────────
  const handleAddLog = async () => {
    const weightValue = parseFloat(newWeight.replace(",", "."));
    if (!weightValue || weightValue <= 0) {
      toast.error("Informe um peso válido");
      return;
    }
    let bodyFatValue: number | undefined;
    if (newBodyFat.trim() !== "") {
      bodyFatValue = parseFloat(newBodyFat.replace(",", "."));
      if (Number.isNaN(bodyFatValue) || bodyFatValue < 0 || bodyFatValue > 75) {
        toast.error("% de gordura inválido");
        return;
      }
    }
    setSavingLog(true);
    try {
      await apiPost("/api/bodyweight", { weight: weightValue, bodyFatPercent: bodyFatValue });
      toast.success("Registrado!");
      setNewWeight("");
      setNewBodyFat("");
      loadLogs();
    } catch {
      toast.error("Erro ao registrar");
    } finally {
      setSavingLog(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await apiDelete(`/api/bodyweight/${id}`);
      loadLogs();
    } catch {
      toast.error("Erro ao remover registro");
    }
  };

  // ── Ações: fotos ──────────────────────────────────────────────────────
  const handlePickPhoto = () => fileInputRef.current?.click();

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite selecionar o mesmo arquivo de novo depois
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const latestWeight = logs[0]?.weight;
      await apiPost("/api/progress-photos", {
        image: compressed,
        weight: latestWeight,
      });
      toast.success("Foto adicionada!");
      loadPhotos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await apiDelete(`/api/progress-photos/${id}`);
      toast.success("Foto removida!");
      setLightboxPhoto(null);
      if (beforeId === id) setBeforeId("");
      if (afterId === id) setAfterId("");
      loadPhotos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover foto");
    }
  };

  // ── Dados derivados ───────────────────────────────────────────────────
  const chartData = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
        .map((log) => ({
          date: formatDate(log.loggedAt),
          peso: log.weight,
          bf: log.bodyFatPercent,
        })),
    [logs]
  );

  const hasBodyFatData = logs.some((l) => l.bodyFatPercent != null);
  const latestWeight = logs[0]?.weight;
  const firstWeight = logs[logs.length - 1]?.weight;
  const weightDelta = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null;
  const latestBodyFat = logs.find((l) => l.bodyFatPercent != null)?.bodyFatPercent ?? null;

  const beforePhoto = photos.find((p) => p.id === beforeId) || null;
  const afterPhoto = photos.find((p) => p.id === afterId) || null;

  const comparisonDeltaDays =
    beforePhoto && afterPhoto
      ? Math.round(
          (new Date(afterPhoto.takenAt).getTime() - new Date(beforePhoto.takenAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;
  const comparisonWeightDelta =
    beforePhoto?.weight != null && afterPhoto?.weight != null
      ? afterPhoto.weight - beforePhoto.weight
      : null;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Corpo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Peso, % de gordura e fotos de progresso — tudo num só lugar.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: <Scale className="w-5 h-5" />,
            label: "Peso atual",
            value: latestWeight != null ? `${latestWeight} kg` : "—",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: <ArrowLeftRight className="w-5 h-5" />,
            label: "Variação total",
            value: weightDelta != null ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg` : "—",
            color: weightDelta != null && weightDelta < 0 ? "text-emerald-400" : "text-blue-400",
            bg: weightDelta != null && weightDelta < 0 ? "bg-emerald-500/10" : "bg-blue-500/10",
          },
          {
            icon: <span className="text-base leading-none">%</span>,
            label: "Gordura corporal",
            value: latestBodyFat != null ? `${latestBodyFat}%` : "—",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
          },
          {
            icon: <Images className="w-5 h-5" />,
            label: "Fotos registradas",
            value: `${photos.length}`,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4 flex flex-col gap-3 hover:border-primary/20 transition-all">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{s.label}</p>
                <p className="text-2xl font-black tabular-nums mt-0.5">{s.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Peso & % de gordura */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Peso & % de gordura</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="number" inputMode="decimal" step="0.1" placeholder="Peso (kg)"
                value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLog()}
                className="w-28 h-10 rounded-xl"
              />
              <Input
                type="number" inputMode="decimal" step="0.1" placeholder="% gordura"
                value={newBodyFat} onChange={(e) => setNewBodyFat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLog()}
                className="w-28 h-10 rounded-xl"
              />
              <Button size="sm" onClick={handleAddLog} disabled={savingLog}
                className="h-10 rounded-xl bg-primary font-semibold gap-1 shadow-sm shadow-primary/20">
                <Plus className="w-4 h-4" /> Registrar
              </Button>
            </div>
          </div>

          {logsLoading ? (
            <div className="h-48 bg-muted/30 rounded-xl animate-shimmer" />
          ) : chartData.length < 2 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {chartData.length === 0
                ? "Registre seu peso para acompanhar sua evolução."
                : "Registre mais um peso para ver o gráfico."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="peso"
                  stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false}
                  domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `${v}kg`}
                />
                {hasBodyFatData && (
                  <YAxis
                    yAxisId="bf" orientation="right"
                    stroke="oklch(0.60 0 0)" fontSize={11} tickLine={false} axisLine={false}
                    domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `${v}%`}
                  />
                )}
                <Tooltip
                  contentStyle={{ background: "oklch(0.18 0.012 255)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: "0.75rem", color: "oklch(0.97 0 0)", fontSize: "12px" }}
                  formatter={(v: number, name: string) =>
                    name === "bf" ? [`${v}%`, "% gordura"] : [`${v} kg`, "Peso"]
                  }
                />
                <Line yAxisId="peso" type="monotone" dataKey="peso" stroke="oklch(0.80 0.18 162)" strokeWidth={2.5}
                  dot={{ r: 4, fill: "oklch(0.80 0.18 162)", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                {hasBodyFatData && (
                  <Line yAxisId="bf" type="monotone" dataKey="bf" stroke="oklch(0.72 0.18 60)" strokeWidth={2}
                    strokeDasharray="4 3" dot={{ r: 3, fill: "oklch(0.72 0.18 60)", strokeWidth: 0 }} connectNulls />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}

          {logs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-1 max-h-40 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm py-1.5 group hover:bg-accent/30 rounded-lg px-2 transition-colors">
                  <span className="text-muted-foreground">{formatDate(log.loggedAt)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{log.weight} kg</span>
                    {log.bodyFatPercent != null && (
                      <Badge variant="secondary" className="text-[10px] rounded-full">{log.bodyFatPercent}% BF</Badge>
                    )}
                    <button onClick={() => handleDeleteLog(log.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
                      aria-label="Remover">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Fotos de progresso */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Fotos de progresso</h2>
            </div>
            <Button size="sm" onClick={handlePickPhoto} disabled={uploading}
              className="h-10 rounded-xl bg-primary font-semibold gap-1.5 shadow-sm shadow-primary/20">
              <Upload className="w-4 h-4" /> {uploading ? "Enviando…" : "Adicionar foto"}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" hidden onChange={handlePhotoSelected} />
          </div>

          {photosLoading ? (
            <div className="h-32 bg-muted/30 rounded-xl animate-shimmer" />
          ) : photos.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Adicione sua primeira foto pra começar a comparar sua evolução ao longo do tempo.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border/60 hover:border-primary/40 transition-colors group"
                >
                  <img src={photo.url} alt={formatDate(photo.takenAt)} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center">
                    {formatDate(photo.takenAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Comparação lado a lado */}
      {photos.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }}>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Comparar</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Select value={beforeId} onValueChange={setBeforeId}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Antes" />
                </SelectTrigger>
                <SelectContent>
                  {photos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{formatDate(p.takenAt)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={afterId} onValueChange={setAfterId}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Depois" />
                </SelectTrigger>
                <SelectContent>
                  {photos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{formatDate(p.takenAt)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[beforePhoto, afterPhoto].map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-muted border border-border/60 aspect-[3/4] relative">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.url} alt={formatDate(photo.takenAt)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      Selecione uma foto
                    </div>
                  )}
                  {photo && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[11px] py-1 text-center font-medium">
                      {formatDate(photo.takenAt)}{photo.weight != null ? ` · ${photo.weight}kg` : ""}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {beforePhoto && afterPhoto && (
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-4 text-sm">
                {comparisonDeltaDays != null && (
                  <span className="text-muted-foreground">
                    <span className="font-bold text-foreground">{comparisonDeltaDays}</span> dias
                  </span>
                )}
                {comparisonWeightDelta != null && (
                  <Badge className={comparisonWeightDelta > 0
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/20 rounded-full"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 rounded-full"}>
                    {comparisonWeightDelta > 0 ? "+" : ""}{comparisonWeightDelta.toFixed(1)} kg
                  </Badge>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Lightbox de foto individual */}
      <Dialog open={!!lightboxPhoto} onOpenChange={(o) => !o && setLightboxPhoto(null)}>
        <DialogContent className="max-w-md p-3 gap-2">
          <DialogTitle className="text-sm font-semibold text-center px-2 flex items-center justify-between">
            <span>{lightboxPhoto ? formatDate(lightboxPhoto.takenAt) : ""}</span>
            {lightboxPhoto?.weight != null && (
              <Badge variant="secondary" className="text-xs rounded-full">{lightboxPhoto.weight} kg</Badge>
            )}
          </DialogTitle>
          {lightboxPhoto && (
            <>
              <div className="rounded-lg overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightboxPhoto.url} alt={formatDate(lightboxPhoto.takenAt)} className="w-full h-auto object-contain max-h-[70vh]" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePhoto(lightboxPhoto.id)}
                className="w-full rounded-xl gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remover foto
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
