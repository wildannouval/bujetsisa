import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  createDebtLoan,
  updateDebtStatus,
  deleteDebt,
} from "@/lib/actions/debts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconUser,
  IconCalendar,
  IconTrash,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Komponen Card untuk Item Hutang/Piutang
function DebtCard({ item }: { item: any }) {
  return (
    <Card
      className={`border-none shadow-sm ${item.status === "paid" ? "opacity-50 bg-muted/50" : "bg-card/50"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <IconUser size={18} />
            </div>
            <div>
              <CardTitle className="text-lg leading-none mb-1">
                {item.person_name}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {item.description || "Tanpa keterangan"}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={item.status === "paid" ? "outline" : "default"}
            className="text-[10px] uppercase tracking-wider"
          >
            {item.status === "paid" ? "Lunas" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold mb-4 tabular-nums">
          Rp {Number(item.amount).toLocaleString("id-ID")}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <IconClock size={14} />
            <span>Tempo: {item.due_date || "Selamanya"}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {item.status === "pending" && (
            <form
              action={async () => {
                "use server";
                await updateDebtStatus(item.id, "paid");
              }}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs font-medium text-green-600 border-green-200 hover:bg-green-50"
              >
                <IconCheck size={14} className="mr-1" /> Set Lunas
              </Button>
            </form>
          )}
          <form
            action={async () => {
              "use server";
              await deleteDebt(item.id);
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
            >
              <IconTrash size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

// 2. Komponen Pengambil Data (Async)
async function DebtsContent() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("debts_loans")
    .select("*")
    .order("created_at", { ascending: false });

  const debts = items?.filter((i) => i.type === "debt") || [];
  const receivables = items?.filter((i) => i.type === "receivable") || [];

  return (
    <Tabs defaultValue="receivable" className="px-4 lg:px-0">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
        <TabsTrigger value="receivable">
          Piutang ({receivables.length})
        </TabsTrigger>
        <TabsTrigger value="debt">Hutang ({debts.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="receivable" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receivables.map((item) => (
            <DebtCard key={item.id} item={item} />
          ))}
          {receivables.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl text-muted-foreground text-sm">
              Tidak ada catatan piutang.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="debt" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {debts.map((item) => (
            <DebtCard key={item.id} item={item} />
          ))}
          {debts.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl text-muted-foreground text-sm">
              Tidak ada catatan hutang.
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

// 3. Skeleton Loading
function DebtsSkeleton() {
  return (
    <div className="px-4 lg:px-0 space-y-8">
      <Skeleton className="h-10 w-[400px]" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// 4. Halaman Utama (Main Page)
export default function DebtsPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    await createDebtLoan(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="flex items-center justify-between px-4 lg:px-0 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Hutang & Piutang
          </h2>
          <p className="text-muted-foreground text-sm">
            Kelola pinjaman dan tagihan Anda.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-1 size-4" /> Catat Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Catat Hutang/Piutang</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <Select name="type" defaultValue="receivable">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">
                      Piutang (Teman pinjam saya)
                    </SelectItem>
                    <SelectItem value="debt">
                      Hutang (Saya pinjam orang)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input
                  name="person_name"
                  placeholder="Misal: Bella, Toko Berkah"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input name="amount" type="number" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Input name="due_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label>Keterangan Singkat</Label>
                <Input name="description" placeholder="Keperluan apa?" />
              </div>
              <Button type="submit" className="w-full">
                Simpan Catatan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={<DebtsSkeleton />}>
        <DebtsContent />
      </Suspense>
    </div>
  );
}
