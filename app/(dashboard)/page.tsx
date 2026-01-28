import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseChart } from "@/components/expense-chart";
import {
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight,
  IconReceipt,
} from "@tabler/icons-react";

async function DashboardContent() {
  const supabase = await createClient();
  const now = new Date();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  // 1. Ambil Saldo
  const { data: wallets } = await supabase.from("wallets").select("balance");
  const totalBalance =
    wallets?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

  // 2. Ambil Transaksi Bulan Ini
  // Kita tambahkan type casting 'any' pada query untuk mempermudah akses property join
  const { data: monthTxs } = (await supabase
    .from("transactions")
    .select(
      `
      amount, 
      type, 
      categories (
        name, 
        color
      )
    `,
    )
    .gte("date", firstDayOfMonth)) as { data: any[] | null };

  const totalIncome =
    monthTxs
      ?.filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalExpense =
    monthTxs
      ?.filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // 3. Grouping untuk Chart
  const categoryMap: Record<string, number> = {};
  const colorMap: Record<string, string> = {};

  monthTxs
    ?.filter((t) => t.type === "expense")
    .forEach((t) => {
      // Supabase terkadang mengembalikan join sebagai objek atau array berisi 1 objek
      // Kita handle keduanya dengan check Array.isArray
      const catData = Array.isArray(t.categories)
        ? t.categories[0]
        : t.categories;
      const name = catData?.name || "Lainnya";
      const color = catData?.color || "#cbd5e1";

      categoryMap[name] = (categoryMap[name] || 0) + Number(t.amount);
      colorMap[name] = color;
    });

  const chartData = Object.keys(categoryMap).map((name) => ({
    name,
    value: categoryMap[name],
    color: colorMap[name],
  }));

  return (
    <div className="space-y-6">
      {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium uppercase opacity-80 tracking-wider">
              Total Saldo
            </span>
            <IconWallet size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              Rp {totalBalance.toLocaleString("id-ID")}
            </div>
            <p className="text-xs mt-1 opacity-70">
              {wallets?.length || 0} Dompet aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-green-50/30 dark:bg-green-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-green-600">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pemasukan Bulan Ini
            </span>
            <IconArrowUpRight size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              Rp {totalIncome.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-red-500">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pengeluaran Bulan Ini
            </span>
            <IconArrowDownRight size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              Rp {totalExpense.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Visualisasi & Transaksi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconReceipt className="text-muted-foreground" /> Statistik
              Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ExpenseChart data={chartData} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground italic border-2 border-dashed rounded-xl">
                Belum ada data transaksi bulan ini
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Kategori Terboros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartData
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    Rp {cat.value.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            {chartData.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">
                Data tidak tersedia
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="px-4 lg:px-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground text-sm">
            Analisa keuangan Anda secara real-time.
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[350px] rounded-xl" />
        <Skeleton className="lg:col-span-3 h-[350px] rounded-xl" />
      </div>
    </div>
  );
}
