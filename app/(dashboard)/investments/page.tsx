import { getInvestments, getInvestmentStats } from "@/lib/actions/investments";
import { InvestmentDialog } from "@/components/investments/investment-dialog";
import { InvestmentSummary } from "@/components/investments/investment-summary";
import { InvestmentList } from "@/components/investments/investment-list";
import { ExportButton } from "@/components/export-button";

export default async function InvestmentsPage() {
  const [investments, stats] = await Promise.all([
    getInvestments(),
    getInvestmentStats(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Investasi
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau portofolio investasi Anda
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton type="investments" data={investments} />
          <InvestmentDialog />
        </div>
      </div>

      <InvestmentSummary stats={stats} />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">Daftar Investasi</h2>
        <InvestmentList investments={investments} />
      </div>
    </div>
  );
}
