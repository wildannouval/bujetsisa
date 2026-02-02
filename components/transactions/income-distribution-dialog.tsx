"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2, BookTemplate, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getWallets } from "@/lib/actions/wallets";
import { getCategories } from "@/lib/actions/categories";
import {
  distributeIncome,
  getDistributionTemplates,
  createDistributionTemplate,
  DistributionAllocation,
} from "@/lib/actions/distributions";
import { formatCurrency } from "@/lib/utils";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface Template {
  id: string;
  name: string;
  allocations: DistributionAllocation[];
}

interface AllocationRow {
  wallet_id: string;
  amount: number;
  percentage: number;
}

export function IncomeDistributionDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Form state
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [allocations, setAllocations] = useState<AllocationRow[]>([
    { wallet_id: "", amount: 0, percentage: 0 },
  ]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [usePercentage, setUsePercentage] = useState(true);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const router = useRouter();

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    const [walletsData, categoriesData, templatesData] = await Promise.all([
      getWallets(),
      getCategories(),
      getDistributionTemplates(),
    ]);
    setWallets(walletsData as Wallet[]);
    setCategories(
      (categoriesData as Category[]).filter((c) => c.type === "income"),
    );
    setTemplates(templatesData as Template[]);
  };

  // Calculate totals
  const totalAllocated = allocations.reduce(
    (sum, a) => sum + (a.amount || 0),
    0,
  );
  const remaining = (parseFloat(totalAmount) || 0) - totalAllocated;

  // Update amounts when total or percentages change
  useEffect(() => {
    if (usePercentage && totalAmount) {
      const total = parseFloat(totalAmount) || 0;
      setAllocations((prev) =>
        prev.map((a) => ({
          ...a,
          amount: Math.round((a.percentage / 100) * total),
        })),
      );
    }
  }, [totalAmount, usePercentage]);

  const updateAllocation = (
    index: number,
    field: keyof AllocationRow,
    value: string | number,
  ) => {
    setAllocations((prev) => {
      const updated = [...prev];
      if (field === "wallet_id") {
        updated[index].wallet_id = value as string;
      } else if (field === "percentage") {
        const pct = parseFloat(value as string) || 0;
        updated[index].percentage = pct;
        if (usePercentage && totalAmount) {
          updated[index].amount = Math.round(
            (pct / 100) * (parseFloat(totalAmount) || 0),
          );
        }
      } else if (field === "amount") {
        const amt = parseFloat(value as string) || 0;
        updated[index].amount = amt;
        if (totalAmount) {
          updated[index].percentage = Math.round(
            (amt / (parseFloat(totalAmount) || 1)) * 100,
          );
        }
      }
      return updated;
    });
  };

  const addAllocation = () => {
    setAllocations((prev) => [
      ...prev,
      { wallet_id: "", amount: 0, percentage: 0 },
    ]);
  };

  const removeAllocation = (index: number) => {
    if (allocations.length > 1) {
      setAllocations((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const applyTemplate = (template: Template) => {
    const total = parseFloat(totalAmount) || 0;
    const newAllocations = template.allocations.map((a) => ({
      wallet_id: a.wallet_id,
      percentage: a.percentage || 0,
      amount: a.percentage
        ? Math.round((a.percentage / 100) * total)
        : a.fixed_amount || 0,
    }));
    setAllocations(newAllocations);
    setUsePercentage(true);
    toast.success(`Template "${template.name}" diterapkan`);
  };

  const handleSubmit = async () => {
    // Validation
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error("Masukkan jumlah total pendapatan");
      return;
    }

    const validAllocations = allocations.filter(
      (a) => a.wallet_id && a.amount > 0,
    );

    if (validAllocations.length === 0) {
      toast.error("Tambahkan minimal satu alokasi dompet");
      return;
    }

    if (Math.abs(remaining) > 1) {
      toast.error(`Sisa ${formatCurrency(remaining)} belum dialokasikan`);
      return;
    }

    setLoading(true);

    try {
      // Save template if requested
      if (saveAsTemplate && templateName) {
        const templateAllocations: DistributionAllocation[] = allocations
          .filter((a) => a.wallet_id)
          .map((a) => ({
            wallet_id: a.wallet_id,
            wallet_name: wallets.find((w) => w.id === a.wallet_id)?.name,
            percentage: a.percentage,
          }));

        await createDistributionTemplate(templateName, templateAllocations);
      }

      // Distribute income
      const result = await distributeIncome({
        total_amount: parseFloat(totalAmount),
        allocations: validAllocations.map((a) => ({
          wallet_id: a.wallet_id,
          amount: a.amount,
        })),
        category_id: categoryId || undefined,
        description: description || "Distribusi Pendapatan",
        date,
      });

      if (result.success) {
        toast.success(
          `Pendapatan berhasil didistribusikan ke ${result.transactionsCreated} dompet!`,
        );
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error || "Gagal mendistribusikan pendapatan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTotalAmount("");
    setAllocations([{ wallet_id: "", amount: 0, percentage: 0 }]);
    setCategoryId("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setSaveAsTemplate(false);
    setTemplateName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Distribusi Pendapatan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Distribusi Pendapatan
          </DialogTitle>
          <DialogDescription>
            Bagikan pendapatan ke beberapa dompet sekaligus
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Templates */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookTemplate className="h-4 w-4" />
                Gunakan Template
              </Label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Pendapatan *</Label>
            <Input
              id="totalAmount"
              type="number"
              placeholder="Contoh: 5000000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori (Opsional)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Input
              id="description"
              placeholder="Contoh: Gaji Bulanan Februari"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4">
            <Label>Mode Alokasi:</Label>
            <Button
              type="button"
              variant={usePercentage ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePercentage(true)}
            >
              Persentase
            </Button>
            <Button
              type="button"
              variant={!usePercentage ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePercentage(false)}
            >
              Nominal
            </Button>
          </div>

          {/* Allocations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Alokasi Dompet</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAllocation}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Tambah
              </Button>
            </div>

            {allocations.map((alloc, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={alloc.wallet_id}
                  onValueChange={(v) => updateAllocation(index, "wallet_id", v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih dompet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.icon} {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {usePercentage ? (
                  <div className="flex items-center gap-1 w-24">
                    <Input
                      type="number"
                      value={alloc.percentage || ""}
                      onChange={(e) =>
                        updateAllocation(index, "percentage", e.target.value)
                      }
                      className="text-right"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={alloc.amount || ""}
                    onChange={(e) =>
                      updateAllocation(index, "amount", e.target.value)
                    }
                    className="w-32"
                    placeholder="Nominal"
                  />
                )}

                <div className="w-28 text-right text-sm font-medium">
                  {formatCurrency(alloc.amount)}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAllocation(index)}
                  disabled={allocations.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Summary */}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-muted-foreground">
                Total Dialokasikan:
              </span>
              <span className="font-medium">
                {formatCurrency(totalAllocated)}
              </span>
            </div>
            {Math.abs(remaining) > 0.01 && (
              <div
                className={`flex justify-between items-center text-sm ${
                  remaining > 0 ? "text-orange-600" : "text-red-600"
                }`}
              >
                <span>{remaining > 0 ? "Sisa:" : "Melebihi:"}</span>
                <span className="font-medium">
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            )}
          </div>

          {/* Save as Template */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveTemplate"
                checked={saveAsTemplate}
                onCheckedChange={(checked) =>
                  setSaveAsTemplate(checked as boolean)
                }
              />
              <Label htmlFor="saveTemplate" className="cursor-pointer">
                Simpan sebagai template untuk digunakan lagi
              </Label>
            </div>
            {saveAsTemplate && (
              <Input
                placeholder="Nama template (contoh: Gaji Bulanan)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Distribusikan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
