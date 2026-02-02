"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

interface DeleteButtonProps {
  action: (id: string) => Promise<any>;
  id: string;
  label?: string;
}

export function DeleteButton({
  action,
  id,
  label = "Data",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await action(id);
        if (result?.error) {
          toast.error(`Gagal menghapus: ${result.error}`);
        } else {
          toast.success(`${label} berhasil dihapus!`);
        }
      } catch (error) {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="h-8 w-8 text-muted-foreground hover:text-red-500"
    >
      <Trash2 size={16} className={isPending ? "animate-pulse" : ""} />
    </Button>
  );
}
