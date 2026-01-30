import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/lib/actions/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDialog } from "@/components/category-dialog";
import { DeleteButton } from "@/components/delete-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconTags,
  IconTrendingUp,
  IconTrendingDown,
  IconTargetArrow,
  IconInbox,
  IconCategory,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

function CategoryCard({ cat, spent }: { cat: any; spent: number }) {
  const limit = Number(cat.monthly_limit) || 0;
  const hasLimit = limit > 0;
  const remaining = limit - spent;
  const percent = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = hasLimit && spent > limit;
  const isWarning = percent > 80 && !isOver;

  return (
    <div
      className={`group relative rounded-[2rem] border transition-all duration-500 hover:shadow-2xl overflow-hidden flex flex-col justify-between p-6 bg-card/40 backdrop-blur-xl ${
        isOver
          ? "border-red-500/50 shadow-red-500/5"
          : "border-border hover:border-indigo-500/40"
      }`}
    >
      {/* Visual Accent */}
      <div
        className="absolute top-0 left-0 w-full h-1 opacity-50"
        style={{ backgroundColor: cat.color }}
      />
      <div
        className="absolute -right-4 -top-4 size-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: cat.color }}
      />

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-3 text-left">
          <div
            className="size-10 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
            style={{ backgroundColor: cat.color }}
          >
            <span className="font-black text-sm">
              {cat.name.substring(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="space-y-0.5">
            <h4 className="font-black text-sm uppercase tracking-tight text-foreground truncate max-w-[120px]">
              {cat.name}
            </h4>
            <Badge
              variant="outline"
              className="text-[8px] font-black uppercase tracking-widest border-border opacity-60"
            >
              {cat.type === "expense" ? "Outflow Sector" : "Inflow Sector"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <CategoryDialog category={cat} />
          <DeleteButton action={deleteCategory} id={cat.id} label="Sector" />
        </div>
      </div>

      <div className="mt-8 space-y-4 text-left relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Current Usage
            </p>
            <p
              className={`text-lg font-black tracking-tighter tabular-nums ${isOver ? "text-red-500" : "text-foreground"}`}
            >
              Rp {spent.toLocaleString("id-ID")}
            </p>
          </div>
          {hasLimit && (
            <span
              className={`text-[10px] font-black tracking-widest uppercase ${isOver ? "text-red-500" : "text-indigo-500"}`}
            >
              {Math.round(percent)}%
            </span>
          )}
        </div>

        {hasLimit ? (
          <div className="space-y-2">
            <Progress
              value={percent}
              className={`h-1.5 bg-muted ${isOver ? "[&>div]:bg-red-500" : isWarning ? "[&>div]:bg-orange-500" : "[&>div]:bg-indigo-500"}`}
            />
            <div
              className={`flex justify-between items-center p-2 rounded-xl border border-border/50 bg-background/30`}
            >
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                {isOver ? "Deficit" : "Allowance Left"}
              </span>
              <span
                className={`text-[9px] font-black tabular-nums ${isOver ? "text-red-500" : "text-green-500"}`}
              >
                Rp {Math.abs(remaining).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-1.5 w-full bg-muted/30 rounded-full" />
        )}
      </div>
    </div>
  );
}

async function CategoriesContent() {
  const supabase = await createClient();
  const now = new Date();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  const { data: monthTxs } = await supabase
    .from("transactions")
    .select("category_id, amount, type")
    .gte("date", firstDayOfMonth);

  const expenseCats = categories?.filter((c) => c.type === "expense") || [];
  const incomeCats = categories?.filter((c) => c.type === "income") || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 lg:px-0">
        <div className="space-y-2 text-left">
          <Badge className="bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3">
            Classification
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <IconCategory className="text-indigo-600 size-8" /> Sectors
          </h2>
          <p className="text-sm text-muted-foreground font-medium italic-none">
            Define and regulate your financial classifications.
          </p>
        </div>
        <CategoryDialog />
      </div>

      <Tabs defaultValue="expense" className="space-y-8">
        <div className="px-4 lg:px-0">
          <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border w-fit">
            <TabsTrigger
              value="expense"
              className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all gap-2"
            >
              <IconTrendingDown size={14} strokeWidth={3} /> Outflow
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all gap-2"
            >
              <IconTrendingUp size={14} strokeWidth={3} /> Inflow
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="expense" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-0">
            {expenseCats.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                spent={
                  monthTxs
                    ?.filter(
                      (tx) =>
                        tx.category_id === cat.id && tx.type === "expense",
                    )
                    .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
                }
              />
            ))}
            {expenseCats.length === 0 && (
              <EmptyState label="No expense sectors defined" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-0">
            {incomeCats.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                spent={
                  monthTxs
                    ?.filter(
                      (tx) => tx.category_id === cat.id && tx.type === "income",
                    )
                    .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
                }
              />
            ))}
            {incomeCats.length === 0 && (
              <EmptyState label="No inflow sectors defined" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full py-32 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-30 space-y-4">
      <IconInbox size={64} strokeWidth={1} />
      <div className="space-y-1">
        <p className="text-sm font-black uppercase tracking-[0.4em]">{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest italic-none">
          Initialize your first sector to begin
        </p>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-8 py-8 w-full max-w-none">
      {/* Background Backlights */}
      <div className="fixed top-0 left-[-10%] size-[600px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10%] size-[600px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-8 px-4 lg:px-0">
      <div className="flex justify-between items-end mb-10">
        <Skeleton className="h-20 w-64 rounded-2xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}
