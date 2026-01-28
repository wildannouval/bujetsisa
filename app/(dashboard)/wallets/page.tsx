import { createClient } from "@/lib/supabase/server";
import { createWallet, deleteWallet } from "@/lib/actions/wallets";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconWallet,
  IconPlus,
  IconTrash,
  IconDotsVertical,
  IconEdit,
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

export default async function WalletsPage() {
  const supabase = await createClient();
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: false });

  async function handleCreate(formData: FormData) {
    "use server";
    await createWallet(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
      <div className="flex items-center justify-between px-4 lg:px-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Dompet & Rekening
          </h2>
          <p className="text-muted-foreground text-sm">
            Kelola tempat penyimpanan uang Anda.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-2 size-4" /> Dompet Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Dompet</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama Dompet</Label>
                <Input
                  name="name"
                  placeholder="Misal: BCA, Jago, Cash"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Saldo Awal (Rp)</Label>
                <Input name="balance" type="number" placeholder="0" required />
              </div>
              <Button type="submit" className="w-full">
                Simpan Dompet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 px-4 lg:px-0 md:grid-cols-2 lg:grid-cols-3">
        {wallets?.map((wallet) => (
          <Card key={wallet.id} className="relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {wallet.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <IconDotsVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <form
                      action={async () => {
                        "use server";
                        await deleteWallet(wallet.id);
                      }}
                      className="w-full"
                    >
                      <button className="flex w-full items-center">
                        <IconTrash size={16} className="mr-2" /> Hapus
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {Number(wallet.balance).toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Current Balance
              </p>
            </CardContent>
          </Card>
        ))}

        {wallets?.length === 0 && (
          <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground">
            <IconWallet size={32} className="mb-2 opacity-20" />
            <p className="text-sm">Belum ada dompet terdaftar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
