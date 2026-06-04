"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface EloChartProps {
  data: { date: string; elo: number }[];
  startElo: number;
}

export function EloChart({ data, startElo }: EloChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--color-muted)] tracking-wide">
        Noch keine Match-Historie vorhanden.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--color-text)",
          }}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(value: unknown) => [value as number, "ELO"]}
        />
        <ReferenceLine y={startElo} stroke="var(--color-border)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="elo"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-accent)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
