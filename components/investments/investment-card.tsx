"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Investment } from "@/lib/types";
import {
  MoreVertical,
  Pencil,
  Trash,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvestmentDialog } from "./investment-dialog";
import { useState } from "react";
import { deleteInvestment } from "@/lib/actions/investments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvestmentCardProps {
  investment: Investment;
}

const TYPE_LABELS: Record<string, string> = {
  stock: "Saham",
  mutual_fund: "Reksadana",
  crypto: "Kripto",
  bond: "Obligasi",
  property: "Properti",
  gold: "Emas",
  deposit: "Deposito",
  other: "Lainnya",
};

const TYPE_COLORS: Record<string, string> = {
  stock: "from-blue-500 to-indigo-600",
  mutual_fund: "from-green-500 to-emerald-600",
  crypto: "from-orange-500 to-amber-600",
  bond: "from-purple-500 to-violet-600",
  property: "from-rose-500 to-pink-600",
  gold: "from-yellow-500 to-amber-600",
  deposit: "from-cyan-500 to-teal-600",
  other: "from-gray-500 to-slate-600",
};

export function InvestmentCard({ investment }: InvestmentCardProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (confirm("Yakin ingin menghapus investasi ini?")) {
      const result = await deleteInvestment(investment.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Investasi berhasil dihapus");
        router.refresh();
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const invested =
    Number(investment.quantity) * Number(investment.avg_buy_price);
  const currentValue =
    Number(investment.quantity) * Number(investment.current_price);
  const gain = currentValue - invested;
  const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;
  const isProfit = gain >= 0;

  const gradient = TYPE_COLORS[investment.type] || TYPE_COLORS.other;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={`bg-gradient-to-r ${gradient} p-3 sm:p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 text-xl sm:text-2xl">
                {investment.icon || "📈"}
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  {investment.name}
                </h3>
                <p className="text-xs sm:text-sm text-white/80">
                  {TYPE_LABELS[investment.type]}{" "}
                  {investment.ticker && `• ${investment.ticker}`}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/investments/${investment.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Current Value */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Nilai Saat Ini
              </p>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {formatCurrency(currentValue)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Jumlah</p>
                <p className="font-medium">
                  {Number(investment.quantity).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Harga Rata-rata</p>
                <p className="font-medium truncate">
                  {formatCurrency(Number(investment.avg_buy_price))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Harga Sekarang</p>
                <p className="font-medium truncate">
                  {formatCurrency(Number(investment.current_price))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Keuntungan/Rugi</p>
                <div className="flex items-center gap-1">
                  {isProfit ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${isProfit ? "text-green-600" : "text-red-600"}`}
                  >
                    {gainPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Platform */}
            {investment.platform && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {investment.platform}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <InvestmentDialog
        investment={investment}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  );
}
