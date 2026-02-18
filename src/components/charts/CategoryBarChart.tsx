import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatARS } from "../../libs/utils/currency";

type Row = { name: string; value: number };

export default function CategoryBarChart({ data }: { data: Row[] }) {
  const top = (data ?? []).slice(0, 8);

  if (!top || top.length === 0) {
    return (
      <div className="h-64 rounded-xl border border-dashed border-white/15 bg-slate-950/30 flex items-center justify-center text-sm text-slate-500">
        No category expense data yet.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
            interval={0}
            tickFormatter={(v) => (String(v).length > 10 ? String(v).slice(0, 10) + "…" : v)}
          />
          <YAxis
            tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(2,6,23,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
            }}
            labelStyle={{ color: "rgba(226,232,240,0.85)" }}
            formatter={(value) => formatARS(Number(value))}
          />
          <Bar dataKey="value" fill="rgba(99,102,241,0.95)" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
