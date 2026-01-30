"use client";

import {
  IconDashboard,
  IconWallet,
  IconReceipt2,
  IconTags,
  IconMoneybagEdit,
  IconTarget,
  IconChartBar,
  IconFileAnalytics,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// MAP STRING KE KOMPONEN
const ICONS: Record<string, any> = {
  dashboard: IconDashboard,
  wallet: IconWallet,
  receipt: IconReceipt2,
  analytics: IconFileAnalytics,
  chart: IconChartBar,
  tags: IconTags,
  money: IconMoneybagEdit,
  target: IconTarget,
  settings: IconSettings,
  help: IconHelp,
};

export function NavMain({ items }: { items: any[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = ICONS[item.iconName] || IconDashboard;
        const isActive = pathname === item.url;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link href={item.url}>
                <Icon size={18} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
