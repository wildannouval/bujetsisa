"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FinancialHealthCardProps {
  healthScore: number;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  healthMessage: string;
  survivalMonths: number;
  survivalMessage: string;
  monthsOfCoverage: number;
  savingsRate: number;
}

export function FinancialHealthCard({
  healthScore,
  healthStatus,
  healthMessage,
  survivalMonths,
  survivalMessage,
  monthsOfCoverage,
  savingsRate,
}: FinancialHealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "fair":
        return "text-yellow-500";
      case "poor":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "excellent":
        return "🌟";
      case "good":
        return "👍";
      case "fair":
        return "⚠️";
      case "poor":
        return "😟";
      case "critical":
        return "🚨";
      default:
        return "❓";
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-red-500" />
          Kesehatan Keuangan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Health Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Skor Kesehatan
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  getStatusColor(healthStatus),
                )}
              >
                {healthScore}/100
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full transition-all",
                  getProgressColor(healthScore),
                )}
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{getStatusEmoji(healthStatus)}</span>
              {healthMessage}
            </p>
          </div>

          {/* Survival Months */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Dana Bertahan
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  survivalMonths >= 6
                    ? "text-green-500"
                    : survivalMonths >= 3
                      ? "text-yellow-500"
                      : "text-red-500",
                )}
              >
                {survivalMonths >= 999 ? "∞" : `${survivalMonths.toFixed(1)}`}{" "}
                bulan
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{survivalMessage}</p>
          </div>

          {/* Emergency Fund Coverage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Dana Darurat
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  monthsOfCoverage >= 6
                    ? "text-green-500"
                    : monthsOfCoverage >= 3
                      ? "text-yellow-500"
                      : "text-red-500",
                )}
              >
                {monthsOfCoverage.toFixed(1)} bulan
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {monthsOfCoverage >= 6
                ? "Dana darurat sudah mencukupi"
                : monthsOfCoverage >= 3
                  ? "Hampir mencapai target"
                  : "Perlu ditingkatkan"}
            </p>
          </div>

          {/* Savings Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Rasio Tabungan
              </span>
              <span
                className={cn(
                  "text-2xl font-bold flex items-center gap-1",
                  savingsRate >= 20
                    ? "text-green-500"
                    : savingsRate >= 10
                      ? "text-yellow-500"
                      : "text-red-500",
                )}
              >
                {savingsRate >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {savingsRate >= 30
                ? "Luar biasa! Lanjutkan!"
                : savingsRate >= 20
                  ? "Sangat bagus"
                  : savingsRate >= 10
                    ? "Cukup baik"
                    : "Perlu perbaikan"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
