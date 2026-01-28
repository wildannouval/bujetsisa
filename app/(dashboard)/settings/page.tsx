import { Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

// 1. Komponen Loading (Skeleton)
function SettingsSkeleton() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </section>
    </div>
  );
}

// 2. Komponen Konten Dinamis (Mengambil data Supabase)
async function SettingsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
    <div className="grid gap-8 px-4 lg:px-0">
      {/* PENGATURAN PROFIL */}
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <IconUser size={20} /> Profil Pengguna
          </h3>
          <p className="text-sm text-muted-foreground">
            Informasi ini digunakan untuk identitas akun Anda di sistem.
          </p>
        </div>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="pt-6">
            <form action={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase opacity-70">Email</Label>
                <Input value={user.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={profile?.username || ""}
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
            Pilih tema yang paling nyaman untuk penggunaan sehari-hari.
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
            Keamanan
          </h3>
          <p className="text-sm text-muted-foreground">
            Aksi berbahaya terkait akun Anda.
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
  );
}

// 3. Halaman Utama (Statik Shell)
export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8 max-w-4xl mx-auto w-full">
      <div className="px-4 lg:px-0">
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-muted-foreground text-sm">
          Sesuaikan profil dan preferensi aplikasi Anda.
        </p>
      </div>

      <Separator className="my-2" />

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
