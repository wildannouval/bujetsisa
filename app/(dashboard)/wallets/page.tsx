import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createWallet, deleteWallet } from "@/lib/actions/wallets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconWallet,
  IconPlus,
  IconTrash,
  IconDotsVertical,
  IconCreditCard,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Komponen Konten Dinamis (Fetching Data)
async function WalletsContent() {
  const supabase = await createClient();
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-4 px-4 lg:px-0 md:grid-cols-2 lg:grid-cols-3">
      {wallets?.map((wallet) => (
        <Card
          key={wallet.id}
          className="border-none shadow-sm bg-card/50 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconCreditCard size={16} className="text-muted-foreground" />
              {wallet.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IconDotsVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                  <form
                    action={async () => {
                      "use server";
                      await deleteWallet(wallet.id);
                    }}
                    className="w-full"
                  >
                    <button className="flex w-full items-center">
                      <IconTrash size={16} className="mr-2" /> Hapus Dompet
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              Rp {Number(wallet.balance).toLocaleString("id-ID")}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-medium opacity-70">
              Saldo Saat Ini
            </p>
          </CardContent>
        </Card>
      ))}

      {wallets?.length === 0 && (
        <div className="col-span-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-muted-foreground bg-muted/20">
          <IconWallet size={40} className="mb-2 opacity-10" />
          <p className="text-sm font-medium">Belum ada dompet terdaftar.</p>
        </div>
      )}
    </div>
  );
}

// 2. Tampilan Loading (Skeleton)
function WalletsSkeleton() {
  return (
    <div className="grid gap-4 px-4 lg:px-0 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}

// 3. Halaman Utama (Statik Shell)
export default function WalletsPage() {
  // WRAPPER UNTUK FIX ERROR TYPESCRIPT (ACTION RETURN VALUE)
  async function handleCreate(formData: FormData) {
    "use server";
    await createWallet(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="flex items-center justify-between px-4 lg:px-0 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dompet</h2>
          <p className="text-muted-foreground text-sm">
            Kelola aset dan rekening bank Anda.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-1 size-4" /> Dompet Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Dompet</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Dompet</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Misal: BCA, Jago, Tunai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Awal (Rp)</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  placeholder="0"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Simpan Dompet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={<WalletsSkeleton />}>
        <WalletsContent />
      </Suspense>
    </div>
  );
}
