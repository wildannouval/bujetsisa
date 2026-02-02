"use client";

import * as React from "react";
import { Plus, Receipt, Save, Loader2, Coins } from "lucide-react";
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
import { createTransaction } from "@/lib/actions/transactions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function CreateTransactionDialog({ wallets, categories }: any) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState("expense");
  const [displayAmount, setDisplayAmount] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  const filteredCategories = categories.filter((c: any) => c.type === type);

  const handleSubmit = async (formData: FormData) => {
    const rawAmount = displayAmount.replace(/\./g, "");
    formData.set("amount", rawAmount);
    formData.set("type", type);

    setIsPending(true);
    const result = await createTransaction(formData);
    setIsPending(false);

    if (result?.success) {
      toast.success("Transaction deployed to ledger");
      setOpen(false);
      setDisplayAmount("");
    } else {
      toast.error(result?.error || "System failed to record entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-[10px] tracking-widest px-6 h-12 shadow-xl shadow-primary/20 border-none rounded-full gap-2">
          <Plus size={18} strokeWidth={3} /> Record Entry
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest"
          >
            Entry Creation
          </Badge>
          <DialogTitle className="text-3xl font-bold uppercase tracking-tighter">
            New Transaction
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Define capital movement parameters
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
                Operation Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem
                    value="expense"
                    className="text-destructive font-bold uppercase text-[10px]"
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
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
                Capital Value
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary opacity-60">
                  Rp
                </div>
                <Input
                  value={displayAmount}
                  onChange={(e) =>
                    setDisplayAmount(formatNumber(e.target.value))
                  }
                  className="pl-12 h-12 bg-white/5 border-border rounded-xl text-lg font-bold tracking-tighter placeholder:text-muted-foreground"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
                Source Unit
              </Label>
              <Select name="wallet_id" required>
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
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
                Sector
              </Label>
              <Select name="category_id">
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
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Registry Description
            </Label>
            <Input
              name="description"
              placeholder="IDENTIFY TRANSACTION SOURCE"
              className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[10px] tracking-tight placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Timestamp
            </Label>
            <Input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="h-12 bg-white/5 border-border rounded-xl font-bold text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-2xl border-none transition-all active:scale-95"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Deploy Registry <Save className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
