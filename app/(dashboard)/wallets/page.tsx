import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  IconBuildingBank,
  IconCash,
  IconDeviceMobile,
  IconChartLine,
  IconCreditCard,
  IconWallet,
  IconInbox,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreateWalletDialog } from "@/components/create-wallet-dialog";
import { TransferWalletDialog } from "@/components/transfer-wallet-dialog";
import { WalletCardActions } from "@/components/wallet-card-actions"; // Import komponen baru
import { NumberTicker } from "@/components/ui/number-ticker";

const getWalletIcon = (type: string) => {
  const iconProps = { size: 24, strokeWidth: 2 };
  switch (type) {
    case "Bank":
      return <IconBuildingBank {...iconProps} />;
    case "Tunai":
      return <IconCash {...iconProps} />;
    case "E-Wallet":
      return <IconDeviceMobile {...iconProps} />;
    case "Investasi":
      return <IconChartLine {...iconProps} />;
    default:
      return <IconCreditCard {...iconProps} />;
  }
};

async function WalletsContent() {
  const supabase = await createClient();
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: false });

  const totalBalance =
    wallets?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- SECTION 1: ASSET SUMMARY --- */}
      <div className="px-4 lg:px-0">
        <div className="relative group rounded-[2.5rem] border border-indigo-500/20 bg-indigo-600 p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute right-[-20px] bottom-[-20px] size-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <IconWallet className="absolute right-10 top-10 size-32 opacity-10" />

          <div className="relative z-10 space-y-6 text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 text-indigo-100">
                Total Net Worth
              </p>
              <div className="text-4xl md:text-6xl font-black tracking-tighter flex items-baseline gap-2">
                <span className="text-xl md:text-2xl opacity-60 font-bold">
                  Rp
                </span>
                <NumberTicker value={totalBalance} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 w-fit">
              <div className="size-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50">
                {wallets?.length || 0} Akun Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: ACTIONS HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 lg:px-0">
        <div className="space-y-1 text-left">
          <h3 className="text-lg font-black uppercase tracking-tighter text-foreground">
            Daftar Dompet
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
            Kelola unit aset individual Anda
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <TransferWalletDialog wallets={wallets || []} />
          <CreateWalletDialog />
        </div>
      </div>

      {/* --- SECTION 3: WALLET GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-0">
        {wallets && wallets.length > 0 ? (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="group relative rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-8 overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col justify-between min-h-[240px]"
            >
              <div className="absolute right-[-10%] top-[-10%] size-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-3 text-left">
                  <div className="p-3 bg-muted border border-border rounded-2xl w-fit text-foreground group-hover:scale-110 transition-transform">
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-foreground truncate max-w-[180px]">
                      {wallet.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-black uppercase tracking-widest border-indigo-500/20 text-indigo-500 mt-1"
                    >
                      {wallet.type || "Personal"}
                    </Badge>
                  </div>
                </div>

                {/* MEMANGGIL CLIENT COMPONENT BARU DI SINI */}
                <WalletCardActions wallet={wallet} />
              </div>

              <div className="relative z-10 mt-10 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Saldo Saat Ini
                </p>
                <div className="text-2xl font-black tracking-tighter text-foreground tabular-nums flex items-baseline gap-1">
                  <span className="text-sm opacity-40 font-bold">Rp</span>
                  {Number(wallet.balance).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-20 border-2 border-dashed border-border rounded-[2.5rem]">
            <IconInbox size={64} strokeWidth={1} />
            <p className="text-sm font-black uppercase tracking-[0.4em]">
              Belum Ada Dompet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function WalletsSkeleton() {
  return (
    <div className="space-y-8 px-4 lg:px-0">
      <Skeleton className="h-48 w-full rounded-[2.5rem]" />
      <div className="grid gap-6 md:grid-cols-3 mt-10">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}

export default function WalletsPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8 w-full max-w-none">
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="px-4 lg:px-0 space-y-1 text-left">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
          Unit Finansial
        </h2>
        <p className="text-sm text-muted-foreground font-medium italic-none">
          Kelola dan distribusikan modal aktif Anda di berbagai platform.
        </p>
      </div>

      <Suspense fallback={<WalletsSkeleton />}>
        <WalletsContent />
      </Suspense>
    </div>
  );
}
