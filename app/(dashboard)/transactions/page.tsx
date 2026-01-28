import { createClient } from "@/lib/supabase/server";
import {
  createTransaction,
  deleteTransaction,
} from "@/lib/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconReceipt2,
  IconTrash,
  IconArrowUpRight,
  IconArrowDownRight,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function TransactionsPage() {
  const supabase = await createClient();

  // Ambil data pendukung untuk Form
  const { data: wallets } = await supabase.from("wallets").select("*");
  const { data: categories } = await supabase.from("categories").select("*");

  // Ambil data transaksi dengan join
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      wallets(name),
      categories(name, color)
    `,
    )
    .order("date", { ascending: false });

  // WRAPPER UNTUK MENGATASI ERROR TYPESCRIPT
  async function handleCreateTransaction(formData: FormData) {
    "use server";
    await createTransaction(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="flex items-center justify-between px-4 lg:px-0">
        <h2 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-2 size-4" /> Catat Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi</DialogTitle>
            </DialogHeader>
            {/* GUNAKAN WRAPPER DI SINI */}
            <form action={handleCreateTransaction} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select name="type" defaultValue="expense">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah (Rp)</Label>
                  <Input name="amount" type="number" placeholder="0" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dompet / Rekening</Label>
                <Select name="wallet_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Dompet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets?.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select name="category_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input
                  name="description"
                  placeholder="Misal: Beli kopi senja"
                />
              </div>

              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button type="submit" className="w-full">
                Simpan Transaksi
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mx-4 lg:mx-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Dompet</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs">{tx.date}</TableCell>
                  <TableCell className="font-medium">
                    {tx.description || "-"}
                  </TableCell>
                  <TableCell>
                    {tx.categories ? (
                      <Badge
                        variant="outline"
                        className="font-normal"
                        style={{ borderColor: tx.categories.color }}
                      >
                        {tx.categories.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {tx.wallets?.name}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${tx.type === "expense" ? "text-red-500" : "text-green-600"}`}
                  >
                    {tx.type === "expense" ? "-" : "+"}{" "}
                    {Number(tx.amount).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <form
                      action={async () => {
                        "use server";
                        await deleteTransaction(tx.id);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {transactions?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Belum ada transaksi tercatat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
