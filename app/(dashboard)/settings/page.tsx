import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/lib/actions/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Separator } from "@/components/ui/separator";
import {
  IconUser,
  IconPalette,
  IconLogout,
  IconShieldLock,
  IconPhoto,
  IconSettings,
  IconBell,
} from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarPicker } from "@/components/avatar-picker";
import { ProfileForm } from "@/components/profile-form";
import { PasswordForm } from "@/components/password-form";
import { NotificationForm } from "@/components/notification-form";

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

  return (
    <div className="space-y-10 px-4 lg:px-0 pb-20">
      {/* IDENTITAS VISUAL */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
            <IconPhoto size={20} className="text-primary" /> Identitas Visual
          </h3>
          <p className="text-sm text-muted-foreground">
            Ubah karakter DiceBear profil Anda.
          </p>
        </div>
        <Card className="md:col-span-2 border shadow-sm bg-card/50">
          <CardContent className="py-10 flex justify-center md:justify-start">
            <AvatarPicker
              url={profile?.avatar_url}
              username={profile?.username || "user"}
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* PROFIL & NOTIFIKASI */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
            <IconUser size={20} className="text-primary" /> Profil & Notifikasi
          </h3>
          <p className="text-sm text-muted-foreground">
            Kelola data diri dan preferensi sistem.
          </p>
        </div>
        <Card className="md:col-span-2 border shadow-sm bg-card/50">
          <CardContent className="pt-6 space-y-6">
            <ProfileForm user={user} profile={profile} />
            <Separator className="border-dashed" />
            <NotificationForm profile={profile} />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* KEAMANAN & HAPUS AKUN */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-1 text-red-500">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <IconShieldLock size={20} /> Bahaya
          </h3>
          <p className="text-sm opacity-80">Pengaturan proteksi data.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <Card className="border shadow-sm bg-card/50">
            <CardContent className="pt-6">
              <PasswordForm />
            </CardContent>
          </Card>
          <div className="p-4 border border-red-200 bg-red-50/30 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-red-600 uppercase tracking-tighter">
                Hapus Akun
              </p>
              <p className="text-[10px] text-muted-foreground italic">
                Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteAccount();
              }}
            >
              <Button
                variant="destructive"
                size="sm"
                className="font-bold text-[10px] uppercase"
              >
                Hapus Permanen
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8 max-w-5xl mx-auto w-full">
      <div className="px-4 lg:px-0">
        <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
          <IconSettings size={32} className="text-primary" /> Pengaturan
        </h2>
      </div>
      <Separator className="my-2" />
      <Suspense
        fallback={<Skeleton className="h-[600px] w-full rounded-2xl" />}
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}
