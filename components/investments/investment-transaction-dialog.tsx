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
import { addInvestmentTransaction } from "@/lib/actions/investments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Investment } from "@/lib/types";

interface InvestmentTransactionDialogProps {
  investment: Investment;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InvestmentTransactionDialog({
  investment,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InvestmentTransactionDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("buy");

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("investment_id", investment.id);

    try {
      const result = await addInvestmentTransaction(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi berhasil dicatat");
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
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Catat Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Catat Transaksi</DialogTitle>
          <DialogDescription>
            Catat pembelian, penjualan, atau dividen untuk {investment.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Type */}
            <div>
              <Label htmlFor="type">Jenis Transaksi</Label>
              <Select name="type" value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">🟢 Beli</SelectItem>
                  <SelectItem value="sell">🔴 Jual</SelectItem>
                  <SelectItem value="dividend">💰 Dividen</SelectItem>
                  <SelectItem value="stock_split">✂️ Stock Split</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">
                {type === "stock_split"
                  ? "Rasio Split (misal: 2 untuk 1:2)"
                  : "Jumlah Unit"}
              </Label>
              <Input
                id="quantity"
                name="quantity"
                placeholder={
                  type === "stock_split" ? "Contoh: 2" : "Contoh: 100"
                }
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">
                {type === "dividend" ? "Total Dividen" : "Harga per Unit"}
              </Label>
              <Input
                id="price"
                name="price"
                placeholder="Contoh: 8.500"
                onChange={(e) => {
                  e.target.value = formatNumber(e.target.value);
                }}
                required
              />
            </div>

            {/* Fees */}
            {type !== "dividend" && type !== "stock_split" && (
              <div>
                <Label htmlFor="fees">Biaya Transaksi (Opsional)</Label>
                <Input
                  id="fees"
                  name="fees"
                  placeholder="Contoh: 15.000"
                  onChange={(e) => {
                    e.target.value = formatNumber(e.target.value);
                  }}
                />
              </div>
            )}

            {/* Date */}
            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Catatan tambahan..."
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
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
