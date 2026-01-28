import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Separator } from "@/components/ui/separator";
import { IconUser, IconPalette, IconLogout } from "@tabler/icons-react";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Ambil data profil dari database
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // WRAPPER UNTUK MENGATASI ERROR TYPESCRIPT
  async function handleUpdateProfile(formData: FormData) {
    "use server";
    await updateProfile(formData);
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8 max-w-4xl mx-auto w-full">
      <div className="px-4 lg:px-0">
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground text-sm">
          Kelola profil dan preferensi aplikasi Anda.
        </p>
      </div>

      <Separator className="my-2" />

      <div className="grid gap-8 px-4 lg:px-0">
        {/* PENGATURAN PROFIL */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <IconUser size={20} /> Profil Pengguna
            </h3>
            <p className="text-sm text-muted-foreground">
              Informasi ini akan muncul di sidebar dan laporan transaksi Anda.
            </p>
          </div>
          <Card className="border-none shadow-sm bg-card/50">
            <CardContent className="pt-6">
              {/* GUNAKAN WRAPPER DI SINI */}
              <form action={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase tracking-wider opacity-70"
                  >
                    Email (ID)
                  </Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={profile?.full_name || ""}
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={profile?.username || ""}
                    placeholder="budisnt"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Simpan Perubahan
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* PENGATURAN TEMA */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <IconPalette size={20} /> Personalisasi
            </h3>
            <p className="text-sm text-muted-foreground">
              Ubah tampilan warna aplikasi sesuai kenyamanan mata Anda.
            </p>
          </div>
          <Card className="border-none shadow-sm bg-card/50">
            <CardContent className="pt-6">
              <ThemeSwitcher />
            </CardContent>
          </Card>
        </section>

        {/* AKSI AKUN */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-red-500 flex items-center gap-2">
              Keamanan & Sesi
            </h3>
            <p className="text-sm text-muted-foreground">
              Pastikan Anda keluar jika menggunakan perangkat bersama.
            </p>
          </div>
          <Card className="border-none shadow-sm bg-red-50/10 dark:bg-red-950/5">
            <CardContent className="pt-6">
              <form action={handleSignOut}>
                <Button variant="destructive" className="w-full">
                  <IconLogout className="mr-2 size-4" /> Keluar dari Bujetsisa
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
