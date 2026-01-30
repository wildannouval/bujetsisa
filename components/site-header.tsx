import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { IconBell } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { CommandSearch } from "@/components/command-search"; // Import komponen baru

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[--header-height] w-full shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md">
      <div className="flex w-full items-center gap-2 px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Panggil CommandSearch di sini */}
        <CommandSearch />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-accent"
          >
            <IconBell size={20} className="text-muted-foreground" />
            <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-background shadow-sm" />
          </Button>
        </div>
      </div>
    </header>
  );
}
