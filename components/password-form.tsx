"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/profile";
import { toast } from "sonner";
import * as React from "react";

export function PasswordForm() {
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    const result = await updatePassword(formData);
    if (result?.success) {
      toast.success("Kata sandi berhasil diganti!");
      formRef.current?.reset();
    } else {
      toast.error(result?.error || "Gagal mengganti kata sandi.");
    }
  }

  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi Baru</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Konfirmasi</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        variant="secondary"
        className="w-full font-bold border-2"
      >
        Ganti Kata Sandi
      </Button>
    </form>
  );
}
