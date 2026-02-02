import { WalletDialog } from "@/components/wallets/wallet-dialog";
import { WalletCard } from "@/components/wallets/wallet-card";
import { WalletSummary } from "@/components/wallets/wallet-summary";
import { TransferDialog } from "@/components/wallets/transfer-dialog";
import { getWalletsWithStats, getWalletsStats } from "@/lib/actions/wallets";

export default async function WalletsPage() {
  const [wallets, stats] = await Promise.all([
    getWalletsWithStats().catch(() => []),
    getWalletsStats().catch(() => ({
      totalBalance: 0,
      walletCount: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
    })),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dompet</h1>
          <p className="text-muted-foreground">
            Kelola semua dompet dan saldo Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TransferDialog wallets={wallets} />
          <WalletDialog />
        </div>
      </div>

      <WalletSummary stats={stats} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daftar Dompet</h2>
          <span className="text-sm text-muted-foreground">
            {wallets.length} dompet
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-10 border rounded-lg bg-muted/10">
              Belum ada dompet. Buat satu untuk memulai.
            </div>
          ) : (
            wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
