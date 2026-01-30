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
import { IconCheck, IconCoins } from "@tabler/icons-react";
import { payDebtLoan } from "@/lib/actions/debts";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          className="flex-1 h-8 text-[10px] font-bold text-green-600 border-green-200 uppercase"
        >
          <IconCheck size={14} className="mr-1.5" /> Bayar Cicilan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="uppercase italic font-black">
            Cicilan Pelunasan
          </DialogTitle>
          <DialogDescription className="text-xs">
            Bayar sebagian atau langsung lunas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-60">
              Pilih Wallet
            </label>
            <Select onValueChange={setSelectedWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih dompet..." />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} (Rp {Number(w.balance).toLocaleString("id-ID")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase opacity-60">
              Jumlah Bayar (Rp)
            </label>
            <Input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="font-mono font-bold"
            />
          </div>
          <Button
            onClick={handleSettle}
            className="w-full font-bold uppercase"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
