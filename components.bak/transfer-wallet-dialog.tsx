"use client";

import * as React from "react";
import { ArrowRight, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transferBalance } from "@/lib/actions/wallets";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function TransferWalletDialog({ wallets }: { wallets: any[] }) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? new Intl.NumberFormat("id-ID").format(parseInt(num)) : "";
  };

  const handleSubmit = async (formData: FormData) => {
    const rawAmount = amount.replace(/\./g, "");
    formData.set("amount", rawAmount);

    setIsPending(true);
    const result = await transferBalance(formData);
    setIsPending(false);

    if (result?.success) {
      toast.success("Capital redistribution successful");
      setOpen(false);
      setAmount("");
    } else {
      toast.error(result?.error || "Protocol failed to execute");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-xl border-border bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all font-bold uppercase text-[10px] tracking-widest gap-2"
        >
          <ArrowLeftRight size={16} strokeWidth={3} /> Transfer Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest"
          >
            Transaction Bridge
          </Badge>
          <DialogTitle className="text-3xl font-bold uppercase tracking-tighter">
            Redistribute Funds
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Execute internal capital movement
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
                Source Unit
              </Label>
              <Select name="from_wallet_id" required>
                <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px]">
                  <SelectValue placeholder="Origin" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {wallets.map((w) => (
                    <SelectItem
                      key={w.id}
                      value={w.id}
                      className="font-bold uppercase text-[10px]"
                    >
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-[10px] font-bold uppercase tracking-widest mr-1 opacity-70">
                Target Unit
              </Label>
              <Select name="to_wallet_id" required>
                <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px]">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {wallets.map((w) => (
                    <SelectItem
                      key={w.id}
                      value={w.id}
                      className="font-bold uppercase text-[10px]"
                    >
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Transfer Amount
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary opacity-60">
                Rp
              </div>
              <Input
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-bold tracking-tight placeholder:text-muted-foreground"
                value={amount}
                onChange={(e) => setAmount(formatNumber(e.target.value))}
                placeholder="0"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 border-none transition-all active:scale-95"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Initiate Transfer <ArrowRight className="ml-2" size={16} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
