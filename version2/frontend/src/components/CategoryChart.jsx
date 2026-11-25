import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { colorFor, money } from "../categories";

export default function CategoryChart({ data }) {
  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-ink-soft">
        Add an expense to visualize your spending breakdown.
      </p>
    );
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="relative h-56" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={colorFor(d.name)} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => money(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Total
          </span>
          <span className="font-display text-lg font-bold tabular-nums text-ink">
            {money(total)}
          </span>
        </div>
      </div>

      <ul className="mt-3 space-y-2.5">
        {data.map((d) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <li key={d.name} className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colorFor(d.name) }}
                  />
                  {d.name}
                </span>
                <span className="tabular-nums text-xs text-ink-soft">
                  {money(d.value)} · {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: colorFor(d.name) }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
