"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "@/lib/types";
import {
  MoreVertical,
  Pencil,
  Trash,
  Eye,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { WalletDialog } from "./wallet-dialog";
import { useState } from "react";
import { deleteWallet } from "@/lib/actions/wallets";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WalletWithStats extends Wallet {
  monthlyIncome?: number;
  monthlyExpense?: number;
  transactionCount?: number;
  lastTransaction?: {
    amount: number;
    type: string;
    date: string;
    description?: string;
    category?: { name: string; icon: string } | null;
  } | null;
}

interface WalletCardProps {
  wallet: WalletWithStats;
  showDetails?: boolean;
}

const WALLET_GRADIENTS = {
  cash: "from-green-500 to-emerald-600",
  bank: "from-blue-500 to-indigo-600",
  ewallet: "from-purple-500 to-pink-600",
};

export function WalletCard({ wallet, showDetails = true }: WalletCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (confirm(t.common.confirm_delete)) {
      const result = await deleteWallet(wallet.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t.wallets.delete_success);
        router.refresh();
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount || 0);
  };

  const getWalletTypeName = () => {
    switch (wallet.type) {
      case "bank":
        return t.wallets.types.bank;
      case "ewallet":
        return t.wallets.types.ewallet;
      default:
        return t.wallets.types.cash;
    }
  };

  const gradient =
    WALLET_GRADIENTS[wallet.type as keyof typeof WALLET_GRADIENTS] ||
    WALLET_GRADIENTS.cash;

  const monthlyNet = (wallet.monthlyIncome || 0) - (wallet.monthlyExpense || 0);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={`bg-gradient-to-r ${gradient} p-3 sm:p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 text-xl sm:text-2xl">
                {wallet.icon || "💵"}
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  {wallet.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/80">
                  {getWalletTypeName()}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/wallets/${wallet.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t.wallets.view_details}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t.common.edit}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Balance */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t.wallets.balance_label}
              </p>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {formatCurrency(Number(wallet.balance))}
              </p>
            </div>

            {/* Monthly Stats */}
            {showDetails &&
              (wallet.monthlyIncome !== undefined ||
                wallet.monthlyExpense !== undefined) && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t.wallets.income_this_month}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        +{formatCurrencyCompact(wallet.monthlyIncome || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t.wallets.expense_this_month}
                      </p>
                      <p className="text-sm font-medium text-red-600">
                        -{formatCurrencyCompact(wallet.monthlyExpense || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Last Transaction */}
            {showDetails && wallet.lastTransaction && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  {t.wallets.last_transaction}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {wallet.lastTransaction.category?.icon ||
                        (wallet.lastTransaction.type === "income"
                          ? "💰"
                          : "💸")}
                    </span>
                    <span className="text-sm truncate max-w-[120px]">
                      {wallet.lastTransaction.category?.name ||
                        wallet.lastTransaction.description ||
                        (wallet.lastTransaction.type === "income"
                          ? "Pemasukan"
                          : "Pengeluaran")}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${wallet.lastTransaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {wallet.lastTransaction.type === "income" ? "+" : "-"}
                    {formatCurrencyCompact(wallet.lastTransaction.amount)}
                  </span>
                </div>
              </div>
            )}

            {/* View Details Link */}
            {showDetails && (
              <div className="pt-3 border-t">
                <Link
                  href={`/wallets/${wallet.id}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {t.wallets.view_transactions}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <WalletDialog
        wallet={wallet}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  );
}
