import { DebtDialog } from "@/components/debts/debt-dialog";
import { DebtList } from "@/components/debts/debt-list";
import { DebtSummary } from "@/components/debts/debt-summary";
import { getDebts, getDebtStats } from "@/lib/actions/debts";

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
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hutang & Piutang</h1>
        <DebtDialog />
      </div>

      <DebtSummary stats={stats} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Daftar Hutang & Piutang</h2>
        <DebtList debts={debts} />
      </div>
    </div>
  );
}
