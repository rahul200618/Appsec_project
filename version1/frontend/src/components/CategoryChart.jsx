import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { colorFor, money } from "../categories";

export default function CategoryChart({ data }) {
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-ink-soft">Add an expense to see the breakdown.</p>;
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="h-52" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={colorFor(d.name)} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => money(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(d.name) }} />
              {d.name}
            </span>
            <span className="tabular-nums text-ink-soft">
              {money(d.value)} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
