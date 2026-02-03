"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface InvestmentSummaryProps {
  stats: {
    totalInvested: number;
    currentValue: number;
    totalGain: number;
    totalGainPercent: number;
    investmentCount: number;
  };
}

export function InvestmentSummary({ stats }: InvestmentSummaryProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const isProfit = stats.totalGain >= 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Investasi
              </p>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {formatCurrency(stats.totalInvested)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.investmentCount} aset
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-2 sm:p-3 dark:bg-blue-900/20">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Nilai Saat Ini
              </p>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {formatCurrency(stats.currentValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Harga pasar terkini
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 sm:p-3">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Keuntungan/Rugi
              </p>
              <p
                className={`text-xl sm:text-2xl font-bold truncate ${isProfit ? "text-green-600" : "text-red-600"}`}
              >
                {isProfit ? "+" : ""}
                {formatCurrency(stats.totalGain)}
              </p>
              <p
                className={`text-xs mt-1 ${isProfit ? "text-green-600" : "text-red-600"}`}
              >
                {isProfit ? "+" : ""}
                {stats.totalGainPercent.toFixed(2)}%
              </p>
            </div>
            <div
              className={`rounded-full p-2 sm:p-3 ${isProfit ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}
            >
              {isProfit ? (
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-violet-100">
                ROI
              </p>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {stats.totalGainPercent.toFixed(2)}%
              </p>
              <p className="text-xs text-violet-200 mt-1">
                Return on Investment
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-2 sm:p-3">
              <PieChart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
