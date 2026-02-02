import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { Coins } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const data = {
  navMain: [{ title: "Dashboard", url: "/dashboard", iconName: "gauge" }],
  navFinance: [
    { title: "Dompet & Saldo", url: "/wallets", iconName: "wallet" },
    {
      title: "Riwayat Transaksi",
      url: "/transactions",
      iconName: "receipt-text",
    },
    { title: "Analisis Bulanan", url: "/reports", iconName: "chart-pie" },
    { title: "Analitik Tahunan", url: "/analytics", iconName: "banknote" },
    { title: "Kategori Pengeluaran", url: "/categories", iconName: "target" },
    { title: "Hutang Piutang", url: "/debts", iconName: "credit-card" },
    { title: "Budget & Goals", url: "/budgeting", iconName: "hand-coins" },
  ],
  navSupport: [
    { title: "Pengaturan", url: "/settings", iconName: "settings" },
    { title: "Pusat Bantuan", url: "/help", iconName: "life-buoy" },
  ],
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // connection() memicu dynamic rendering, jadi harus ada di bawah Suspense
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user?.id)
    .single();

  const userData = {
    name: profile?.full_name || "User Bujetsisa",
    email: user?.email || "",
    // Tambahkan timestamp agar cache-busting foto profil bekerja
    avatar: profile?.avatar_url ? `${profile.avatar_url}&t=${Date.now()}` : "",
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg font-bold">
                  <Coins className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight text-sidebar-foreground">
                  <span className="truncate font-semibold uppercase tracking-tight">
                    bujetsisa
                  </span>
                  <span className="truncate text-xs text-muted-foreground opacity-70">
                    Finance App
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* QUICK ACTION */}
        <SidebarGroup>
          <SidebarGroupContent>
            <QuickTransactionDialog />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.navMain} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manajemen Keuangan</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.navFinance} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <NavSecondary items={data.navSupport} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
