"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SurvivalCalculatorProps {
  totalAvailableFunds: number;
  averageMonthlyExpense: number;
  survivalMonths: number;
  emergencyFundTotal: number;
  emergencyFundTarget: number;
}

export function SurvivalCalculator({
  totalAvailableFunds,
  averageMonthlyExpense,
  survivalMonths,
  emergencyFundTotal,
  emergencyFundTarget,
}: SurvivalCalculatorProps) {
  const progressPercent = Math.min(
    (emergencyFundTotal / emergencyFundTarget) * 100,
    100,
  );
  const yearsMonths = {
    years: Math.floor(survivalMonths / 12),
    months: Math.round(survivalMonths % 12),
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-blue-500" />
          Kalkulator Ketahanan Dana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Survival Display */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="text-sm text-muted-foreground mb-1">
              Dana Anda Bisa Bertahan
            </h3>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {survivalMonths >= 999 ? (
                "∞"
              ) : yearsMonths.years > 0 ? (
                <>
                  {yearsMonths.years} <span className="text-xl">tahun</span>{" "}
                  {yearsMonths.months > 0 && (
                    <>
                      {yearsMonths.months}{" "}
                      <span className="text-xl">bulan</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  {survivalMonths.toFixed(1)}{" "}
                  <span className="text-xl">bulan</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Berdasarkan rata-rata pengeluaran 3 bulan terakhir
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Wallet className="h-4 w-4" />
                Total Dana Tersedia
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(totalAvailableFunds)}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Pengeluaran/Bulan
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(averageMonthlyExpense)}
              </p>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
              📊 Cara Perhitungan:
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                Dana Bertahan = Total Dana / Pengeluaran per Bulan
              </p>
              <p className="font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                {formatCurrency(totalAvailableFunds)} /{" "}
                {formatCurrency(averageMonthlyExpense)} ={" "}
                <strong>{survivalMonths.toFixed(2)} bulan</strong>
              </p>
            </div>
          </div>

          {/* Emergency Fund Progress */}
          {emergencyFundTarget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress Dana Darurat
                </span>
                <span className="font-medium">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(emergencyFundTotal)}</span>
                <span>{formatCurrency(emergencyFundTarget)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
