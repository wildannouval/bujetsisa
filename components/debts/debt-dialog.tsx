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
import { useTranslation } from "@/hooks/use-translation";
import { Debt } from "@/lib/types";
import { createDebt, updateDebt } from "@/lib/actions/debts";
import { getWallets } from "@/lib/actions/wallets";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, CalendarIcon, Link2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useRouter } from "next/navigation";

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

interface DebtDialogProps {
  debt?: Debt;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DebtDialog({ debt, open, onOpenChange }: DebtDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    debt?.due_date ? new Date(debt.due_date) : undefined,
  );
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    (debt as any)?.wallet_id || "",
  );

  const isEdit = !!debt;
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
    if (dueDate) {
      formData.set("due_date", dueDate.toISOString());
    }
    if (selectedWalletId) {
      formData.set("wallet_id", selectedWalletId);
    }

    try {
      let result;
      if (isEdit) {
        result = await updateDebt(debt.id, formData);
      } else {
        result = await createDebt(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? t.debts.update_success : t.debts.create_success);
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.debts.add_button}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.debts.edit_title : t.debts.add_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.debts.name_label}</Label>
              <Input
                name="name"
                defaultValue={debt?.name}
                placeholder="e.g., John Doe, Credit Card"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.amount_label}</Label>
              <CurrencyInput
                name="amount"
                defaultValue={debt?.amount}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.type_label}</Label>
              <Select name="type" defaultValue={debt?.type || "payable"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payable">
                    {t.debts.types.payable}
                  </SelectItem>
                  <SelectItem value="receivable">
                    {t.debts.types.receivable}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.status_label}</Label>
              <Select name="status" defaultValue={debt?.status || "unpaid"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">
                    {t.debts.status.unpaid}
                  </SelectItem>
                  <SelectItem value="paid">{t.debts.status.paid}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.due_date_label}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP")
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Wallet Link Section */}
            <div className="grid gap-2 p-3 bg-muted/50 rounded-lg border">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {t.debts.link_wallet || "Hubungkan ke Dompet"}
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
                      t.debts.select_wallet || "Pilih dompet (opsional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t.debts.no_wallet || "Tidak ada"}
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
                  {t.debts.wallet_info ||
                    "Saat dibayar, saldo dompet akan otomatis ter-update."}
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
