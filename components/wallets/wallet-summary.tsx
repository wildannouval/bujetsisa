"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface WalletSummaryProps {
  stats: {
    totalBalance: number;
    walletCount: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
}

export function WalletSummary({ stats }: WalletSummaryProps) {
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
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                {t.dashboard.total_balance}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.wallets.title}
              </p>
              <p className="text-2xl font-bold">{stats.walletCount}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.dashboard.income}
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
                {t.dashboard.expense}
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
    </div>
  );
}
