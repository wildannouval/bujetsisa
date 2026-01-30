"use client";

import * as React from "react";
import {
  IconCirclePlusFilled,
  IconCoin,
  IconCalendar,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { createTransaction } from "@/lib/actions/transactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { toast } from "sonner";

export function QuickTransactionDialog() {
  const [open, setOpen] = React.useState(false);
  const [wallets, setWallets] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [type, setType] = React.useState("expense");
  const [displayAmount, setDisplayAmount] = React.useState("");
  const supabase = createClient();

  // Shortcut Keyboard
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;
      if (isTyping) return;
      if (e.key.toLowerCase() === "t" || e.key.toLowerCase() === "c") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Data
  React.useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const { data: w } = await supabase
          .from("wallets")
          .select("*")
          .order("name");
        const { data: c } = await supabase
          .from("categories")
          .select("*")
          .order("name");
        if (w) setWallets(w);
        if (c) setCategories(c);
      };
      fetchData();
    }
  }, [open, supabase]);

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(formData: FormData) {
    const rawAmount = displayAmount.replace(/\./g, "");
    formData.set("amount", rawAmount);
    formData.set("type", type);

    toast.promise(createTransaction(formData), {
      loading: "Menyimpan transaksi...",
      success: (result) => {
        if (result?.error) throw new Error(result.error);
        setOpen(false);
        setDisplayAmount("");
        return "Berhasil mencatat transaksi!";
      },
      error: (err) => `Gagal: ${err.message}`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip="Quick Create"
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 min-w-8 shadow-md group"
        >
          <IconCirclePlusFilled className="size-5" />
          <span className="font-bold uppercase tracking-tight text-[11px]">
            Quick Create
          </span>
          <kbd className="ml-auto hidden rounded border bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-bold sm:flex">
            T
          </kbd>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
            <IconCoin className="text-primary size-6" /> Quick Transaction
          </DialogTitle>
          <DialogDescription className="text-xs font-medium">
            Catat aktivitas keuangan Anda secara kilat.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">
                Tipe
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="expense"
                    className="text-red-500 font-bold"
                  >
                    Pengeluaran
                  </SelectItem>
                  <SelectItem
                    value="income"
                    className="text-green-600 font-bold"
                  >
                    Pemasukan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">
                Nominal (Rp)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground opacity-50">
                  Rp
                </span>
                <Input
                  value={displayAmount}
                  onChange={(e) =>
                    setDisplayAmount(formatNumber(e.target.value))
                  }
                  className="pl-9 font-mono font-bold"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">
                Dompet
              </Label>
              <Select name="wallet_id" required>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Pilih Dompet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase opacity-60">
                Kategori
              </Label>
              <Select name="category_id">
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {filteredCategories.length === 0 && (
                    <SelectItem value="none" disabled>
                      Buat kategori dulu
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase opacity-60">
              Keterangan
            </Label>
            <Input
              name="description"
              placeholder="Deskripsi singkat..."
              className="font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase opacity-60 flex items-center gap-1">
              <IconCalendar size={12} /> Tanggal Transaksi
            </Label>
            <Input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="font-medium"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-black uppercase tracking-tighter h-12 shadow-lg shadow-primary/20 text-lg"
          >
            Simpan Transaksi
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
