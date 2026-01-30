"use client";

import * as React from "react";
import {
  IconPencil,
  IconDeviceFloppy,
  IconLoader2,
  IconReceipt,
  IconCalendar,
} from "@tabler/icons-react";
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
import { updateTransaction } from "@/lib/actions/transactions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function EditTransactionDialog({
  transaction,
  wallets,
  categories,
}: any) {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [type, setType] = React.useState(transaction.type);
  const [displayAmount, setDisplayAmount] = React.useState(
    new Intl.NumberFormat("id-ID").format(transaction.amount),
  );

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  // Filter kategori berdasarkan tipe yang dipilih (income/expense)
  const filteredCategories = categories.filter((c: any) => c.type === type);

  const handleSubmit = async (formData: FormData) => {
    const rawAmount = displayAmount.replace(/\./g, "");
    formData.set("amount", rawAmount);
    formData.set("type", type);

    setIsPending(true);
    const result = await updateTransaction(transaction.id, formData);
    setIsPending(false);

    if (result?.success) {
      toast.success("Transaction registry updated");
      setOpen(false);
    } else {
      toast.error(result?.error || "Failed to update registry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20"
        >
          <IconPencil size={18} strokeWidth={2.5} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge className="w-fit bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-0.5">
            Registry Modification
          </Badge>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
            <IconReceipt className="text-indigo-600 size-7" /> Edit Entry
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60 italic-none">
            Reconfigure capital movement parameters
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                Operation Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem
                    value="expense"
                    className="text-red-500 font-bold uppercase text-[10px]"
                  >
                    OUTFLOW
                  </SelectItem>
                  <SelectItem
                    value="income"
                    className="text-green-500 font-bold uppercase text-[10px]"
                  >
                    INFLOW
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                Capital Value
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500 opacity-60">
                  Rp
                </div>
                <Input
                  value={displayAmount}
                  onChange={(e) =>
                    setDisplayAmount(formatNumber(e.target.value))
                  }
                  className="pl-12 h-12 bg-white/5 border-border rounded-xl text-lg font-black tracking-tighter"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                Source Unit
              </Label>
              <Select
                name="wallet_id"
                defaultValue={transaction.wallet_id}
                required
              >
                <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px]">
                  <SelectValue placeholder="SELECT UNIT" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {wallets.map((w: any) => (
                    <SelectItem
                      key={w.id}
                      value={w.id}
                      className="font-bold text-[10px] uppercase"
                    >
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                Sector
              </Label>
              <Select name="category_id" defaultValue={transaction.category_id}>
                <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px]">
                  <SelectValue placeholder="SELECT SECTOR" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {filteredCategories.map((c: any) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className="font-bold text-[10px] uppercase"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Registry Description
            </Label>
            <Input
              name="description"
              defaultValue={transaction.description}
              placeholder="IDENTIFY TRANSACTION SOURCE"
              className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] tracking-tight"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70 flex items-center gap-1">
              <IconCalendar size={12} strokeWidth={3} /> Timestamp
            </Label>
            <Input
              name="date"
              type="date"
              defaultValue={transaction.date}
              required
              className="h-12 bg-white/5 border-border rounded-xl font-bold text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 border-none transition-all active:scale-95"
          >
            {isPending ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <>
                Apply Changes <IconDeviceFloppy className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
