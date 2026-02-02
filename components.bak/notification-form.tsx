"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateNotifications } from "@/lib/actions/profile";
import { toast } from "sonner";

export function NotificationForm({ profile }: { profile: any }) {
  async function handleAction(formData: FormData) {
    const res = await updateNotifications(formData);
    if (res.success) toast.success("Preferensi notifikasi diperbarui!");
    else toast.error(res.error);
  }

  return (
    <form action={handleAction} className="space-y-4">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="notify_email"
          name="notify_email"
          defaultChecked={profile?.notify_email}
        />
        <Label htmlFor="notify_email">Laporan bulanan via Email</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Checkbox
          id="notify_budget"
          name="notify_budget"
          defaultChecked={profile?.notify_budget}
        />
        <Label htmlFor="notify_budget">Peringatan Budget Kritis</Label>
      </div>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="font-bold uppercase text-[10px]"
      >
        Update Notifikasi
      </Button>
    </form>
  );
}
