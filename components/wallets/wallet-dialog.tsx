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
import { Wallet } from "@/lib/types";
import { createWallet, updateWallet } from "@/lib/actions/wallets";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useRouter } from "next/navigation";

const WALLET_ICONS = [
  "💵",
  "💰",
  "🏦",
  "💳",
  "🪙",
  "💎",
  "📱",
  "🔐",
  "🏧",
  "💴",
  "💶",
  "💷",
];

interface WalletDialogProps {
  wallet?: Wallet;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WalletDialog({
  wallet,
  open,
  onOpenChange,
}: WalletDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(wallet?.icon || "💵");
  const [currency, setCurrency] = useState(wallet?.currency || "IDR");

  const isEdit = !!wallet;
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", selectedIcon);
    formData.set("currency", currency);

    try {
      let result;
      if (isEdit) {
        result = await updateWallet(wallet.id, formData);
      } else {
        result = await createWallet(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit ? t.wallets.update_success : t.wallets.create_success,
        );
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.wallets.add_button}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.wallets.edit_title : t.wallets.add_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.wallets.icon_label}</Label>
              <div className="flex flex-wrap gap-2">
                {WALLET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 text-xl rounded-md border-2 transition-colors ${
                      selectedIcon === icon
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:border-muted"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t.wallets.name_label}</Label>
              <Input
                name="name"
                defaultValue={wallet?.name}
                placeholder={t.wallets.name_placeholder}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.wallets.type_label}</Label>
              <Select name="type" defaultValue={wallet?.type || "cash"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.wallets.types.cash}</SelectItem>
                  <SelectItem value="bank">{t.wallets.types.bank}</SelectItem>
                  <SelectItem value="ewallet">
                    {t.wallets.types.ewallet}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.wallets.balance_label}</Label>
              <CurrencyInput
                name="balance"
                defaultValue={wallet?.balance}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Mata Uang</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">🇮🇩 IDR - Rupiah</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD - Dollar</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                  <SelectItem value="SGD">🇸🇬 SGD - Singapore Dollar</SelectItem>
                  <SelectItem value="JPY">🇯🇵 JPY - Yen</SelectItem>
                  <SelectItem value="MYR">🇲🇾 MYR - Ringgit</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP - Pound</SelectItem>
                  <SelectItem value="AUD">
                    🇦🇺 AUD - Australian Dollar
                  </SelectItem>
                  <SelectItem value="CNY">🇨🇳 CNY - Yuan</SelectItem>
                  <SelectItem value="KRW">🇰🇷 KRW - Won</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.saving : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
