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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { Budget, Category } from "@/lib/types";
import { createBudget, updateBudget } from "@/lib/actions/budgets";
import { getWallets } from "@/lib/actions/wallets";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Link2 } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useRouter } from "next/navigation";

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

interface BudgetDialogProps {
  budget?: Budget;
  categories: Category[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BudgetDialog({
  budget,
  categories,
  open,
  onOpenChange,
}: BudgetDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    (budget as any)?.wallet_id || "",
  );

  const isEdit = !!budget;
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Load wallets when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadWallets();
    }
  }, [isOpen]);

  const loadWallets = async () => {
    const walletsData = await getWallets();
    setWallets(walletsData as Wallet[]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (selectedWalletId) {
      formData.set("wallet_id", selectedWalletId);
    }

    try {
      let result;
      if (isEdit) {
        result = await updateBudget(budget.id, formData);
      } else {
        result = await createBudget(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit ? t.budgeting.update_success : t.budgeting.create_success,
        );
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Filter only expense categories for budgeting
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.budgeting.add_button}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.budgeting.edit_title : t.budgeting.add_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.budgeting.category_label}</Label>
              <Select name="category_id" defaultValue={budget?.category_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No expense categories. Create one first.
                    </div>
                  ) : (
                    expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="mr-2">{c.icon}</span>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.budgeting.amount_label}</Label>
              <CurrencyInput
                name="amount"
                defaultValue={budget?.amount}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.budgeting.period_label}</Label>
              <Select name="period" defaultValue={budget?.period || "monthly"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    {t.budgeting.periods.weekly}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t.budgeting.periods.monthly}
                  </SelectItem>
                  <SelectItem value="yearly">
                    {t.budgeting.periods.yearly}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Wallet Link Section */}
            <div className="grid gap-2 p-3 bg-muted/50 rounded-lg border">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {t.budgeting.link_wallet || "Hubungkan ke Dompet"}
              </Label>
              <Select
                value={selectedWalletId || "none"}
                onValueChange={(val) =>
                  setSelectedWalletId(val === "none" ? "" : val)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t.budgeting.select_wallet || "Pilih dompet (opsional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t.budgeting.no_wallet || "Semua dompet"}
                  </SelectItem>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.icon} {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedWallet && (
                <p className="text-xs text-muted-foreground">
                  {t.budgeting.wallet_info ||
                    "Anggaran hanya menghitung transaksi dari dompet ini."}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
