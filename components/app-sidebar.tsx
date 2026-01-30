import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { IconCoin } from "@tabler/icons-react";
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

// Data menu tetap statis
const menuData = {
  mainNav: [{ title: "Dashboard", url: "/dashboard", iconName: "dashboard" }],
  financeNav: [
    { title: "Dompet & Saldo", url: "/wallets", iconName: "wallet" },
    { title: "Riwayat Transaksi", url: "/transactions", iconName: "receipt" },
    { title: "Analisis Bulanan", url: "/reports", iconName: "analytics" },
    { title: "Analitik Tahunan", url: "/analytics", iconName: "chart" },
    { title: "Kategori Pengeluaran", url: "/categories", iconName: "tags" },
    { title: "Hutang Piutang", url: "/debts", iconName: "money" },
    { title: "Budget & Goals", url: "/budgeting", iconName: "target" },
  ],
  supportNav: [
    { title: "Pengaturan", url: "/settings", iconName: "settings" },
    { title: "Pusat Bantuan", url: "/help", iconName: "help" },
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
                  <IconCoin className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-base font-bold tracking-tight uppercase">
                    bujetsisa
                  </span>
                  <span className="truncate text-[10px] uppercase opacity-60 font-medium tracking-widest font-mono">
                    Finance App
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest opacity-50">
            Utama
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <QuickTransactionDialog />
              </SidebarMenuItem>
            </SidebarMenu>
            <NavMain items={menuData.mainNav} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest opacity-50">
            Manajemen
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={menuData.financeNav} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <NavSecondary items={menuData.supportNav} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
