import {
  getFinancialInsights,
  getSpendingTrends,
} from "@/lib/actions/insights";
import { FinancialHealthCard } from "@/components/insights/financial-health-card";
import { SmartRecommendations } from "@/components/insights/smart-recommendations";
import { SurvivalCalculator } from "@/components/insights/survival-calculator";
import { MonthComparison } from "@/components/insights/month-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const [insights, trends] = await Promise.all([
    getFinancialInsights(),
    getSpendingTrends(),
  ]);

  const defaultInsights = {
    healthScore: 50,
    healthStatus: "fair" as const,
    healthMessage: "Belum ada data yang cukup untuk analisis",
    emergencyFundTotal: 0,
    emergencyFundTarget: 0,
    emergencyFundPercentage: 0,
    monthsOfCoverage: 0,
    averageMonthlyExpense: 0,
    totalAvailableFunds: 0,
    survivalMonths: 0,
    survivalMessage: "Mulai tambahkan transaksi untuk melihat analisis",
    recommendations: [],
    debtToIncomeRatio: 0,
    totalUnpaidDebt: 0,
    savingsRate: 0,
    monthlySavings: 0,
  };

  const data = insights || defaultInsights;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analisis Keuangan
          </h1>
          <p className="text-muted-foreground">
            Insight cerdas untuk kesehatan keuangan Anda
          </p>
        </div>
      </div>

      {/* Financial Health Overview */}
      <FinancialHealthCard
        healthScore={data.healthScore}
        healthStatus={data.healthStatus}
        healthMessage={data.healthMessage}
        survivalMonths={data.survivalMonths}
        survivalMessage={data.survivalMessage}
        monthsOfCoverage={data.monthsOfCoverage}
        savingsRate={data.savingsRate}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Survival Calculator */}
        <SurvivalCalculator
          totalAvailableFunds={data.totalAvailableFunds}
          averageMonthlyExpense={data.averageMonthlyExpense}
          survivalMonths={data.survivalMonths}
          emergencyFundTotal={data.emergencyFundTotal}
          emergencyFundTarget={data.emergencyFundTarget}
        />

        {/* Smart Recommendations */}
        <SmartRecommendations recommendations={data.recommendations} />
      </div>

      {/* Month Comparison */}
      <MonthComparison />

      {/* Spending Trends */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Tren Pengeluaran 6 Bulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Monthly Data */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Per Bulan
                </h4>
                <div className="space-y-2">
                  {trends.monthlyData.map((item) => {
                    const maxAmount = Math.max(
                      ...trends.monthlyData.map((d) => d.amount),
                    );
                    const width =
                      maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                    return (
                      <div key={item.month} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>
                            {new Date(item.month + "-01").toLocaleDateString(
                              "id-ID",
                              { month: "short", year: "numeric" },
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Categories */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Kategori Terbesar
                </h4>
                <div className="space-y-3">
                  {trends.topCategories.map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Trend Indicator */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tren Bulan Ini
                    </span>
                    <div
                      className={`flex items-center gap-1 font-medium ${
                        trends.trend === "up"
                          ? "text-red-500"
                          : trends.trend === "down"
                            ? "text-green-500"
                            : "text-gray-500"
                      }`}
                    >
                      {trends.trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : trends.trend === "down" ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                      {Math.abs(trends.trendPercentage).toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trends.trend === "up"
                      ? "Pengeluaran meningkat dari bulan lalu"
                      : trends.trend === "down"
                        ? "Bagus! Pengeluaran menurun"
                        : "Pengeluaran stabil"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debt Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Total Hutang Belum Lunas
              </p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(data.totalUnpaidDebt)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Rasio Hutang/Pendapatan
              </p>
              <p
                className={`text-2xl font-bold ${
                  data.debtToIncomeRatio <= 30
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {data.debtToIncomeRatio.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tabungan per Bulan
              </p>
              <p
                className={`text-2xl font-bold ${
                  data.monthlySavings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(data.monthlySavings)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
