"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Receipt,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface DebtSummaryProps {
  stats: {
    totalDebts: number;
    totalPayable: number;
    totalReceivable: number;
    unpaidDebts: number;
    overdueDebts: number;
    paidDebts: number;
  };
}

export function DebtSummary({ stats }: DebtSummaryProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const netDebt = stats.totalReceivable - stats.totalPayable;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-100">
                {t.debts.i_owe}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalPayable)}
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                {t.debts.owed_to_me}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalReceivable)}
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.debts.unpaid}
              </p>
              <p className="text-2xl font-bold">{stats.unpaidDebts}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.debts.total_records}: {stats.totalDebts}
              </p>
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
                {t.debts.overdue}
              </p>
              <p
                className={`text-2xl font-bold ${stats.overdueDebts > 0 ? "text-red-600" : ""}`}
              >
                {stats.overdueDebts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.debts.needs_attention}
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${stats.overdueDebts > 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-muted"}`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${stats.overdueDebts > 0 ? "text-red-600" : "text-muted-foreground"}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.debts.settled}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.paidDebts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.debts.all_time}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
