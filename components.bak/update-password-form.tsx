"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ChevronLeft, Coins, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

// --- DICTIONARY ---
const translations = {
  id: {
    title: "Sandi Baru",
    desc: "Perbarui kunci akses akun Anda untuk keamanan maksimal.",
    label: "Kata Sandi Baru",
    placeholder: "Minimal 6 karakter",
    button: "Perbarui Akses",
    loading: "Mengamankan...",
    back: "Kembali ke Masuk",
  },
  en: {
    title: "Update Key",
    desc: "Refresh your account access key for maximum security.",
    label: "New Access Key",
    placeholder: "Min 6 characters",
    button: "Update Access",
    loading: "Securing...",
    back: "Back to Login",
  },
};

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  // Deteksi bahasa (bisa dikembangkan menggunakan context/global state)
  const lang = "id"; // Default sesuai landing page sebelumnya
  const t = translations[lang];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/dashboard");
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update security key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Coins className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{t.title}</CardTitle>
          <CardDescription>{t.desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{t.label}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t.placeholder}
                    className="pl-9"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    {t.button} <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground justify-center">
          <Link
            href="/auth/login"
            className="flex items-center hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-2 size-4" />
            {t.back}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
