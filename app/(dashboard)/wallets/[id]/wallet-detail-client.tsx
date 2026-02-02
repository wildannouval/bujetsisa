"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Transaction } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, TrendingDown, Edit } from "lucide-react";
import Link from "next/link";
import { WalletDialog } from "@/components/wallets/wallet-dialog";
import { useState } from "react";

interface WalletWithTransactions extends Wallet {
  transactions: (Transaction & {
    category?: { id: string; name: string; icon: string };
  })[];
}

interface WalletDetailClientProps {
  wallet: WalletWithTransactions;
}

const WALLET_GRADIENTS = {
  cash: "from-green-500 to-emerald-600",
  bank: "from-blue-500 to-indigo-600",
  ewallet: "from-purple-500 to-pink-600",
};

export function WalletDetailClient({ wallet }: WalletDetailClientProps) {
  const { t } = useTranslation();
  const [showEdit, setShowEdit] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
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

  const gradient = WALLET_GRADIENTS[wallet.type] || WALLET_GRADIENTS.cash;

  // Calculate income and expense for this wallet
  const income = wallet.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = wallet.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/wallets">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.wallets.wallet_detail}
        </h1>
      </div>

      {/* Wallet Header Card */}
      <Card className="overflow-hidden">
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
                {wallet.icon || "💵"}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{wallet.name}</h2>
                <p className="text-white/80">{getWalletTypeName()}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {t.common.edit}
            </Button>
          </div>
          <div className="mt-6">
            <p className="text-white/80 text-sm">{t.wallets.current_balance}</p>
            <p className="text-4xl font-bold">
              {formatCurrency(Number(wallet.balance))}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.income}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(income)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.expense}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expense)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>{t.wallets.transaction_history}</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t.wallets.no_transactions}
            </p>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                      {transaction.category?.icon ||
                        (transaction.type === "income" ? "💵" : "💸")}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.category?.name ||
                          transaction.description ||
                          t.transactions.types[transaction.type]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                    <Badge
                      variant={
                        transaction.type === "income"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {t.transactions.types[transaction.type]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WalletDialog
        wallet={wallet}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </div>
  );
}
