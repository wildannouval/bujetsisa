"use client";

import React from "react";
import { IconSettings, IconHelp, IconMessageDots } from "@tabler/icons-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const ICONS: Record<string, any> = {
  settings: IconSettings,
  help: IconHelp,
  support: IconMessageDots,
};

export function NavSecondary({ items }: { items: any[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = ICONS[item.iconName] || IconHelp;
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild size="sm">
              <Link href={item.url}>
                <Icon size={16} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
