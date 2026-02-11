import { DebtDialog } from "@/components/debts/debt-dialog";
import { DebtList } from "@/components/debts/debt-list";
import { DebtSummary } from "@/components/debts/debt-summary";
import { getDebts, getDebtStats } from "@/lib/actions/debts";
import { ExportButton } from "@/components/export-button";

export default async function DebtsPage() {
  const [debts, stats] = await Promise.all([
    getDebts().catch(() => []),
    getDebtStats().catch(() => ({
      totalDebts: 0,
      totalPayable: 0,
      totalReceivable: 0,
      unpaidDebts: 0,
      overdueDebts: 0,
      paidDebts: 0,
    })),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Hutang & Piutang
        </h1>
        <div className="flex flex-wrap gap-2">
          <ExportButton type="debts" data={debts} />
          <DebtDialog />
        </div>
      </div>

      <DebtSummary stats={stats} />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">
          Daftar Hutang & Piutang
        </h2>
        <DebtList debts={debts} />
      </div>
    </div>
  );
}
