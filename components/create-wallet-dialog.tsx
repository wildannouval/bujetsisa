"use client";

import * as React from "react";
import {
  IconPlus,
  IconBuildingBank,
  IconCash,
  IconDeviceMobile,
  IconCreditCard,
  IconChartLine,
  IconLoader2,
  IconDeviceFloppy,
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
import { createWallet } from "@/lib/actions/wallets";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const walletTypes = [
  {
    value: "Bank",
    label: "REKENING BANK",
    icon: <IconBuildingBank size={16} />,
  },
  {
    value: "E-Wallet",
    label: "DOMPET DIGITAL",
    icon: <IconDeviceMobile size={16} />,
  },
  { value: "Tunai", label: "UANG TUNAI", icon: <IconCash size={16} /> },
  {
    value: "Investasi",
    label: "INVESTASI / RDPU",
    icon: <IconChartLine size={16} />,
  },
  {
    value: "Kartu Kredit",
    label: "KARTU KREDIT",
    icon: <IconCreditCard size={16} />,
  },
];

export function CreateWalletDialog() {
  const [open, setOpen] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = rawValue
      ? new Intl.NumberFormat("id-ID").format(parseInt(rawValue))
      : "";
    setDisplayValue(formatted);
  };

  const onSubmit = async (formData: FormData) => {
    const rawBalance = displayValue.replace(/\./g, "");
    formData.set("balance", rawBalance);

    setIsPending(true);
    const result = await createWallet(formData);
    setIsPending(false);

    if (result?.success) {
      toast.success("New financial unit deployed");
      setOpen(false);
      setDisplayValue("");
    } else {
      toast.error(result?.error || "Registration sequence failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-indigo-600/20 border-none transition-all"
        >
          <IconPlus size={16} strokeWidth={3} /> Initialize Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge className="w-fit bg-indigo-600/10 text-indigo-500 border-none font-black text-[9px] uppercase tracking-widest">
            Asset Registry
          </Badge>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
            New Financial Unit
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60 italic-none">
            Configure a new liquidity source
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Unit Identification
            </Label>
            <Input
              name="name"
              placeholder="E.G. BANK CENTRAL, MAIN CASH, ETC"
              className="h-14 bg-white/5 border-border rounded-2xl font-bold uppercase placeholder:text-slate-700 tracking-tight"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Infrastructure Type
            </Label>
            <Select name="type" defaultValue="Bank">
              <SelectTrigger className="h-14 bg-white/5 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="SELECT CATEGORY" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                {walletTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="p-3">
                    <div className="flex items-center gap-3 font-black uppercase text-[10px]">
                      <div className="text-indigo-500">{t.icon}</div>{" "}
                      <span>{t.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
              Initial Capital Injection
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500 opacity-60">
                Rp
              </div>
              <Input
                value={displayValue}
                onChange={handleInputChange}
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-black tracking-tight placeholder:text-slate-700"
                placeholder="0"
                required
              />
              <input
                type="hidden"
                name="balance"
                value={displayValue.replace(/\./g, "")}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 border-none transition-all"
          >
            {isPending ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <>
                Deploy Unit <IconDeviceFloppy className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
