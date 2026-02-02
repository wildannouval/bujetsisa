"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Wallet } from "@/lib/types";
import { transferBetweenWallets } from "@/lib/actions/wallets";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface TransferDialogProps {
  wallets: Wallet[];
}

export function TransferDialog({ wallets }: TransferDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("from_wallet_id", fromWalletId);
    formData.set("to_wallet_id", toWalletId);

    try {
      const result = await transferBetweenWallets(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.wallets.transfer_success);
        setIsOpen(false);
        setFromWalletId("");
        setToWalletId("");
        router.refresh();
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (wallets.length < 2) {
    return null;
  }

  const fromWallet = wallets.find((w) => w.id === fromWalletId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          {t.wallets.transfer}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            {t.wallets.transfer_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.wallets.from_wallet}</Label>
            <Select value={fromWalletId} onValueChange={setFromWalletId}>
              <SelectTrigger>
                <SelectValue placeholder={t.wallets.select_wallet} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem
                    key={wallet.id}
                    value={wallet.id}
                    disabled={wallet.id === toWalletId}
                  >
                    <div className="flex items-center gap-2">
                      <span>{wallet.icon || "💵"}</span>
                      <span>{wallet.name}</span>
                      <span className="text-muted-foreground">
                        ({formatCurrency(Number(wallet.balance))})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fromWallet && (
              <p className="text-xs text-muted-foreground">
                {t.wallets.available_balance}:{" "}
                {formatCurrency(Number(fromWallet.balance))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.wallets.to_wallet}</Label>
            <Select value={toWalletId} onValueChange={setToWalletId}>
              <SelectTrigger>
                <SelectValue placeholder={t.wallets.select_wallet} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem
                    key={wallet.id}
                    value={wallet.id}
                    disabled={wallet.id === fromWalletId}
                  >
                    <div className="flex items-center gap-2">
                      <span>{wallet.icon || "💵"}</span>
                      <span>{wallet.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.wallets.transfer_amount}</Label>
            <CurrencyInput name="amount" placeholder="0" required />
          </div>

          <div className="space-y-2">
            <Label>{t.wallets.transfer_description}</Label>
            <Input
              name="description"
              placeholder={t.wallets.transfer_description_placeholder}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !fromWalletId || !toWalletId}
          >
            {isLoading ? t.common.saving : t.wallets.transfer}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
