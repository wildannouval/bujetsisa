"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useTranslation } from "@/hooks/use-translation";
import { Category, Transaction, Wallet } from "@/lib/types";
import {
  createTransaction,
  updateTransaction,
} from "@/lib/actions/transactions";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useRouter } from "next/navigation";
import { TagPicker } from "@/components/tags/tag-picker";
import { setTransactionTags } from "@/lib/actions/tags";

interface TransactionDialogProps {
  transaction?: Transaction;
  wallets: Wallet[];
  categories: Category[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransactionDialog({
  transaction,
  wallets,
  categories,
  open,
  onOpenChange,
}: TransactionDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    transaction ? new Date(transaction.date) : new Date(),
  );
  const [type, setType] = useState<string>(transaction?.type || "expense");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isEdit = !!transaction;
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (date) {
      formData.set("date", date.toISOString());
    }
    formData.set("type", type);

    try {
      let result;
      if (isEdit) {
        result = await updateTransaction(transaction.id, formData);
      } else {
        result = await createTransaction(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEdit
            ? t.transactions.update_success
            : t.transactions.create_success,
        );

        // Save tags if any selected
        if (selectedTags.length > 0 && result?.data?.id) {
          await setTransactionTags(result.data.id, selectedTags);
        } else if (isEdit && transaction) {
          await setTransactionTags(transaction.id, selectedTags);
        }

        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.transactions.add_button}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.transactions.edit_title : t.transactions.add_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.transactions.type_label}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    {t.transactions.types.expense}
                  </SelectItem>
                  <SelectItem value="income">
                    {t.transactions.types.income}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.transactions.amount_label}</Label>
              <CurrencyInput
                name="amount"
                defaultValue={transaction?.amount}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.transactions.wallet_label}</Label>
              <Select name="wallet_id" defaultValue={transaction?.wallet_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.transactions.category_label}</Label>
              <Select
                name="category_id"
                defaultValue={transaction?.category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No {type} categories. Create one first.
                    </div>
                  ) : (
                    filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="mr-2">{c.icon}</span>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.transactions.date_label}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>{t.transactions.description_label}</Label>
              <Input
                name="description"
                defaultValue={transaction?.description}
                placeholder="e.g., Lunch at restaurant"
              />
            </div>

            <div className="grid gap-2">
              <Label>Tag</Label>
              <TagPicker
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
