"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateMonthlyBudget } from "@/lib/actions/budget-goals";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetForm({ initialAmount }: { initialAmount: number }) {
  const [val, setVal] = React.useState(
    new Intl.NumberFormat("id-ID").format(initialAmount),
  );

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? new Intl.NumberFormat("id-ID").format(parseInt(number))
      : "";
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("amount", val.replace(/\./g, ""));
    const res = await updateMonthlyBudget(formData);
    if (res.success) {
      toast.success("Budget bulanan berhasil diperbarui!");
    } else {
      toast.error("Gagal memperbarui budget.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Pengaturan Anggaran Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Batas Anggaran</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                value={val}
                onChange={(e) => setVal(formatNumber(e.target.value))}
                className="pl-9 font-mono font-bold"
                placeholder="0"
              />
            </div>
          </div>
          <Button type="submit" className="w-full font-bold">
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
