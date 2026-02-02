"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface YearlyChartProps {
  data: Array<{
    month: number;
    income: number;
    expense: number;
    net: number;
  }>;
  year: number;
}

export function YearlyChart({ data, year }: YearlyChartProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount || 0);
  };

  const monthLabels = [
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
  ];

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {t.reports.yearly_chart} - {year}
          </span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>{t.reports.income}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>{t.reports.expense}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-48">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full flex gap-0.5 h-40 items-end justify-center">
                  {/* Income bar */}
                  <div
                    className="w-2 bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{
                      height: `${(item.income / maxValue) * 100}%`,
                      minHeight: item.income > 0 ? "4px" : "0",
                    }}
                    title={`${t.reports.income}: ${formatCurrency(item.income)}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-2 bg-red-500 rounded-t transition-all hover:bg-red-600"
                    style={{
                      height: `${(item.expense / maxValue) * 100}%`,
                      minHeight: item.expense > 0 ? "4px" : "0",
                    }}
                    title={`${t.reports.expense}: ${formatCurrency(item.expense)}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {monthLabels[index]}
                </span>
              </div>
            ))}
          </div>

          {/* Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    {t.reports.month}
                  </th>
                  <th className="py-2 text-right font-medium text-muted-foreground">
                    {t.reports.income}
                  </th>
                  <th className="py-2 text-right font-medium text-muted-foreground">
                    {t.reports.expense}
                  </th>
                  <th className="py-2 text-right font-medium text-muted-foreground">
                    {t.reports.net}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2">{monthLabels[index]}</td>
                    <td className="py-2 text-right text-green-600">
                      {formatCurrency(item.income)}
                    </td>
                    <td className="py-2 text-right text-red-600">
                      {formatCurrency(item.expense)}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right font-medium",
                        item.net >= 0 ? "text-blue-600" : "text-orange-600",
                      )}
                    >
                      {item.net >= 0 ? "+" : ""}
                      {formatCurrency(item.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
