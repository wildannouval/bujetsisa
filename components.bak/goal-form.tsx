"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addGoal } from "@/lib/actions/budget-goals";
import { toast } from "sonner";

export function GoalForm() {
  const [val, setVal] = React.useState("");

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("target", val.replace(/\./g, ""));
    const res = await addGoal(formData);
    if (res.success) {
      toast.success("Target baru berhasil dibuat!");
      setVal("");
      (document.getElementById("goal-form") as HTMLFormElement).reset();
    }
  };

  return (
    <form id="goal-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase opacity-60 tracking-wider">
          Nama Target
        </Label>
        <Input
          name="name"
          placeholder="Misal: Dana Darurat, Laptop Baru"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase opacity-60 tracking-wider">
          Target Dana
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">
            Rp
          </span>
          <Input
            value={val}
            onChange={(e) => setVal(formatNumber(e.target.value))}
            className="pl-9 font-mono"
            placeholder="0"
            required
          />
        </div>
      </div>
      <Button type="submit" variant="outline" className="w-full font-bold">
        <Plus className="mr-2 size-4" /> Buat Target
      </Button>
    </form>
  );
}
