import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { deleteDebt } from "@/lib/actions/debts";
import {
  IconUser,
  IconClock,
  IconMoneybagEdit,
  IconAlertCircle,
  IconArrowUpRight,
  IconArrowDownRight,
  IconInbox,
  IconCreditCard,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { CreateDebtDialog } from "@/components/create-debt-dialog";
import { DeleteButton } from "@/components/delete-button";
import { PaidDebtDialog } from "@/components/paid-debt-dialog";
import { BadDebtReport } from "@/components/bad-debt-report";

function getDueStatus(dateStr: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0)
    return {
      label: `Overdue ${Math.abs(diffDays)} Days`,
      color: "text-red-500",
      bg: "bg-red-500/10",
    };
  if (diffDays === 0)
    return {
      label: "Due Today",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    };
  return {
    label: `${diffDays} Days Left`,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  };
}

function DebtCard({ item, wallets }: { item: any; wallets: any[] }) {
  const isPaid = item.status === "paid";
  const total = Number(item.amount);
  const paid = Number(item.current_amount || 0);
  const remaining = total - paid;
  const percent = Math.min(Math.round((paid / total) * 100), 100);
  const dueStatus = getDueStatus(item.due_date);

  return (
    <div
      className={`group relative rounded-[2rem] border transition-all duration-500 hover:shadow-2xl overflow-hidden flex flex-col justify-between p-6 bg-card/40 backdrop-blur-xl ${isPaid ? "opacity-50 grayscale-[0.5]" : "border-border hover:border-indigo-500/40"}`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-3 text-left">
          <div
            className={`size-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isPaid ? "bg-muted text-muted-foreground" : "bg-indigo-600 text-white"}`}
          >
            <IconUser size={20} strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-black text-sm uppercase tracking-tight text-foreground truncate max-w-[120px]">
              {item.person_name}
            </h4>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 truncate max-w-[150px]">
              {item.description || "No Registry"}
            </p>
          </div>
        </div>
        <Badge
          variant={isPaid ? "secondary" : "outline"}
          className={`text-[8px] font-black uppercase tracking-widest ${!isPaid && "border-indigo-500/20 text-indigo-500 bg-indigo-500/5"}`}
        >
          {isPaid ? "Settled" : "Active"}
        </Badge>
      </div>

      <div className="mt-8 space-y-4 text-left relative z-10">
        <div className="space-y-1">
          <div className="flex justify-between items-end">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Remaining Residue
            </p>
            <span className="text-[10px] font-black text-foreground">
              {percent}%
            </span>
          </div>
          <p className="text-xl font-black tracking-tighter text-foreground tabular-nums">
            Rp {remaining.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="space-y-3">
          <Progress
            value={percent}
            className={`h-1 bg-muted ${isPaid ? "[&>div]:bg-slate-400" : "[&>div]:bg-indigo-600"}`}
          />
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
            <span>Paid: {paid.toLocaleString("id-ID")}</span>
            <span>Limit: {total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {!isPaid && dueStatus && (
          <div
            className={`flex items-center gap-2 p-2 rounded-xl border border-border/50 bg-background/30 ${dueStatus.color}`}
          >
            <IconClock size={12} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {dueStatus.label}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border/50">
          {!isPaid && <PaidDebtDialog item={item} wallets={wallets} />}
          <DeleteButton action={deleteDebt} id={item.id} label="Record" />
        </div>
      </div>
    </div>
  );
}

async function DebtsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [debtRes, walletRes] = await Promise.all([
    supabase
      .from("debts_loans")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user?.id)
      .order("name", { ascending: true }),
  ]);

  const items = debtRes.data || [];
  const wallets = walletRes.data || [];

  const totalReceivable = items
    .filter((i) => i.type === "receivable" && i.status === "pending")
    .reduce(
      (acc, curr) => acc + (Number(curr.amount) - Number(curr.current_amount)),
      0,
    );
  const totalDebt = items
    .filter((i) => i.type === "debt" && i.status === "pending")
    .reduce(
      (acc, curr) => acc + (Number(curr.amount) - Number(curr.current_amount)),
      0,
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 1. STRATEGIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 lg:px-0">
        <div className="relative group rounded-[2.5rem] border border-blue-500/20 bg-blue-600 p-8 text-white overflow-hidden shadow-2xl shadow-blue-500/20 transition-all">
          <IconArrowUpRight className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-2 text-blue-100">
            Collection Pool (Receivables)
          </p>
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter tabular-nums italic-none">
            Rp {totalReceivable.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="relative group rounded-[2.5rem] border border-red-500/20 bg-red-600 p-8 text-white overflow-hidden shadow-2xl shadow-red-500/20 transition-all">
          <IconArrowDownRight className="absolute right-[-10px] bottom-[-10px] size-32 opacity-10 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-2 text-red-100">
            Outstanding Obligations (Debts)
          </p>
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter tabular-nums italic-none">
            Rp {totalDebt.toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      {/* 2. RISK ANALYSIS (Bad Debt Report) */}
      <div className="px-4 lg:px-0">
        <BadDebtReport items={items} />
      </div>

      {/* 3. TABS REGISTRY */}
      <Tabs defaultValue="receivable" className="space-y-8">
        <div className="px-4 lg:px-0 flex flex-col md:flex-row gap-6 justify-between items-center">
          <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border w-fit h-12">
            <TabsTrigger
              value="receivable"
              className="rounded-xl px-8 py-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
            >
              Receivables
            </TabsTrigger>
            <TabsTrigger
              value="debt"
              className="rounded-xl px-8 py-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"
            >
              Liabilities
            </TabsTrigger>
          </TabsList>
          <CreateDebtDialog />
        </div>

        <TabsContent value="receivable" className="mt-0">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-0">
            {items
              .filter((i) => i.type === "receivable")
              .map((item) => (
                <DebtCard key={item.id} item={item} wallets={wallets} />
              ))}
            {items.filter((i) => i.type === "receivable").length === 0 && (
              <EmptyState label="Zero Collection Pool Detected" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="debt" className="mt-0">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-0">
            {items
              .filter((i) => i.type === "debt")
              .map((item) => (
                <DebtCard key={item.id} item={item} wallets={wallets} />
              ))}
            {items.filter((i) => i.type === "debt").length === 0 && (
              <EmptyState label="Zero Debt Obligations Found" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full py-24 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-30 space-y-4">
      <IconInbox size={64} strokeWidth={1} />
      <p className="text-sm font-black uppercase tracking-[0.4em]">{label}</p>
    </div>
  );
}

export default function DebtsPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8 w-full max-w-none text-left">
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="px-4 lg:px-0 space-y-2">
        <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3">
          Registry Audit
        </Badge>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
          <IconMoneybagEdit className="text-indigo-600 size-8" /> Strategic
          Debts
        </h2>
        <p className="text-sm text-muted-foreground font-medium italic-none">
          Manage collection pool and outstanding liabilities.
        </p>
      </div>

      <Suspense
        fallback={
          <Skeleton className="h-[600px] w-full rounded-[2.5rem] opacity-20" />
        }
      >
        <DebtsContent />
      </Suspense>
    </div>
  );
}
