"use client";

import React from "react";
import { Settings, LifeBuoy, type LucideIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Map string names to Lucide icon components
const ICONS: Record<string, LucideIcon> = {
  settings: Settings,
  "life-buoy": LifeBuoy,
};

export function NavSecondary({
  items,
  className,
}: {
  items: {
    title: string;
    url: string;
    iconName: string;
  }[];
  className?: string;
}) {
  return (
    <SidebarMenu className={className}>
      {items.map((item) => {
        const Icon = ICONS[item.iconName] || LifeBuoy;
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild size="sm">
              <Link href={item.url}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
