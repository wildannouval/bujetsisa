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
  IconHandStop,
  IconUser,
  IconCalendar,
  IconTrash,
  IconCheck,
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

export default async function DebtsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("debts_loans")
    .select("*")
    .order("created_at", { ascending: false });

  const debts = items?.filter((i) => i.type === "debt") || [];
  const receivables = items?.filter((i) => i.type === "receivable") || [];

  async function handleCreate(formData: FormData) {
    "use server";
    await createDebtLoan(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="flex items-center justify-between px-4 lg:px-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hutang & Piutang
          </h2>
          <p className="text-muted-foreground text-sm">
            Catat pinjaman agar keuangan tetap sehat.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-2 size-4" /> Catat Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Hutang/Piutang</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select name="type" defaultValue="receivable">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">
                      Piutang (Orang pinjam ke saya)
                    </SelectItem>
                    <SelectItem value="debt">
                      Hutang (Saya pinjam ke orang)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nama Orang</Label>
                <Input
                  name="person_name"
                  placeholder="Nama teman / instansi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input name="amount" type="number" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo (Opsional)</Label>
                <Input name="due_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input name="description" placeholder="Misal: Iuran futsal" />
              </div>
              <Button type="submit" className="w-full">
                Simpan Catatan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="receivable" className="px-4 lg:px-0">
        <TabsList>
          <TabsTrigger value="receivable">
            Piutang ({receivables.length})
          </TabsTrigger>
          <TabsTrigger value="debt">Hutang ({debts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="receivable" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {receivables.map((item) => (
              <DebtCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="debt" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {debts.map((item) => (
              <DebtCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DebtCard({ item }: { item: any }) {
  return (
    <Card className={item.status === "paid" ? "opacity-60 bg-muted/30" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <IconUser size={18} className="text-muted-foreground" />
            <CardTitle className="text-lg">{item.person_name}</CardTitle>
          </div>
          <Badge variant={item.status === "paid" ? "outline" : "default"}>
            {item.status === "paid" ? "Lunas" : "Belum Lunas"}
          </Badge>
        </div>
        <CardDescription>
          {item.description || "Tanpa keterangan"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold mb-4">
          Rp {Number(item.amount).toLocaleString("id-ID")}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <IconCalendar size={14} />
            <span>Tempo: {item.due_date || "-"}</span>
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
                className="w-full text-green-600 hover:text-green-700"
              >
                <IconCheck size={16} className="mr-1" /> Set Lunas
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
              className="text-muted-foreground hover:text-red-500"
            >
              <IconTrash size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
