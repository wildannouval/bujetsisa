import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "280px",
          "--header-height": "64px",
        } as React.CSSProperties
      }
    >
      {/* 1. Suspense untuk Sidebar */}
      <Suspense
        fallback={<div className="w-[280px] h-screen bg-sidebar border-r" />}
      >
        <AppSidebar />
      </Suspense>

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* 2. Suspense untuk Page Content (PENTING!) */}
          <Suspense
            fallback={<Skeleton className="w-full h-[500px] rounded-2xl" />}
          >
            {children}
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
