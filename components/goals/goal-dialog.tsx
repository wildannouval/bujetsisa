"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Goal } from "@/lib/types";
import { createGoal, updateGoal } from "@/lib/actions/goals";
import { getWallets } from "@/lib/actions/wallets";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Target, Link2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GOAL_ICONS = [
  "🎯",
  "🏠",
  "🚗",
  "✈️",
  "💰",
  "📱",
  "💻",
  "🎓",
  "💍",
  "🏥",
  "👶",
  "🎁",
];

interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
}

interface GoalDialogProps {
  goal?: Goal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GoalDialog({ goal, open, onOpenChange }: GoalDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(goal?.icon || "🎯");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    (goal as any)?.wallet_id || "",
  );

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  // Load wallets when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      loadWallets();
    }
  }, [dialogOpen]);

  const loadWallets = async () => {
    const walletsData = await getWallets();
    setWallets(walletsData as Wallet[]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", selectedIcon);
    if (selectedWalletId) {
      formData.set("wallet_id", selectedWalletId);
    }

    try {
      const result = goal
        ? await updateGoal(goal.id, formData)
        : await createGoal(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(goal ? t.goals.update_success : t.goals.create_success);
        setDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!goal && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.goals.add_goal}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {goal ? t.goals.edit_goal : t.goals.add_goal}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.goals.icon_label}</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((icon) => (
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

          <div className="space-y-2">
            <Label htmlFor="name">{t.goals.name_label}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={goal?.name}
              placeholder={t.goals.name_placeholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">{t.goals.target_amount_label}</Label>
            <CurrencyInput
              name="target_amount"
              defaultValue={goal?.target_amount}
              placeholder="0"
              required
            />
          </div>

          {/* Wallet Link Section */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
            <Label className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              {t.goals.link_wallet || "Hubungkan ke Dompet"}
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
                    t.goals.select_wallet || "Pilih dompet (opsional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t.goals.no_wallet || "Tidak ada (Manual)"}
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
                {t.goals.wallet_info ||
                  "Progress akan otomatis sinkron dengan saldo dompet ini."}
              </p>
            )}
          </div>

          {/* Only show current amount if no wallet is linked */}
          {!selectedWalletId && (
            <div className="space-y-2">
              <Label htmlFor="current_amount">
                {t.goals.current_amount_label}
              </Label>
              <CurrencyInput
                name="current_amount"
                defaultValue={goal?.current_amount}
                placeholder="0"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target_date">{t.goals.target_date_label}</Label>
            <Input
              id="target_date"
              name="target_date"
              type="date"
              defaultValue={goal?.target_date?.split("T")[0]}
            />
          </div>

          {goal && (
            <div className="space-y-2">
              <Label htmlFor="status">{t.goals.status_label}</Label>
              <Select name="status" defaultValue={goal.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t.goals.status_active}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t.goals.status_completed}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t.goals.status_cancelled}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.common.saving : t.common.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
