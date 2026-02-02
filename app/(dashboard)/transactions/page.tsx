import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionSummary } from "@/components/transactions/transaction-summary";
import {
  getTransactions,
  getTransactionStats,
} from "@/lib/actions/transactions";
import { getWallets } from "@/lib/actions/wallets";
import { getCategories } from "@/lib/actions/categories";

export default async function TransactionsPage() {
  const [transactions, wallets, categories, stats] = await Promise.all([
    getTransactions().catch(() => []),
    getWallets().catch(() => []),
    getCategories().catch(() => []),
    getTransactionStats().catch(() => ({
      totalTransactions: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      netAmount: 0,
    })),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <TransactionDialog wallets={wallets} categories={categories} />
      </div>

      <TransactionSummary stats={stats} />

      <TransactionTable
        transactions={transactions}
        wallets={wallets}
        categories={categories}
      />
    </div>
  );
}
