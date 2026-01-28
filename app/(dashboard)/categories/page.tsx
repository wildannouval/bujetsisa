import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTags, IconPlus, IconTrash, IconCoin } from "@tabler/icons-react"; // Ditambahkan IconCoin
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

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const expenses = categories?.filter((c) => c.type === "expense") || [];
  const incomes = categories?.filter((c) => c.type === "income") || [];

  // Wrapper untuk mengatasi Error TypeScript pada Form Action
  async function handleCreateCategory(formData: FormData) {
    "use server";
    await createCategory(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="flex items-center justify-between px-4 lg:px-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori</h2>
          <p className="text-muted-foreground text-sm">
            Pisahkan transaksi berdasarkan jenisnya.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-2 size-4" /> Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Kategori Baru</DialogTitle>
            </DialogHeader>
            {/* Menggunakan handleCreateCategory agar TS tidak komplain soal return value */}
            <form action={handleCreateCategory} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Misal: Makanan, Bensin, Gaji"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Transaksi</Label>
                <Select name="type" defaultValue="expense">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">
                      Pengeluaran (Uang Keluar)
                    </SelectItem>
                    <SelectItem value="income">
                      Pemasukan (Uang Masuk)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Warna Label</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue="#3b82f6"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="h-10 w-full rounded-md border border-input bg-muted flex items-center justify-center">
                    <IconTags className="size-5" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Simpan Kategori
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 px-4 lg:px-0 md:grid-cols-2">
        {/* KATEGORI PENGELUARAN */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <IconTags size={20} /> Pengeluaran
            </CardTitle>
            <CardDescription>
              Uang yang keluar dari dompet Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {expenses.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteCategory(cat.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500 h-8 w-8"
                  >
                    <IconTrash size={16} />
                  </Button>
                </form>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada kategori pengeluaran.
              </p>
            )}
          </CardContent>
        </Card>

        {/* KATEGORI PEMASUKAN */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <IconCoin size={20} /> Pemasukan
            </CardTitle>
            <CardDescription>Uang yang masuk ke saldo Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {incomes.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteCategory(cat.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500 h-8 w-8"
                  >
                    <IconTrash size={16} />
                  </Button>
                </form>
              </div>
            ))}
            {incomes.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada kategori pemasukan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
