"use client";

import { Debt } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import {
  deleteDebt,
  markDebtAsPaid,
  markDebtAsUnpaid,
} from "@/lib/actions/debts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DebtDialog } from "./debt-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  MoreVertical,
  Trash,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DebtWithCalculations extends Debt {
  daysUntilDue?: number | null;
  isOverdue?: boolean;
}

interface DebtListProps {
  debts: DebtWithCalculations[];
}

export function DebtList({ debts }: DebtListProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const payableDebts = debts.filter(
    (d) => d.type === "payable" && d.status === "unpaid",
  );
  const receivableDebts = debts.filter(
    (d) => d.type === "receivable" && d.status === "unpaid",
  );
  const paidDebts = debts.filter((d) => d.status === "paid");

  const handleDelete = async (id: string) => {
    if (confirm(t.common.confirm_delete)) {
      const result = await deleteDebt(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t.debts.delete_success);
        router.refresh();
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    const result = await markDebtAsPaid(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(t.debts.mark_paid_success);
      router.refresh();
    }
  };

  const handleMarkAsUnpaid = async (id: string) => {
    const result = await markDebtAsUnpaid(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(t.debts.mark_unpaid_success);
      router.refresh();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderDebtCard = (debt: DebtWithCalculations) => (
    <Card
      key={debt.id}
      className={cn(
        "hover:shadow-md transition-all",
        debt.isOverdue && "border-red-300 dark:border-red-800",
        debt.status === "paid" &&
          "opacity-75 border-green-300 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-white",
              debt.type === "payable" ? "bg-red-500" : "bg-green-500",
            )}
          >
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{debt.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={debt.type === "payable" ? "destructive" : "default"}
                className="text-xs"
              >
                {debt.type === "payable"
                  ? t.debts.types.payable
                  : t.debts.types.receivable}
              </Badge>
              <Badge
                variant={debt.status === "paid" ? "outline" : "secondary"}
                className={cn(
                  "text-xs",
                  debt.status === "paid" && "border-green-500 text-green-600",
                )}
              >
                {debt.status === "paid"
                  ? t.debts.status.paid
                  : t.debts.status.unpaid}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {debt.status === "unpaid" ? (
              <DropdownMenuItem onClick={() => handleMarkAsPaid(debt.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t.debts.mark_as_paid}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleMarkAsUnpaid(debt.id)}>
                <XCircle className="mr-2 h-4 w-4" />
                {t.debts.mark_as_unpaid}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditingDebt(debt)}>
              <Edit className="mr-2 h-4 w-4" />
              {t.common.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(debt.id)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t.common.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t.debts.amount_label}
          </span>
          <span
            className={cn(
              "text-xl font-bold",
              debt.type === "payable" ? "text-red-600" : "text-green-600",
            )}
          >
            {debt.type === "payable" ? "-" : "+"}
            {formatCurrency(debt.amount)}
          </span>
        </div>

        {debt.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t.debts.due_date_label}:
            </span>
            <span className={cn(debt.isOverdue && "text-red-600 font-medium")}>
              {format(new Date(debt.due_date), "dd MMM yyyy")}
            </span>
          </div>
        )}

        {debt.status === "unpaid" &&
          debt.daysUntilDue !== null &&
          debt.daysUntilDue !== undefined && (
            <div
              className={cn(
                "flex items-center gap-2 text-xs p-2 rounded-md",
                debt.isOverdue
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                  : debt.daysUntilDue <= 7
                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600"
                    : "bg-muted text-muted-foreground",
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>
                {debt.isOverdue
                  ? `${Math.abs(debt.daysUntilDue)} ${t.debts.days_overdue}`
                  : debt.daysUntilDue === 0
                    ? t.debts.due_today
                    : `${debt.daysUntilDue} ${t.debts.days_left}`}
              </span>
            </div>
          )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
      {message}
    </div>
  );

  return (
    <>
      <Tabs defaultValue="payable" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="payable" className="text-red-600">
            {t.debts.types.payable} ({payableDebts.length})
          </TabsTrigger>
          <TabsTrigger value="receivable" className="text-green-600">
            {t.debts.types.receivable} ({receivableDebts.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            {t.debts.status.paid} ({paidDebts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payable" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payableDebts.length === 0 ? (
              <EmptyState message={t.debts.no_payable} />
            ) : (
              payableDebts.map(renderDebtCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="receivable" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {receivableDebts.length === 0 ? (
              <EmptyState message={t.debts.no_receivable} />
            ) : (
              receivableDebts.map(renderDebtCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paidDebts.length === 0 ? (
              <EmptyState message={t.debts.no_paid} />
            ) : (
              paidDebts.map(renderDebtCard)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {editingDebt && (
        <DebtDialog
          debt={editingDebt}
          open={!!editingDebt}
          onOpenChange={(open) => !open && setEditingDebt(null)}
        />
      )}
    </>
  );
}
