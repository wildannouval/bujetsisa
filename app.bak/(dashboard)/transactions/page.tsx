import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { deleteTransaction } from "@/lib/actions/transactions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteButton } from "@/components/delete-button";
import { CreateTransactionDialog } from "@/components/create-transaction-dialog";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { TransactionFilters } from "@/components/transaction-filters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { History, Wallet, Search, PlusCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function TransactionsContent({ searchParams }: { searchParams: any }) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("name");
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("transactions")
    .select(`*, wallets(name), categories(name, color)`)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.search) query = query.ilike("description", `%${params.search}%`);
  if (params.wallet && params.wallet !== "all")
    query = query.eq("wallet_id", params.wallet);
  if (params.category && params.category !== "all")
    query = query.eq("category_id", params.category);

  const { data: transactions } = await query;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            Manage and track your financial records.
          </p>
        </div>
        <CreateTransactionDialog
          wallets={wallets || []}
          categories={categories || []}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Entries found</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ledger</CardTitle>
              <CardDescription>
                A detailed list of all your income and expenses.
              </CardDescription>
            </div>
            <TransactionFilters
              wallets={wallets || []}
              categories={categories || []}
            />
          </div>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => {
                  const cat = tx.categories;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {new Date(tx.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium block truncate max-w-[200px]">
                          {tx.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cat ? (
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">
                            Uncategorized
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Wallet className="h-3 w-3" />
                          {tx.wallets?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {tx.type === "income" ? "+" : "-"}{" "}
                        {Number(tx.amount).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <EditTransactionDialog
                            transaction={tx}
                            wallets={wallets || []}
                            categories={categories || []}
                          />
                          <DeleteButton
                            action={deleteTransaction}
                            id={tx.id}
                            label="item"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
              No transactions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransactionsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  );
}

function TransactionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
