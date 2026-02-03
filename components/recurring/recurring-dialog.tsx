"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createRecurringTransaction,
  updateRecurringTransaction,
  RecurringTransaction,
} from "@/lib/actions/recurring";
import { getWallets } from "@/lib/actions/wallets";
import { getCategories } from "@/lib/actions/categories";

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface RecurringDialogProps {
  recurring?: RecurringTransaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RecurringDialog({
  recurring,
  open,
  onOpenChange,
}: RecurringDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<"income" | "expense">(
    recurring?.type === "income" ? "income" : "expense",
  );

  const isEdit = !!recurring;
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Load wallets and categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [walletsData, categoriesData] = await Promise.all([
      getWallets(),
      getCategories(),
    ]);
    setWallets(walletsData as Wallet[]);
    setCategories(categoriesData as Category[]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (isEdit) {
        result = await updateRecurringTransaction(recurring.id, formData);
      } else {
        result = await createRecurringTransaction(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit
            ? "Transaksi berulang berhasil diperbarui"
            : "Transaksi berulang berhasil dibuat",
        );
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType,
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi Berulang
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {isEdit ? "Edit Transaksi Berulang" : "Tambah Transaksi Berulang"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                name="description"
                defaultValue={recurring?.description}
                placeholder="e.g., Netflix, Gaji Bulanan"
                required
              />
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label>Jumlah</Label>
              <CurrencyInput
                name="amount"
                defaultValue={recurring?.amount}
                required
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Select
                name="type"
                defaultValue={recurring?.type || "expense"}
                onValueChange={(val) =>
                  setSelectedType(val as "income" | "expense")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Wallet */}
            <div className="grid gap-2">
              <Label>Dompet</Label>
              <Select
                name="wallet_id"
                defaultValue={recurring?.wallet_id || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dompet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.icon} {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>Kategori (Opsional)</Label>
              <Select
                name="category_id"
                defaultValue={recurring?.category_id || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frequency */}
            <div className="grid gap-2">
              <Label>Frekuensi</Label>
              <Select
                name="frequency"
                defaultValue={recurring?.frequency || "monthly"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Next Date */}
            <div className="grid gap-2">
              <Label htmlFor="next_date">Tanggal Berikutnya</Label>
              <Input
                id="next_date"
                name="next_date"
                type="date"
                defaultValue={
                  recurring?.next_date || new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>

            {/* Active Status (for edit only) */}
            {isEdit && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  name="is_active"
                  defaultValue={recurring?.is_active ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
