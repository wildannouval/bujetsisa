"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Check,
  X,
  Users,
  Receipt,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getSplitBills,
  createSplitBill,
  toggleParticipantPaid,
  settleSplitBill,
  deleteSplitBill,
  type SplitBill,
} from "@/lib/actions/split-bills";
import { toast } from "sonner";

export default function SplitBillsPage() {
  const [bills, setBills] = useState<SplitBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [participants, setParticipants] = useState<
    { name: string; amount: string }[]
  >([{ name: "", amount: "" }]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    const data = await getSplitBills();
    setBills(data);
    setLoading(false);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: "", amount: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (
    index: number,
    field: "name" | "amount",
    value: string,
  ) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const splitEvenly = () => {
    const total = parseFloat(totalAmount.replace(/\./g, "") || "0");
    if (total <= 0 || participants.length === 0) return;
    const perPerson = Math.round(total / participants.length);
    setParticipants(
      participants.map((p) => ({ ...p, amount: perPerson.toString() })),
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Judul harus diisi");
      return;
    }

    const total = parseFloat(totalAmount.replace(/\./g, "") || "0");
    if (total <= 0) {
      toast.error("Total harus lebih dari 0");
      return;
    }

    const validParticipants = participants
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        amount: parseFloat(p.amount.replace(/\./g, "") || "0"),
      }));

    if (validParticipants.length === 0) {
      toast.error("Minimal 1 peserta");
      return;
    }

    setCreating(true);
    const result = await createSplitBill(
      title.trim(),
      total,
      validParticipants,
      notes.trim() || undefined,
    );

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Split bill berhasil dibuat!");
      setDialogOpen(false);
      setTitle("");
      setTotalAmount("");
      setNotes("");
      setParticipants([{ name: "", amount: "" }]);
      loadBills();
    }
    setCreating(false);
  };

  const handleTogglePaid = async (
    participantId: string,
    currentPaid: boolean,
  ) => {
    const result = await toggleParticipantPaid(participantId, !currentPaid);
    if (result.error) toast.error(result.error);
    else loadBills();
  };

  const handleSettle = async (billId: string) => {
    const result = await settleSplitBill(billId);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Bill sudah diselesaikan!");
      loadBills();
    }
  };

  const handleDelete = async (billId: string) => {
    const result = await deleteSplitBill(billId);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Bill berhasil dihapus");
      loadBills();
    }
  };

  const activeBills = bills.filter((b) => b.status === "active");
  const settledBills = bills.filter((b) => b.status === "settled");

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Split Bill</h1>
          <p className="text-muted-foreground">
            Bagi tagihan dengan teman dan lacak pembayaran
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Split Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Split Bill Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Judul</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Makan siang bersama..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Total Tagihan</Label>
                <Input
                  value={totalAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTotalAmount(e.target.value)
                  }
                  placeholder="Contoh: 250000"
                  inputMode="numeric"
                />
              </div>
              <div className="grid gap-2">
                <Label>Catatan (opsional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                />
              </div>

              {/* Participants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Peserta</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={splitEvenly}
                      className="text-xs"
                    >
                      Bagi Rata
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addParticipant}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {participants.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Nama"
                      value={p.name}
                      onChange={(e) =>
                        updateParticipant(i, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Jumlah"
                      value={p.amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateParticipant(i, "amount", e.target.value)
                      }
                      inputMode="numeric"
                      className="w-32"
                    />
                    {participants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(i)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Membuat..." : "Buat Split Bill"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBills.length}</p>
                <p className="text-xs text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settledBills.length}</p>
                <p className="text-xs text-muted-foreground">Selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bills.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Bills */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Memuat...
        </div>
      ) : bills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Belum ada split bill. Buat yang pertama!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeBills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Aktif</h2>
              {activeBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={handleTogglePaid}
                  onSettle={handleSettle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {settledBills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Selesai
              </h2>
              {settledBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={handleTogglePaid}
                  onSettle={handleSettle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BillCard({
  bill,
  onTogglePaid,
  onSettle,
  onDelete,
}: {
  bill: SplitBill;
  onTogglePaid: (id: string, current: boolean) => void;
  onSettle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const participants = bill.participants || [];
  const paidCount = participants.filter((p) => p.is_paid).length;
  const paidAmount = participants
    .filter((p) => p.is_paid)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const progress =
    participants.length > 0 ? (paidCount / participants.length) * 100 : 0;
  const isSettled = bill.status === "settled";

  return (
    <Card className={isSettled ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{bill.title}</CardTitle>
            <CardDescription>
              {new Date(bill.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {bill.notes && ` • ${bill.notes}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isSettled ? "default" : "secondary"}
              className={
                isSettled
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : ""
              }
            >
              {isSettled ? "Selesai" : `${paidCount}/${participants.length}`}
            </Badge>
            {!isSettled && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(bill.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">
            {formatCurrency(bill.total_amount)}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              p.is_paid
                ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-1 ${p.is_paid ? "bg-green-200 dark:bg-green-800" : "bg-muted"}`}
              >
                {p.is_paid ? (
                  <Check className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${p.is_paid ? "line-through text-muted-foreground" : ""}`}
              >
                {p.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {formatCurrency(p.amount)}
              </span>
              {!isSettled && (
                <Button
                  variant={p.is_paid ? "outline" : "default"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onTogglePaid(p.id, p.is_paid)}
                >
                  {p.is_paid ? "Batal" : "Bayar"}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Settle Button */}
        {!isSettled &&
          paidCount === participants.length &&
          participants.length > 0 && (
            <Button
              className="w-full mt-2 bg-green-600 hover:bg-green-700"
              onClick={() => onSettle(bill.id)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Selesaikan Bill
            </Button>
          )}
      </CardContent>
    </Card>
  );
}
