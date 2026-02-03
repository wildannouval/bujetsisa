"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportTransactionsToCSV,
  exportWalletsToCSV,
  exportBudgetsToCSV,
  exportGoalsToCSV,
  exportDebtsToCSV,
  exportInvestmentsToCSV,
} from "@/lib/export";

interface ExportButtonProps {
  type:
    | "transactions"
    | "wallets"
    | "budgets"
    | "goals"
    | "debts"
    | "investments";
  data: any[];
  label?: string;
}

export function ExportButton({ type, data, label }: ExportButtonProps) {
  const handleExport = () => {
    switch (type) {
      case "transactions":
        exportTransactionsToCSV(data);
        break;
      case "wallets":
        exportWalletsToCSV(data);
        break;
      case "budgets":
        exportBudgetsToCSV(data);
        break;
      case "goals":
        exportGoalsToCSV(data);
        break;
      case "debts":
        exportDebtsToCSV(data);
        break;
      case "investments":
        exportInvestmentsToCSV(data);
        break;
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">{label || "Ekspor CSV"}</span>
    </Button>
  );
}

interface ExportAllButtonProps {
  transactions?: any[];
  wallets?: any[];
  budgets?: any[];
  goals?: any[];
  debts?: any[];
  investments?: any[];
}

export function ExportAllButton({
  transactions,
  wallets,
  budgets,
  goals,
  debts,
  investments,
}: ExportAllButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Ekspor</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {transactions && transactions.length > 0 && (
          <DropdownMenuItem
            onClick={() => exportTransactionsToCSV(transactions)}
          >
            Transaksi
          </DropdownMenuItem>
        )}
        {wallets && wallets.length > 0 && (
          <DropdownMenuItem onClick={() => exportWalletsToCSV(wallets)}>
            Dompet
          </DropdownMenuItem>
        )}
        {budgets && budgets.length > 0 && (
          <DropdownMenuItem onClick={() => exportBudgetsToCSV(budgets)}>
            Anggaran
          </DropdownMenuItem>
        )}
        {goals && goals.length > 0 && (
          <DropdownMenuItem onClick={() => exportGoalsToCSV(goals)}>
            Target Tabungan
          </DropdownMenuItem>
        )}
        {debts && debts.length > 0 && (
          <DropdownMenuItem onClick={() => exportDebtsToCSV(debts)}>
            Hutang & Piutang
          </DropdownMenuItem>
        )}
        {investments && investments.length > 0 && (
          <DropdownMenuItem onClick={() => exportInvestmentsToCSV(investments)}>
            Investasi
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
