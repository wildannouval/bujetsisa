"use client";

import {
  Banknote,
  ChartPie,
  CreditCard,
  Gauge,
  HandCoins,
  ReceiptText,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Map string names to Lucide icon components
const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  wallet: Wallet,
  "receipt-text": ReceiptText,
  "chart-pie": ChartPie,
  banknote: Banknote,
  target: Target,
  "credit-card": CreditCard,
  "hand-coins": HandCoins,
};

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    iconName: string;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = ICONS[item.iconName] || Gauge;
        // Simple active state check: exact match or starts with url (for nested routes)
        const isActive =
          pathname === item.url || pathname.startsWith(`${item.url}/`);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link href={item.url}>
                <Icon />
                <span className="font-medium">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
