"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateAvatar } from "@/lib/actions/profile";
import { RefreshCw, User, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// PASTIKAN ADA KATA 'export' DI DEPAN FUNCTION
export function AvatarPicker({
  url,
  username,
}: {
  url?: string;
  username: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const generateNewAvatar = async () => {
    try {
      setLoading(true);
      // Gunakan timestamp untuk memastikan URL unik (Cache Busting)
      const seed = `${username}-${Date.now()}`;
      const newUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&flip=true`;

      const result = await updateAvatar(newUrl);

      if (result.success) {
        toast.success("Karakter berhasil diperbarui!");
        // router.refresh() akan mengambil ulang data untuk Sidebar (Server Component)
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui avatar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-all">
          {/* Key={url} memaksa re-render elemen img saat URL dari database berubah */}
          <AvatarImage src={url} className="object-cover" key={url} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User size={40} />
          </AvatarFallback>
        </Avatar>
        {!loading && url && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full border-4 border-background shadow-lg">
            <Check size={14} strokeWidth={4} />
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={generateNewAvatar}
        disabled={loading}
        className="font-bold border-2"
      >
        {loading ? (
          <Loader2 className="mr-2 animate-spin size-4" />
        ) : (
          <RefreshCw className="mr-2 size-4" />
        )}
        Acak Karakter
      </Button>
    </div>
  );
}
