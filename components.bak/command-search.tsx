"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet, Receipt, Tags, HandCoins, Plus } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [wallets, setWallets] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  // 1. Shortcut Listener (⌘+K atau Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 2. Fetch Data Pendukung
  React.useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const { data: w } = await supabase.from("wallets").select("*");
        const { data: c } = await supabase.from("categories").select("*");
        if (w) setWallets(w);
        if (c) setCategories(c);
      };
      fetchData();
    }
  }, [open, supabase]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Visual Trigger di Header (Optional) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex flex-1 items-center max-w-sm relative group"
      >
        <Search className="absolute left-3 size-4 text-muted-foreground group-hover:text-primary" />
        <div className="w-full bg-muted/50 border-none h-9 rounded-full pl-10 pr-4 text-sm flex items-center justify-between text-muted-foreground hover:bg-muted transition-all text-left">
          <span>Cari dompet atau kategori...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Ketik untuk mencari..." />
        <CommandList>
          <CommandEmpty>Hasil tidak ditemukan.</CommandEmpty>

          <CommandGroup heading="Navigasi Cepat">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Kembali ke Overview</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/transactions"))}
            >
              <Receipt className="mr-2 h-4 w-4" />
              <span>Lihat Semua Transaksi</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Dompet Saya">
            {wallets.map((wallet) => (
              <CommandItem
                key={wallet.id}
                onSelect={() => runCommand(() => router.push(`/wallets`))}
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>{wallet.name}</span>
                <span className="ml-auto text-xs opacity-60">
                  Rp {Number(wallet.balance).toLocaleString("id-ID")}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Kategori">
            {categories.map((cat) => (
              <CommandItem
                key={cat.id}
                onSelect={() => runCommand(() => router.push(`/categories`))}
              >
                <div
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
                <BadgeType type={cat.type} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function BadgeType({ type }: { type: string }) {
  return (
    <span
      className={`ml-auto text-[10px] px-1.5 rounded uppercase font-bold ${
        type === "expense"
          ? "bg-red-100 text-red-600"
          : "bg-green-100 text-green-600"
      }`}
    >
      {type === "expense" ? "Keluar" : "Masuk"}
    </span>
  );
}
