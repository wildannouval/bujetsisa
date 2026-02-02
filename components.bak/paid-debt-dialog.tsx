"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Coins } from "lucide-react";
import { payDebtLoan } from "@/lib/actions/debts";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export function PaidDebtDialog({
  item,
  wallets,
}: {
  item: any;
  wallets: any[];
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedWallet, setSelectedWallet] = React.useState("");
  const [payAmount, setPayAmount] = React.useState(
    (Number(item.amount) - Number(item.current_amount)).toString(),
  );

  const handleSettle = async () => {
    const amt = Number(payAmount);
    if (!selectedWallet) return toast.error("Pilih dompet!");
    if (amt <= 0) return toast.error("Jumlah tidak valid!");

    setLoading(true);
    const res = await payDebtLoan(item.id, selectedWallet, amt);
    setLoading(false);

    if (res.success) {
      toast.success("Pembayaran cicilan berhasil dicatat!");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-[10px] font-bold text-green-600 border-green-200 uppercase hover:bg-green-50 hover:text-green-700"
        >
          <Check size={14} className="mr-1.5" /> Bayar Cicilan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-0.5"
          >
            Settlement Protocol
          </Badge>
          <DialogTitle className="text-3xl font-bold uppercase tracking-tighter flex items-center gap-2">
            <Coins className="text-primary size-7" /> Cicilan Pelunasan
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Bayar sebagian atau langsung lunas.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Funding Source
            </Label>
            <Select onValueChange={setSelectedWallet}>
              <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="SELECT WALLET" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                {wallets.map((w) => (
                  <SelectItem
                    key={w.id}
                    value={w.id}
                    className="font-bold text-xs uppercase"
                  >
                    {w.name} (Rp {Number(w.balance).toLocaleString("id-ID")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Payment Amount (Rp)
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary opacity-60">
                Rp
              </div>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-bold tracking-tighter tabular-nums"
              />
            </div>
          </div>

          <Button
            onClick={handleSettle}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 border-none transition-all active:scale-95"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Settlement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
