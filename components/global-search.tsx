"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Tags,
  CreditCard,
  PieChart,
  Target,
  TrendingUp,
  RefreshCw,
  BarChart3,
  FileText,
  Settings,
  Search,
  Zap,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/lib/actions/search";
import { formatCurrency } from "@/lib/utils";

const PAGES = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaksi", href: "/transactions", icon: Receipt },
  { name: "Dompet", href: "/wallets", icon: Wallet },
  { name: "Kategori", href: "/categories", icon: Tags },
  { name: "Hutang & Piutang", href: "/debts", icon: CreditCard },
  { name: "Target Tabungan", href: "/goals", icon: Target },
  { name: "Anggaran", href: "/budgeting", icon: PieChart },
  { name: "Investasi", href: "/investments", icon: TrendingUp },
  { name: "Berulang", href: "/recurring", icon: RefreshCw },
  { name: "Net Worth", href: "/net-worth", icon: DollarSign },
  { name: "Catat Cepat", href: "/quick-add", icon: Zap },
  { name: "Analisis", href: "/analytics", icon: BarChart3 },
  { name: "Laporan", href: "/reports", icon: FileText },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    transactions: any[];
    wallets: any[];
    categories: any[];
    investments: any[];
  }>({ transactions: [], wallets: [], categories: [], investments: [] });
  const [searching, setSearching] = useState(false);

  // Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({
        transactions: [],
        wallets: [],
        categories: [],
        investments: [],
      });
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await globalSearch(query);
      setResults(res);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const filteredPages = PAGES.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const hasResults =
    results.transactions.length > 0 ||
    results.wallets.length > 0 ||
    results.categories.length > 0 ||
    results.investments.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Cari...</span>
        <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Cari halaman, transaksi, dompet..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {searching ? "Mencari..." : "Tidak ditemukan."}
          </CommandEmpty>

          {/* Pages */}
          {filteredPages.length > 0 && (
            <CommandGroup heading="Halaman">
              {filteredPages.map((page) => (
                <CommandItem
                  key={page.href}
                  onSelect={() => navigateTo(page.href)}
                >
                  <page.icon className="mr-2 h-4 w-4" />
                  {page.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Search Results */}
          {hasResults && <CommandSeparator />}

          {results.transactions.length > 0 && (
            <CommandGroup heading="Transaksi">
              {results.transactions.map((t: any) => {
                const cat = Array.isArray(t.category)
                  ? t.category[0]
                  : t.category;
                return (
                  <CommandItem
                    key={t.id}
                    onSelect={() => navigateTo("/transactions")}
                  >
                    <span className="mr-2">{cat?.icon || "📋"}</span>
                    <span className="flex-1 truncate">{t.description}</span>
                    <span
                      className={`text-sm font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, "IDR")}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {results.wallets.length > 0 && (
            <CommandGroup heading="Dompet">
              {results.wallets.map((w: any) => (
                <CommandItem
                  key={w.id}
                  onSelect={() => navigateTo(`/wallets/${w.id}`)}
                >
                  <span className="mr-2">{w.icon || "💵"}</span>
                  <span className="flex-1">{w.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(w.balance, "IDR")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.investments.length > 0 && (
            <CommandGroup heading="Investasi">
              {results.investments.map((inv: any) => (
                <CommandItem
                  key={inv.id}
                  onSelect={() => navigateTo(`/investments/${inv.id}`)}
                >
                  <span className="mr-2">{inv.icon || "📈"}</span>
                  <span className="flex-1">{inv.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(
                      Number(inv.quantity) * Number(inv.current_price),
                      "IDR",
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
