"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Target,
  Scale,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface FinancialSummaryProps {
  summary: {
    totalBalance: number;
    totalPayable: number;
    totalReceivable: number;
    totalSaved: number;
    totalTarget: number;
    activeGoals: number;
    netWorth: number;
  };
}

export function FinancialSummary({ summary }: FinancialSummaryProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white lg:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-100">
                {t.reports.net_worth}
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(summary.netWorth)}
              </p>
              <p className="text-xs text-violet-200 mt-1">
                {t.reports.net_worth_desc}
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Scale className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.reports.total_balance}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalBalance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.reports.all_wallets}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.reports.savings_progress}
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(summary.totalSaved)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.activeGoals} {t.reports.active_goals}
              </p>
            </div>
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/20">
              <PiggyBank className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.reports.total_receivable}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalReceivable)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.reports.people_owe_you}
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
                {t.reports.total_payable}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalPayable)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.reports.you_owe}
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
                {t.reports.savings_target}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalTarget)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.totalTarget > 0
                  ? `${Math.round((summary.totalSaved / summary.totalTarget) * 100)}% ${t.reports.achieved}`
                  : t.reports.no_goals}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
