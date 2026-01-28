import {
  IconTrendingUp,
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight,
  IconHandStop,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function SectionCards() {
  const supabase = await createClient();

  // Ambil Data Dompet
  const { data: wallets } = await supabase.from("wallets").select("balance");
  const totalBalance =
    wallets?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* TOTAL SALDO */}
      <Card className="@container/card border-primary/20">
        <CardHeader>
          <CardDescription>Total Saldo Semua Dompet</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp {totalBalance.toLocaleString("id-ID")}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-600 border-green-200"
            >
              <IconWallet size={16} className="mr-1" /> Aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground font-medium">
            Total dari {wallets?.length || 0} dompet.
          </div>
        </CardFooter>
      </Card>

      {/* PEMASUKAN BULAN INI (Placeholder) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pemasukan (Januari)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp 0
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconArrowUpRight size={16} /> +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm font-medium">
          Dibandingkan bulan lalu.
        </CardFooter>
      </Card>

      {/* PENGELUARAN BULAN INI (Placeholder) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pengeluaran (Januari)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-500">
            Rp 0
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="text-red-500 border-red-200 bg-red-50"
            >
              <IconArrowDownRight size={16} /> -0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm font-medium">
          Batas aman bujet Anda.
        </CardFooter>
      </Card>

      {/* HUTANG PIUTANG (Placeholder) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Hutang Belum Lunas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp 0
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconHandStop size={16} /> 0 Orang
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-muted-foreground text-sm font-medium">
          Segera selesaikan tanggungan.
        </CardFooter>
      </Card>
    </div>
  );
}
