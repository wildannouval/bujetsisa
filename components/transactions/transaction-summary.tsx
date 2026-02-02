"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Receipt, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface TransactionSummaryProps {
  stats: {
    totalTransactions: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netAmount: number;
  };
}

export function TransactionSummary({ stats }: TransactionSummaryProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.transactions.total_transactions}
              </p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.transactions.income_this_month}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.transactions.expense_this_month}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.monthlyExpense)}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.transactions.net_this_month}
              </p>
              <p
                className={`text-2xl font-bold ${
                  stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.netAmount >= 0 ? "+" : ""}
                {formatCurrency(stats.netAmount)}
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${
                stats.netAmount >= 0
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              <Wallet
                className={`h-6 w-6 ${
                  stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
