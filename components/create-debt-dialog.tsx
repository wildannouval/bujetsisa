"use client";

import * as React from "react";
import {
  IconPlus,
  IconUserPlus,
  IconLoader2,
  IconDeviceFloppy,
  IconCalendarEvent,
  IconNotes,
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
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest px-6 h-11 shadow-xl shadow-indigo-600/20 border-none rounded-full gap-2 transition-all active:scale-95">
          <IconPlus size={18} strokeWidth={3} /> New Record
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge className="w-fit bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-0.5">
            Risk Registry
          </Badge>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <IconUserPlus className="text-indigo-600 size-7" /> Asset/Debt Unit
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60 italic-none">
            Initialize new credit or liability contract
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Contract Type
            </Label>
            <Select name="type" defaultValue="receivable">
              <SelectTrigger className="h-14 bg-white/5 border-border rounded-2xl font-black uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="SELECT TYPE" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem
                  value="receivable"
                  className="font-black text-[10px] uppercase text-indigo-500"
                >
                  RECEIVABLE (Kredit Keluar)
                </SelectItem>
                <SelectItem
                  value="debt"
                  className="font-black text-[10px] uppercase text-red-500"
                >
                  LIABILITY (Hutang Masuk)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Counterparty Entity
            </Label>
            <Input
              name="person_name"
              placeholder="INDIVIDUAL OR INSTITUTION NAME"
              className="h-14 bg-white/5 border-border rounded-2xl font-black uppercase text-xs tracking-tight placeholder:text-slate-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Principal Value
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500 opacity-60">
                Rp
              </div>
              <Input
                value={displayAmount}
                onChange={(e) => setDisplayAmount(formatNumber(e.target.value))}
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-black tracking-tighter"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70 flex items-center gap-1">
                <IconCalendarEvent size={12} strokeWidth={3} /> Settlement Date
              </Label>
              <Input
                name="due_date"
                type="date"
                className="h-12 bg-white/5 border-border rounded-xl font-bold text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70 flex items-center gap-1">
                <IconNotes size={12} strokeWidth={3} /> Registry Context
              </Label>
              <Input
                name="description"
                placeholder="PURPOSE"
                className="h-12 bg-white/5 border-border rounded-xl font-black uppercase text-[9px] tracking-widest placeholder:text-slate-700"
              />
            </div>
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
                Deploy Record <IconDeviceFloppy className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
