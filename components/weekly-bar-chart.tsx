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

export function WeeklyBarChart({
  data,
}: {
  data: { week: string; amount: number }[];
}) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            opacity={0.1}
          />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fontWeight: "800",
              fill: "currentColor",
              opacity: 0.5,
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fontWeight: "800",
              fill: "currentColor",
              opacity: 0.5,
            }}
            tickFormatter={(val) => `${val / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: "currentColor", opacity: 0.05 }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderRadius: "16px",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{
              color: "hsl(var(--foreground))",
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === data.length - 1
                    ? "#6366f1"
                    : "rgba(99, 102, 241, 0.3)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
