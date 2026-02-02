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

  const handleSubmit = async (formData: FormData) => {
    formData.set("amount", val.replace(/\./g, ""));
    const res = await updateMonthlyBudget(formData);
    if (res.success) toast.success("Budget bulanan diperbarui!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Pengaturan Anggaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Limit Anggaran (Rp)</Label>
            <Input
              value={val}
              onChange={(e) =>
                setVal(
                  e.target.value
                    .replace(/\D/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, "."),
                )
              }
              className="font-mono font-bold"
            />
          </div>
          <Button type="submit" className="w-full font-bold">
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
