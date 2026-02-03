import { FinancialSummary } from "@/components/reports/financial-summary";
import { MonthlyOverview } from "@/components/reports/monthly-overview";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { YearlyChart } from "@/components/reports/yearly-chart";
import {
  getMonthlyReport,
  getYearlyReport,
  getFinancialSummary,
} from "@/lib/actions/reports";

export default async function ReportsPage() {
  const [monthlyReport, yearlyReport, financialSummary] = await Promise.all([
    getMonthlyReport().catch(() => null),
    getYearlyReport().catch(() => null),
    getFinancialSummary().catch(() => null),
  ]);

  const defaultSummary = {
    totalBalance: 0,
    totalPayable: 0,
    totalReceivable: 0,
    totalSaved: 0,
    totalTarget: 0,
    activeGoals: 0,
    netWorth: 0,
  };

  const defaultMonthly = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
    categoryBreakdown: [],
    dailyData: [],
  };

  const defaultYearly = {
    year: new Date().getFullYear(),
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    monthlyData: Array.from({ length: 12 }, (_, i) => ({
      month: i,
      income: 0,
      expense: 0,
      net: 0,
    })),
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Laporan Keuangan
        </h1>
      </div>

      {/* Financial Summary */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Ringkasan Keuangan
        </h2>
        <FinancialSummary summary={financialSummary || defaultSummary} />
      </section>

      {/* Monthly Overview */}
      <section>
        <MonthlyOverview data={monthlyReport || defaultMonthly} />
      </section>

      {/* Two Column Layout */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <CategoryBreakdown
          categories={monthlyReport?.categoryBreakdown || []}
          totalExpense={monthlyReport?.totalExpense || 0}
        />

        {/* Yearly Chart */}
        <YearlyChart
          data={yearlyReport?.monthlyData || defaultYearly.monthlyData}
          year={yearlyReport?.year || defaultYearly.year}
        />
      </div>
    </div>
  );
}
