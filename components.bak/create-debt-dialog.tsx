"use client";

import * as React from "react";
import {
  Plus,
  UserPlus,
  Loader2,
  Save,
  Calendar,
  FileText,
} from "lucide-react";
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
import { createDebtLoan } from "@/lib/actions/debts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function CreateDebtDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [displayAmount, setDisplayAmount] = React.useState("");

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  const handleSubmit = async (formData: FormData) => {
    const rawAmount = displayAmount.replace(/\./g, "");
    formData.set("amount", rawAmount);

    setIsPending(true);
    const result = await createDebtLoan(formData);
    setIsPending(false);

    if (result?.success) {
      toast.success("Liability record successfully deployed");
      setOpen(false);
      setDisplayAmount("");
    } else {
      toast.error(result?.error || "Registry sequence failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-[10px] tracking-widest px-6 h-11 shadow-xl shadow-primary/20 border-none rounded-full gap-2 transition-all active:scale-95">
          <Plus size={18} strokeWidth={3} /> New Record
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-0.5"
          >
            Risk Registry
          </Badge>
          <DialogTitle className="text-3xl font-bold uppercase tracking-tighter flex items-center gap-3">
            <UserPlus className="text-primary size-7" /> Asset/Debt Unit
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Initialize new credit or liability contract
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Contract Type
            </Label>
            <Select name="type" defaultValue="receivable">
              <SelectTrigger className="h-14 bg-white/5 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="SELECT TYPE" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem
                  value="receivable"
                  className="font-bold text-[10px] uppercase text-primary"
                >
                  RECEIVABLE (Kredit Keluar)
                </SelectItem>
                <SelectItem
                  value="debt"
                  className="font-bold text-[10px] uppercase text-destructive"
                >
                  LIABILITY (Hutang Masuk)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Counterparty Entity
            </Label>
            <Input
              name="person_name"
              placeholder="INDIVIDUAL OR INSTITUTION NAME"
              className="h-14 bg-white/5 border-border rounded-2xl font-bold uppercase text-xs tracking-tight placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Principal Value
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary opacity-60">
                Rp
              </div>
              <Input
                value={displayAmount}
                onChange={(e) => setDisplayAmount(formatNumber(e.target.value))}
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-bold tracking-tighter"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70 flex items-center gap-1">
                <Calendar size={12} strokeWidth={3} /> Settlement Date
              </Label>
              <Input
                name="due_date"
                type="date"
                className="h-12 bg-white/5 border-border rounded-xl font-bold text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70 flex items-center gap-1">
                <FileText size={12} strokeWidth={3} /> Registry Context
              </Label>
              <Input
                name="description"
                placeholder="PURPOSE"
                className="h-12 bg-white/5 border-border rounded-xl font-bold uppercase text-[9px] tracking-widest placeholder:text-muted-foreground"
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
                Deploy Record <Save className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
