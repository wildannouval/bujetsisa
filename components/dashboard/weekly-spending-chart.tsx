"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WeeklySpendingChartProps {
  data: {
    day: string;
    shortDay: string;
    income: number;
    expense: number;
  }[];
}

export function WeeklySpendingChart({ data }: WeeklySpendingChartProps) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <div>
            <CardTitle className="text-base">
              Aktivitas 7 Hari Terakhir
            </CardTitle>
            <CardDescription>Pemasukan vs pengeluaran harian</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            Belum ada transaksi minggu ini
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="shortDay"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000)
                      return `${(value / 1000000).toFixed(0)}jt`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                    return value.toString();
                  }}
                  className="fill-muted-foreground"
                  width={45}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    const dayData = data.find((d) => d.shortDay === label);
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium mb-1">
                          {dayData?.day}
                        </p>
                        {payload.map((p: any) => (
                          <p
                            key={p.dataKey}
                            className="text-sm"
                            style={{ color: p.color }}
                          >
                            {p.dataKey === "income" ? "Masuk" : "Keluar"}:{" "}
                            {formatCurrency(p.value, "IDR")}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="income"
                  fill="hsl(142, 71%, 45%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="expense"
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            Pemasukan
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            Pengeluaran
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
