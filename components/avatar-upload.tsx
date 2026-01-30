"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar } from "@/lib/actions/profile";
import { IconCamera, IconUser, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarUpload({
  url,
  userId,
}: {
  url?: string;
  userId: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      // 1. Upload ke Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Dapatkan Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update Table Profiles via Action
      await updateAvatar(publicUrl);
      toast.success("Foto profil diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
          <AvatarImage src={url} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary">
            <IconUser size={40} />
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-input"
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        >
          {uploading ? (
            <IconLoader2 className="animate-spin" />
          ) : (
            <IconCamera size={20} />
          )}
        </label>
        <input
          type="file"
          id="avatar-input"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Ketuk untuk ganti foto
      </p>
    </div>
  );
}
