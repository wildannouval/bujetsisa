"use client";

import * as React from "react";
import {
  Plus,
  Landmark,
  Banknote,
  Smartphone,
  CreditCard,
  TrendingUp,
  Loader2,
  Save,
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
import { createWallet } from "@/lib/actions/wallets";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const walletTypes = [
  {
    value: "Bank",
    label: "REKENING BANK",
    icon: <Landmark size={16} />,
  },
  {
    value: "E-Wallet",
    label: "DOMPET DIGITAL",
    icon: <Smartphone size={16} />,
  },
  { value: "Tunai", label: "UANG TUNAI", icon: <Banknote size={16} /> },
  {
    value: "Investasi",
    label: "INVESTASI / RDPU",
    icon: <TrendingUp size={16} />,
  },
  {
    value: "Kartu Kredit",
    label: "KARTU KREDIT",
    icon: <CreditCard size={16} />,
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
          className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/20 border-none transition-all"
        >
          <Plus size={16} strokeWidth={3} /> Initialize Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card/80 backdrop-blur-3xl border-border rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest"
          >
            Asset Registry
          </Badge>
          <DialogTitle className="text-3xl font-bold uppercase tracking-tighter">
            New Financial Unit
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Configure a new liquidity source
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Unit Identification
            </Label>
            <Input
              name="name"
              placeholder="E.G. BANK CENTRAL, MAIN CASH, ETC"
              className="h-14 bg-white/5 border-border rounded-2xl font-bold uppercase placeholder:text-muted-foreground tracking-tight"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Infrastructure Type
            </Label>
            <Select name="type" defaultValue="Bank">
              <SelectTrigger className="h-14 bg-white/5 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="SELECT CATEGORY" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                {walletTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="p-3">
                    <div className="flex items-center gap-3 font-bold uppercase text-[10px]">
                      <div className="text-primary">{t.icon}</div>{" "}
                      <span>{t.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-70">
              Initial Capital Injection
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary opacity-60">
                Rp
              </div>
              <Input
                value={displayValue}
                onChange={handleInputChange}
                className="pl-12 h-14 bg-white/5 border-border rounded-2xl text-lg font-bold tracking-tight placeholder:text-muted-foreground"
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
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 border-none transition-all"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Deploy Unit <Save className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
