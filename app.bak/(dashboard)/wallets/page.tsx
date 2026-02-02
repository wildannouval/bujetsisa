import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CreateWalletDialog } from "@/components/create-wallet-dialog";
import { EditWalletDialog } from "@/components/edit-wallet-dialog";
import { TransferWalletDialog } from "@/components/transfer-wallet-dialog";
import { deleteWallet } from "@/lib/actions/wallets";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, CreditCard, Banknote, Landmark } from "lucide-react";
import { WalletCardActions } from "@/components/wallet-card-actions";

async function WalletsContent() {
  const supabase = await createClient();
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at");

  const totalBalance =
    wallets?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Wallets</h2>
          <p className="text-muted-foreground">
            Manage your accounts and track current balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {wallets && wallets.length > 0 && (
            <TransferWalletDialog wallets={wallets} />
          )}
          <CreateWalletDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalBalance.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {wallets?.length || 0} accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets?.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {wallet.type === "bank" ? (
                  <Landmark className="h-4 w-4" />
                ) : wallet.type === "ewallet" ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {wallet.name}
              </CardTitle>
              <WalletCardActions wallet={wallet} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {Number(wallet.balance).toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {wallet.type} &middot; {wallet.color || "Gray"}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!wallets || wallets.length === 0) && (
          <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center justify-center">
            <Wallet className="h-10 w-10 mb-4 opacity-50" />
            <p>No wallets created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletsPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 flex md:flex">
      <Suspense fallback={<WalletsSkeleton />}>
        <WalletsContent />
      </Suspense>
    </div>
  );
}

function WalletsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-32 w-full max-w-sm" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
