"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, Delete, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTransaction } from "@/lib/actions/transactions";
import { getWallets } from "@/lib/actions/wallets";
import { getCategories } from "@/lib/actions/categories";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface Wallet {
  id: string;
  name: string;
  icon: string;
  balance: number;
}

export default function QuickAddPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"amount" | "details">("amount");

  useEffect(() => {
    async function loadData() {
      const [w, c] = await Promise.all([getWallets(), getCategories()]);
      setWallets(w as Wallet[]);
      setCategories(c as Category[]);
      if (w.length > 0) setWalletId(w[0].id);
    }
    loadData();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleNumpad = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
    } else if (key === "000") {
      if (amount !== "0") setAmount((prev) => prev + "000");
    } else {
      if (amount === "0") {
        setAmount(key);
      } else {
        setAmount((prev) => prev + key);
      }
    }
  };

  const formattedAmount = new Intl.NumberFormat("id-ID").format(
    parseInt(amount) || 0,
  );

  const handleSubmit = async () => {
    if (parseInt(amount) <= 0 || !walletId || !categoryId) {
      toast.error("Lengkapi semua data terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("amount", amount);
      formData.set("type", type);
      formData.set("wallet_id", walletId);
      formData.set("category_id", categoryId);
      formData.set(
        "description",
        description ||
          (type === "expense" ? "Pengeluaran cepat" : "Pemasukan cepat"),
      );
      formData.set("date", new Date().toISOString().split("T")[0]);

      const result = await createTransaction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi berhasil dicatat! ✅");
        setAmount("0");
        setCategoryId("");
        setDescription("");
        setStep("amount");
        router.refresh();
      }
    } catch (error) {
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Catat Cepat</h1>
      </div>

      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={type === "expense" ? "default" : "outline"}
          className={`h-12 text-base ${type === "expense" ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={() => {
            setType("expense");
            setCategoryId("");
          }}
        >
          💸 Pengeluaran
        </Button>
        <Button
          variant={type === "income" ? "default" : "outline"}
          className={`h-12 text-base ${type === "income" ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={() => {
            setType("income");
            setCategoryId("");
          }}
        >
          💰 Pemasukan
        </Button>
      </div>

      {step === "amount" ? (
        <>
          {/* Amount Display */}
          <Card
            className={`border-2 ${type === "expense" ? "border-red-200 dark:border-red-800" : "border-green-200 dark:border-green-800"}`}
          >
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Jumlah</p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                <span className="text-muted-foreground text-lg">Rp</span>{" "}
                {formattedAmount}
              </p>
            </CardContent>
          </Card>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "000",
              "0",
              "backspace",
            ].map((key) => (
              <Button
                key={key}
                variant="outline"
                className="h-14 text-xl font-medium"
                onClick={() => handleNumpad(key)}
              >
                {key === "backspace" ? <Delete className="h-5 w-5" /> : key}
              </Button>
            ))}
          </div>

          <Button
            className="h-14 text-lg"
            disabled={parseInt(amount) <= 0}
            onClick={() => setStep("details")}
          >
            Lanjutkan →
          </Button>
        </>
      ) : (
        <>
          {/* Amount Summary */}
          <Card
            className={`${type === "expense" ? "bg-red-50 dark:bg-red-950/20" : "bg-green-50 dark:bg-green-950/20"}`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {type === "expense" ? "Pengeluaran" : "Pemasukan"}
                </p>
                <p
                  className={`text-xl font-bold ${type === "expense" ? "text-red-600" : "text-green-600"}`}
                >
                  Rp {formattedAmount}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("amount")}
              >
                Ubah
              </Button>
            </CardContent>
          </Card>

          {/* Wallet */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dompet</label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Pilih dompet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    <span className="flex items-center gap-2">
                      <span>{w.icon || "💵"}</span>
                      <span>{w.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection - Grid of buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    categoryId === cat.id
                      ? type === "expense"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] sm:text-xs text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan (Opsional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Makan siang"
              className="h-12"
            />
          </div>

          {/* Submit */}
          <Button
            className={`h-14 text-lg ${type === "expense" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
            disabled={loading || !categoryId || !walletId}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Check className="h-5 w-5 mr-2" />
            )}
            Simpan Transaksi
          </Button>
        </>
      )}
    </div>
  );
}
