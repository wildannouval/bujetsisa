"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Tags,
  CreditCard,
  PieChart,
  FileText,
  Settings,
  PlusCircle,
  Target,
  Banknote,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function AppSidebar({
  user: initialUser,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string };
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const user = initialUser || {
    name: "User",
    email: "user@example.com",
    avatar: "",
  };

  const navMain = [
    {
      title: t.nav.dashboard,
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t.nav.transactions,
      url: "/transactions",
      icon: Receipt,
    },
    {
      title: t.nav.wallets,
      url: "/wallets",
      icon: Wallet,
    },
    {
      title: t.nav.categories,
      url: "/categories",
      icon: Tags,
    },
  ];

  const navFinance = [
    {
      title: t.nav.debts,
      url: "/debts",
      icon: CreditCard,
    },
    {
      title: t.nav.goals,
      url: "/goals",
      icon: Target,
    },
    {
      title: t.nav.budgeting,
      url: "/budgeting",
      icon: PieChart,
    },
  ];

  const navTools = [
    {
      title: t.nav.reports,
      url: "/reports",
      icon: FileText,
    },
    {
      title: t.nav.settings,
      url: "/settings",
      icon: Settings,
    },
  ];

  const quickActions = [
    {
      title: t.sidebar.add_transaction,
      url: "/transactions",
      icon: Receipt,
      color: "text-green-600",
    },
    {
      title: t.sidebar.add_wallet,
      url: "/wallets",
      icon: Wallet,
      color: "text-blue-600",
    },
    {
      title: t.sidebar.add_budget,
      url: "/budgeting",
      icon: PieChart,
      color: "text-purple-600",
    },
    {
      title: t.sidebar.add_goal,
      url: "/goals",
      icon: Target,
      color: "text-orange-600",
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <Banknote className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">BujetSisa</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t.sidebar.tagline}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Quick Action Button */}
        <div className="px-2 py-2">
          <Dialog open={quickActionOpen} onOpenChange={setQuickActionOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" size="sm">
                <PlusCircle className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {t.sidebar.quick_add}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.sidebar.quick_add}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.url}
                    href={action.url}
                    onClick={() => setQuickActionOpen(false)}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-md"
                  >
                    <div className={`rounded-full bg-muted p-3`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {action.title}
                    </span>
                  </Link>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.menu}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Finance Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.finance}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navFinance.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.tools}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navTools.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
