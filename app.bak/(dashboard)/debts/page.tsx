import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CreateDebtDialog } from "@/components/create-debt-dialog";
import { PaidDebtDialog } from "@/components/paid-debt-dialog";
import { deleteDebt } from "@/lib/actions/debts";
import { DeleteButton } from "@/components/delete-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { BadDebtReport } from "@/components/bad-debt-report";

async function DebtsContent() {
  const supabase = await createClient();

  const [{ data: debts }, { data: wallets }] = await Promise.all([
    supabase
      .from("debts_loans")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("wallets").select("*").order("name"),
  ]);

  const activeDebts = debts?.filter((d) => d.status === "pending") || [];
  const paidDebts = debts?.filter((d) => d.status === "paid") || [];

  const totalReceivables = activeDebts
    .filter((d) => d.type === "receivable")
    .reduce(
      (acc, curr) => acc + (Number(curr.amount) - Number(curr.current_amount)),
      0,
    );
  const totalPayables = activeDebts
    .filter((d) => d.type === "debt")
    .reduce(
      (acc, curr) => acc + (Number(curr.amount) - Number(curr.current_amount)),
      0,
    );

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Debts & Loans</h2>
          <p className="text-muted-foreground">
            Track who owes you and who you owe.
          </p>
        </div>
        <CreateDebtDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receivables (You're owed)
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              Rp {totalReceivables.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payables (You owe)
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              Rp {totalPayables.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger
            value="bad_debt"
            className="text-red-500 data-[state=active]:text-red-600"
          >
            Bad Debt
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Records</CardTitle>
              <CardDescription>
                Ongoing debts and loans to be settled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeDebts.length > 0 ? (
                <DebtsTable
                  debts={activeDebts}
                  wallets={wallets || []}
                  active
                />
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No active debts found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Settled History</CardTitle>
              <CardDescription>Completed payments.</CardDescription>
            </CardHeader>
            <CardContent>
              {paidDebts.length > 0 ? (
                <DebtsTable debts={paidDebts} wallets={wallets || []} />
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No history found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bad_debt">
          <BadDebtReport items={debts || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DebtsTable({
  debts,
  wallets,
  active,
}: {
  debts: any[];
  wallets: any[];
  active?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Person/Entity</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Due Date</TableHead>
          {active && <TableHead className="text-right">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {debts.map((debt) => (
          <TableRow key={debt.id}>
            <TableCell className="font-medium">{debt.person_name}</TableCell>
            <TableCell>
              <Badge
                variant={debt.type === "receivable" ? "default" : "destructive"}
              >
                {debt.type === "receivable" ? "Lent" : "Borrowed"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>Rp {Number(debt.amount).toLocaleString("id-ID")}</span>
                {active && Number(debt.current_amount) > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Paid: {Number(debt.current_amount).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {debt.due_date
                ? new Date(debt.due_date).toLocaleDateString()
                : "-"}
            </TableCell>
            {active && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <PaidDebtDialog item={debt} wallets={wallets} />
                  <DeleteButton
                    action={deleteDebt}
                    id={debt.id}
                    label="Record"
                  />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DebtsPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 flex md:flex">
      <Suspense fallback={<DebtsSkeleton />}>
        <DebtsContent />
      </Suspense>
    </div>
  );
}

function DebtsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
