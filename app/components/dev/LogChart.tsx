import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Row = {
  day: string;
  info: number;
  warning: number;
  error: number;
};

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 py-2 text-xs text-zinc-200 shadow">
      <div className="font-semibold">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-zinc-300">
          {p.dataKey}: <span className="text-zinc-100 font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function LogsChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-zinc-400">No hay datos aún.</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={10}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "rgba(228,228,231,0.9)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.10)" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(228,228,231,0.9)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.10)" }}
          />
          <Tooltip content={<DarkTooltip />} />
          <Legend
            wrapperStyle={{ color: "rgba(228,228,231,0.85)", fontSize: 12 }}
          />

          {/* Colores que contrastan en dark */}
          <Bar dataKey="info" fill="rgba(161,161,170,0.85)" radius={[10, 10, 2, 2]} />
          <Bar dataKey="warning" fill="rgba(251,191,36,0.85)" radius={[10, 10, 2, 2]} />
          <Bar dataKey="error" fill="rgba(248,113,113,0.85)" radius={[10, 10, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
