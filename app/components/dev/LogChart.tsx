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
  warning: number;
  error: number;
};

function LightTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
      <div className="font-semibold text-slate-900">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-slate-600">
          {p.dataKey}: <span className="font-medium text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function LogsChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-slate-500">No hay datos a?n.</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={28} barGap={8}>
          <CartesianGrid stroke="rgba(148,163,184,0.25)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "rgba(51,65,85,0.92)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(148,163,184,0.45)" }}
            tickLine={{ stroke: "rgba(148,163,184,0.45)" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(51,65,85,0.92)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(148,163,184,0.45)" }}
            tickLine={{ stroke: "rgba(148,163,184,0.45)" }}
          />
          <Tooltip content={<LightTooltip />} />
          <Legend wrapperStyle={{ color: "rgba(71,85,105,0.95)", fontSize: 12 }} />

          <Bar dataKey="warning" name="warning" barSize={18} fill="rgba(245,158,11,0.85)" radius={[10, 10, 2, 2]} />
          <Bar dataKey="error" name="error" barSize={18} fill="rgba(239,68,68,0.85)" radius={[10, 10, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
