"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DailySpendingProps {
  data: { date: number; amount: number }[];
}

export function DailySpendingChart({ data }: DailySpendingProps) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            opacity={0.05}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 9,
              fontWeight: "800",
              fill: "currentColor",
              opacity: 0.4,
            }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "currentColor", opacity: 0.05 }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderRadius: "12px",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{
              color: "hsl(var(--foreground))",
              fontSize: "11px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
            formatter={(val: number) => [
              `Rp ${val.toLocaleString("id-ID")}`,
              "Spending",
            ]}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={12}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.amount > 200000 ? "#6366f1" : "rgba(99, 102, 241, 0.2)"
                }
                className="transition-all duration-500 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
