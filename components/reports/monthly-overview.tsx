"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface MonthlyOverviewProps {
  data: {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
  };
}

export function MonthlyOverview({ data }: MonthlyOverviewProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const monthNames = [
    t.reports.months.jan,
    t.reports.months.feb,
    t.reports.months.mar,
    t.reports.months.apr,
    t.reports.months.may,
    t.reports.months.jun,
    t.reports.months.jul,
    t.reports.months.aug,
    t.reports.months.sep,
    t.reports.months.oct,
    t.reports.months.nov,
    t.reports.months.dec,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t.reports.monthly_overview} - {monthNames[data.month]} {data.year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-800/30">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.reports.total_income}
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(data.totalIncome)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-800/30">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.reports.total_expense}
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(data.totalExpense)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg",
              data.netAmount >= 0
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "bg-orange-50 dark:bg-orange-900/20",
            )}
          >
            <div
              className={cn(
                "rounded-full p-3",
                data.netAmount >= 0
                  ? "bg-blue-100 dark:bg-blue-800/30"
                  : "bg-orange-100 dark:bg-orange-800/30",
              )}
            >
              <ArrowUpDown
                className={cn(
                  "h-6 w-6",
                  data.netAmount >= 0 ? "text-blue-600" : "text-orange-600",
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.reports.net_amount}
              </p>
              <p
                className={cn(
                  "text-xl font-bold",
                  data.netAmount >= 0 ? "text-blue-600" : "text-orange-600",
                )}
              >
                {data.netAmount >= 0 ? "+" : ""}
                {formatCurrency(data.netAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            {data.transactionCount} {t.reports.transactions_this_month}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
