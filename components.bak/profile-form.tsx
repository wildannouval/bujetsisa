"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";

export function ProfileForm({ user, profile }: { user: any; profile: any }) {
  async function handleAction(formData: FormData) {
    const result = await updateProfile(formData);
    if (result?.success) {
      toast.success("Profil berhasil diperbarui!");
    } else {
      toast.error(result?.error || "Gagal memperbarui profil.");
    }
  }

  return (
    <form action={handleAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase opacity-60">
            Email Address
          </Label>
          <Input value={user.email} disabled className="bg-muted font-medium" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={profile?.username || ""}
            className="font-medium"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="full_name">Nama Lengkap</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name || ""}
          className="font-medium"
        />
      </div>
      <Button type="submit" className="w-full font-bold">
        Perbarui Profil
      </Button>
    </form>
  );
}
