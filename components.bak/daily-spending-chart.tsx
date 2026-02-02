"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DailySpendingProps {
  data: { date: number; amount: number }[];
}

const chartConfig = {
  amount: {
    label: "Pengeluaran",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function DailySpendingChart({ data }: DailySpendingProps) {
  // Format data for chart
  const formattedData = data.map((item) => ({
    date: item.date,
    amount: item.amount,
    label: `Tanggal ${item.date}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengeluaran Harian</CardTitle>
        <CardDescription>Grafik pengeluaran per hari bulan ini</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={formattedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
