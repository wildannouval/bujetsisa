"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  MoreHorizontal,
  Trash,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Category, Transaction, Wallet } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useMemo } from "react";
import { deleteTransaction } from "@/lib/actions/transactions";
import { toast } from "sonner";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionFilters } from "./transaction-filters";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TransactionTableProps {
  transactions: any[];
  wallets: Wallet[];
  categories: Category[];
}

export function TransactionTable({
  transactions,
  wallets,
  categories,
}: TransactionTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingTransaction, setEditingTransaction] = useState<any | null>(
    null,
  );
  const [filters, setFilters] = useState({
    type: "all",
    walletId: "all",
    categoryId: "all",
    search: "",
  });

  // Client-side filtering for immediate response
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filters.type !== "all" && transaction.type !== filters.type) {
        return false;
      }
      if (
        filters.walletId !== "all" &&
        transaction.wallet_id !== filters.walletId
      ) {
        return false;
      }
      if (
        filters.categoryId !== "all" &&
        transaction.category_id !== filters.categoryId
      ) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const description = transaction.description?.toLowerCase() || "";
        const categoryName = transaction.category?.name?.toLowerCase() || "";
        if (
          !description.includes(searchLower) &&
          !categoryName.includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filters]);

  const handleDelete = async (id: string) => {
    if (confirm(t.common.confirm_delete)) {
      const result = await deleteTransaction(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t.transactions.delete_success);
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

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              {t.transactions.recent_transactions}
              <Badge variant="secondary">{filteredTransactions.length}</Badge>
            </CardTitle>
          </div>
          <TransactionFilters
            wallets={wallets}
            categories={categories}
            onFiltersChange={setFilters}
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    {t.transactions.date_label}
                  </TableHead>
                  <TableHead>{t.transactions.description_label}</TableHead>
                  <TableHead>{t.transactions.category_label}</TableHead>
                  <TableHead>{t.transactions.wallet_label}</TableHead>
                  <TableHead className="text-right">
                    {t.transactions.amount_label}
                  </TableHead>
                  <TableHead className="text-right w-[50px]">
                    {t.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {filters.search ||
                      filters.type !== "all" ||
                      filters.walletId !== "all" ||
                      filters.categoryId !== "all"
                        ? t.transactions.no_results
                        : t.transactions.no_transactions}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>
                            {format(new Date(transaction.date), "dd MMM")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {transaction.description || "-"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.type === "income" ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="h-3 w-3" />
                                {t.transactions.types.income}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <TrendingDown className="h-3 w-3" />
                                {t.transactions.types.expense}
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {transaction.category.icon}
                            </span>
                            <span className="text-sm">
                              {transaction.category.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {transaction.wallet?.icon}{" "}
                          {transaction.wallet?.name || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingTransaction(transaction)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(transaction.id)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {t.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingTransaction && (
        <TransactionDialog
          transaction={editingTransaction}
          wallets={wallets}
          categories={categories}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </>
  );
}
