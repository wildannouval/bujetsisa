import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Komponen loading saat mengambil data dari Supabase
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Bagian Statistik Utama */}
          <Suspense fallback={<StatsLoading />}>
            <SectionCards />
          </Suspense>

          {/* Bagian Chart Visualisasi */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          {/* Bagian Transaksi Terakhir */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-lg text-sm">
                  Daftar transaksi akan muncul di sini setelah CRUD Transaksi
                  selesai.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
