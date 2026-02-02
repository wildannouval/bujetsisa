"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useTranslation } from "@/hooks/use-translation";
import { Debt } from "@/lib/types";
import { createDebt, updateDebt } from "@/lib/actions/debts";
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

interface DebtDialogProps {
  debt?: Debt;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DebtDialog({ debt, open, onOpenChange }: DebtDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    debt?.due_date ? new Date(debt.due_date) : undefined,
  );

  const isEdit = !!debt;
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (dueDate) {
      formData.set("due_date", dueDate.toISOString());
    }

    try {
      let result;
      if (isEdit) {
        result = await updateDebt(debt.id, formData);
      } else {
        result = await createDebt(formData);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? t.debts.update_success : t.debts.create_success);
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.debts.add_button}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.debts.edit_title : t.debts.add_title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.debts.name_label}</Label>
              <Input
                name="name"
                defaultValue={debt?.name}
                placeholder="e.g., John Doe, Credit Card"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.amount_label}</Label>
              <CurrencyInput
                name="amount"
                defaultValue={debt?.amount}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.type_label}</Label>
              <Select name="type" defaultValue={debt?.type || "payable"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payable">
                    {t.debts.types.payable}
                  </SelectItem>
                  <SelectItem value="receivable">
                    {t.debts.types.receivable}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.status_label}</Label>
              <Select name="status" defaultValue={debt?.status || "unpaid"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">
                    {t.debts.status.unpaid}
                  </SelectItem>
                  <SelectItem value="paid">{t.debts.status.paid}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.debts.due_date_label}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP")
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
