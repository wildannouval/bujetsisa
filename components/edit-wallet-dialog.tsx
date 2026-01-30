"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { updateWallet } from "@/lib/actions/wallets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconEdit, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

export function EditWalletDialog({ wallet }: { wallet: any }) {
  const [open, setOpen] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await updateWallet(wallet.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Wallet configuration updated");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center">
          <IconEdit size={16} className="mr-3 text-indigo-400" /> Modify
          Settings
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
            Edit Financial Unit
          </DialogTitle>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
            Reconfigure your asset parameters
          </p>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
              Unit Name
            </Label>
            <Input
              name="name"
              defaultValue={wallet.name}
              placeholder="e.g. Main Bank Account"
              className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase tracking-tight"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
              Current Liquidity
            </Label>
            <Input
              name="balance"
              type="number"
              defaultValue={wallet.balance}
              placeholder="0"
              className="h-12 bg-white/5 border-border rounded-xl font-bold tabular-nums"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
              Platform Type
            </Label>
            <Select name="type" defaultValue={wallet.type}>
              <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="Bank">BANKING</SelectItem>
                <SelectItem value="E-Wallet">DIGITAL WALLET</SelectItem>
                <SelectItem value="Tunai">CASH SYSTEM</SelectItem>
                <SelectItem value="Investasi">INVESTMENT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs border-none shadow-xl shadow-indigo-500/20"
    >
      {pending ? (
        <IconLoader2 className="animate-spin mr-2" />
      ) : (
        <IconDeviceFloppy className="mr-2" size={18} />
      )}
      Save Configuration
    </Button>
  );
}
