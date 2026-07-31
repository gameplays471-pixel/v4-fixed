"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { apiGet } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

type HistoryPoint = {
  date: string;
  maxWeight: number;
  maxReps: number;
  volume: number;
  sets: number;
};

export function ExerciseHistoryChart({
  exerciseId,
  exerciseName,
  days = 90,
  height = 160,
}: {
  exerciseId: string;
  exerciseName?: string;
  days?: number;
  height?: number;
}) {
  const q = useQuery({
    queryKey: [...queryKeys.exerciseHistory(exerciseId), days],
    queryFn: () =>
      apiGet<{ history: HistoryPoint[]; exercise: { name: string } }>(
        `/api/exercises/${exerciseId}/history?days=${days}`
      ),
    enabled: !!exerciseId,
  });

  if (q.isLoading) {
    return <LoadingSkeleton className="w-full rounded-xl" style={{ height }} />;
  }

  const history = q.data?.history ?? [];
  if (history.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-6 text-center">
        Sem histórico de carga para {exerciseName || "este exercício"} ainda.
      </p>
    );
  }

  const data = history.map((h) => ({
    ...h,
    label: h.date.slice(5), // MM-DD
  }));

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2 px-1">
        <p className="text-xs font-semibold text-muted-foreground">
          Carga máxima · últimos {days} dias
        </p>
        <p className="text-xs font-black tabular-nums">
          {data[data.length - 1].maxWeight} kg
          <span className="text-muted-foreground font-normal"> × {data[data.length - 1].maxReps}</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={36}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
            formatter={(value: number, name: string) => {
              if (name === "maxWeight") return [`${value} kg`, "Peso máx."];
              if (name === "maxReps") return [value, "Reps"];
              return [value, name];
            }}
            labelFormatter={(l) => `Data: ${l}`}
          />
          <Line
            type="monotone"
            dataKey="maxWeight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
