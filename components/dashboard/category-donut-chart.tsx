"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CategoryDonutChartProps {
  categories: {
    id: string;
    name: string;
    icon: string;
    amount: number;
  }[];
  totalExpense: number;
}

const COLORS = [
  "hsl(0, 84%, 60%)",
  "hsl(25, 95%, 53%)",
  "hsl(45, 93%, 47%)",
  "hsl(217, 91%, 60%)",
  "hsl(271, 81%, 56%)",
  "hsl(162, 73%, 46%)",
];

export function CategoryDonutChart({
  categories,
  totalExpense,
}: CategoryDonutChartProps) {
  if (categories.length === 0) {
    return null;
  }

  const data = categories.map((cat) => ({
    name: `${cat.icon} ${cat.name}`,
    value: cat.amount,
    percentage:
      totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-purple-500" />
          <div>
            <CardTitle className="text-base">Distribusi Pengeluaran</CardTitle>
            <CardDescription>Breakdown kategori bulan ini</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-[160px] h-[160px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2.5 shadow-md">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Number(item.value), "IDR")}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 w-full">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-muted-foreground font-medium">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
