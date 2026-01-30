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
  IconReceiptOff,
  IconHistory,
  IconDeviceAnalytics,
  IconReceipt2,
} from "@tabler/icons-react";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 lg:px-0">
        <div className="space-y-1 text-left">
          <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-0.5">
            Financial Records
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3 text-foreground">
            <IconHistory className="text-indigo-600 size-8" /> Ledger
          </h2>
          <p className="text-sm text-muted-foreground font-medium italic-none">
            Monitor and audit every capital movement in your system.
          </p>
        </div>
        <CreateTransactionDialog
          wallets={wallets || []}
          categories={categories || []}
        />
      </div>

      {/* CONTROL PANEL (FILTERS) */}
      <div className="px-4 lg:px-0">
        <TransactionFilters
          wallets={wallets || []}
          categories={categories || []}
        />
      </div>

      {/* LEDGER TABLE/LIST */}
      <div className="px-4 lg:px-0">
        <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Entity & Source
                  </th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Classification
                  </th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                    Value (IDR)
                  </th>
                  <th className="p-5 w-[100px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions?.map((tx: any) => {
                  const cat = tx.categories;
                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-5">
                        <p className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground tabular-nums">
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black uppercase tracking-tight text-foreground truncate max-w-[200px]">
                            {tx.description || "System Registry"}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 opacity-70 flex items-center gap-1">
                            <IconReceipt2 size={10} />{" "}
                            {tx.wallets?.name || "No Source"}
                          </p>
                        </div>
                      </td>
                      <td className="p-5">
                        {cat ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-black uppercase tracking-widest border-none px-2"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </Badge>
                        ) : (
                          <span className="text-[9px] font-black uppercase opacity-20 tracking-widest italic-none">
                            Unclassified
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <p
                          className={`text-base font-black tabular-nums ${tx.type === "expense" ? "text-red-500" : "text-green-500"}`}
                        >
                          {tx.type === "expense" ? "-" : "+"}{" "}
                          {Number(tx.amount).toLocaleString("id-ID")}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <EditTransactionDialog
                            transaction={tx}
                            wallets={wallets || []}
                            categories={categories || []}
                          />
                          <DeleteButton
                            action={deleteTransaction}
                            id={tx.id}
                            label="Transaction"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {transactions?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-20">
              <IconReceiptOff size={64} strokeWidth={1} />
              <div className="text-center space-y-1">
                <p className="text-sm font-black uppercase tracking-[0.4em]">
                  Zero Registry Found
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No matching transactions in this sector
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-6 py-6 md:py-8 w-full max-w-none">
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <Suspense
        fallback={
          <Skeleton className="h-[600px] w-full rounded-[2.5rem] opacity-20" />
        }
      >
        <TransactionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
