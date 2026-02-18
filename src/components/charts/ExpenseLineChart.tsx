import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatARS } from "../../libs/utils/currency";

type Point = { date: string; expense: number };

export default function ExpensesLineChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 rounded-xl border border-dashed border-white/15 bg-slate-950/30 flex items-center justify-center text-sm text-slate-500">
        No expense data for this month.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
            tickFormatter={(v) => String(v).slice(8, 10)} // día
            axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
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
          <Line
            type="monotone"
            dataKey="expense"
            stroke="rgba(99,102,241,0.95)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
