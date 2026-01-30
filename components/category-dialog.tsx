"use client";

import * as React from "react";
import {
  IconPlus,
  IconPencil,
  IconPalette,
  IconTarget,
  IconTrendingUp,
  IconTrendingDown,
  IconDeviceFloppy,
  IconLoader2,
  IconCategory,
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
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
  category?: any;
}

export function CategoryDialog({ category }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [type, setType] = React.useState(category?.type || "expense");
  const [color, setColor] = React.useState(category?.color || "#6366f1");
  const [displayLimit, setDisplayLimit] = React.useState(
    category?.monthly_limit
      ? new Intl.NumberFormat("id-ID").format(category.monthly_limit)
      : "",
  );

  const isEdit = !!category;

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("color", color);
    formData.set("type", type);
    formData.set(
      "monthly_limit",
      type === "expense" ? displayLimit.replace(/\./g, "") : "0",
    );

    setIsPending(true);
    const result = isEdit
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);
    setIsPending(false);

    if (result?.success) {
      toast.success(
        isEdit ? "Sector configuration updated" : "New sector initialized",
      );
      setOpen(false);
      if (!isEdit) {
        setDisplayLimit("");
        setType("expense");
        setColor("#6366f1");
      }
    } else {
      toast.error(result?.error || "System error during deployment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20"
          >
            <IconPencil size={18} strokeWidth={2.5} />
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest px-6 h-12 shadow-xl shadow-indigo-600/20 border-none rounded-full gap-2 transition-all active:scale-95">
            <IconPlus size={18} strokeWidth={3} /> New Sector
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge className="w-fit bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-0.5">
            Registry Unit
          </Badge>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
            <IconCategory className="text-indigo-600 size-7" />{" "}
            {isEdit ? "Modify Sector" : "Initialize Sector"}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60 italic-none">
            Establish financial classification parameters
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 pt-6 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Operation Sector
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-14 bg-white/5 border-border rounded-2xl font-black uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="SELECT TYPE" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem
                  value="expense"
                  className="font-black text-[10px] uppercase text-red-500"
                >
                  OUTFLOW (EXPENSE)
                </SelectItem>
                <SelectItem
                  value="income"
                  className="font-black text-[10px] uppercase text-green-500"
                >
                  INFLOW (INCOME)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Sector Identification
            </Label>
            <Input
              name="name"
              defaultValue={category?.name}
              placeholder="E.G. LOGISTICS, REVENUE, ETC"
              className="h-14 bg-white/5 border-border rounded-2xl font-black uppercase text-xs tracking-tight placeholder:text-slate-700"
              required
            />
          </div>

          <div
            className={`space-y-2 transition-all duration-300 ${type === "income" ? "opacity-30 pointer-events-none" : ""}`}
          >
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70 flex items-center gap-2">
              <IconTarget size={14} strokeWidth={3} /> Burn Rate Limit (Monthly)
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500 opacity-60">
                Rp
              </div>
              <Input
                value={displayLimit}
                onChange={(e) => setDisplayLimit(formatNumber(e.target.value))}
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-black tracking-tighter"
                placeholder="0"
                disabled={type === "income"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70 flex items-center gap-2">
              <IconPalette size={14} strokeWidth={3} /> Visualization Index
            </Label>
            <div className="flex gap-3 items-center bg-white/5 p-3 rounded-2xl border border-border">
              <div className="relative size-12 rounded-xl overflow-hidden border-2 border-background shadow-inner shrink-0">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-[-10px] size-[150%] cursor-pointer"
                />
              </div>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="font-black text-xs uppercase tracking-widest h-10 border-none bg-transparent"
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
                Deploy Sector <IconDeviceFloppy className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
