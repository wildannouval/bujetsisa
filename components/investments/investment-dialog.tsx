"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { createInvestment, updateInvestment } from "@/lib/actions/investments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Investment } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InvestmentDialogProps {
  investment?: Investment;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const INVESTMENT_TYPES = [
  { value: "stock", label: "Saham", icon: "📈" },
  { value: "mutual_fund", label: "Reksadana", icon: "📊" },
  { value: "crypto", label: "Kripto", icon: "₿" },
  { value: "bond", label: "Obligasi", icon: "📜" },
  { value: "property", label: "Properti", icon: "🏠" },
  { value: "gold", label: "Emas", icon: "🥇" },
  { value: "deposit", label: "Deposito", icon: "🏦" },
  { value: "other", label: "Lainnya", icon: "💰" },
];

const INVESTMENT_ICONS = [
  "📈",
  "📊",
  "₿",
  "📜",
  "🏠",
  "🥇",
  "🏦",
  "💰",
  "💵",
  "💴",
  "💶",
  "💷",
  "📉",
  "💹",
  "🪙",
  "💎",
  "🏢",
  "🏗️",
  "🏭",
  "🛢️",
  "⛽",
  "🔋",
  "☀️",
  "💊",
];

export function InvestmentDialog({
  investment,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InvestmentDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState(investment?.icon || "📈");

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isEdit = !!investment;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", icon);

    try {
      let result;
      if (isEdit) {
        result = await updateInvestment(investment.id, formData);
      } else {
        result = await createInvestment(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit
            ? "Investasi berhasil diperbarui"
            : "Investasi berhasil ditambahkan",
        );
        setOpen(false);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Investasi
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Investasi" : "Tambah Investasi Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi investasi Anda"
              : "Tambahkan aset investasi baru ke portofolio Anda"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Icon & Name Row */}
            <div className="flex gap-3">
              <div>
                <Label>Ikon</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-14 h-10 text-xl"
                    >
                      {icon}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="grid grid-cols-8 gap-1">
                      {INVESTMENT_ICONS.map((emoji) => (
                        <Button
                          key={emoji}
                          type="button"
                          variant={icon === emoji ? "default" : "ghost"}
                          className="h-8 w-8 p-0 text-lg"
                          onClick={() => setIcon(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label htmlFor="name">Nama Aset</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: BBCA, Bitcoin, Reksadana Pasar Uang"
                  defaultValue={investment?.name}
                  required
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">Jenis Investasi</Label>
              <Select name="type" defaultValue={investment?.type || "stock"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ticker */}
            <div>
              <Label htmlFor="ticker">Kode/Ticker (Opsional)</Label>
              <Input
                id="ticker"
                name="ticker"
                placeholder="Contoh: BBCA, BTC, RDPU"
                defaultValue={investment?.ticker || ""}
              />
            </div>

            {/* Quantity & Price - Only for new investments */}
            {!isEdit && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity">Jumlah Unit</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      placeholder="Contoh: 100"
                      defaultValue=""
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="avg_buy_price">
                      Harga Beli (Rata-rata)
                    </Label>
                    <Input
                      id="avg_buy_price"
                      name="avg_buy_price"
                      placeholder="Contoh: 8.000"
                      onChange={(e) => {
                        e.target.value = formatNumber(e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Current Price */}
            <div>
              <Label htmlFor="current_price">Harga Saat Ini</Label>
              <Input
                id="current_price"
                name="current_price"
                placeholder="Contoh: 8.500"
                defaultValue={
                  investment?.current_price
                    ? formatNumber(String(investment.current_price))
                    : ""
                }
                onChange={(e) => {
                  e.target.value = formatNumber(e.target.value);
                }}
              />
            </div>

            {/* Platform */}
            <div>
              <Label htmlFor="platform">Platform/Broker (Opsional)</Label>
              <Input
                id="platform"
                name="platform"
                placeholder="Contoh: Stockbit, Bibit, Tokopedia"
                defaultValue={investment?.platform || ""}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Catatan tambahan..."
                defaultValue={investment?.notes || ""}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
