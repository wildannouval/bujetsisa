"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { deleteCategory } from "@/lib/actions/categories";
import { toast } from "sonner";
import { CategoryDialog } from "./category-dialog";
import {
  Edit,
  MoreVertical,
  Trash,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryWithStats extends Category {
  monthlyAmount?: number;
  transactionCount?: number;
}

interface CategoryListProps {
  categories: CategoryWithStats[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm(t.common.confirm_delete)) {
      const result = await deleteCategory(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(t.categories.delete_success);
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

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const renderCategoryCard = (category: CategoryWithStats) => (
    <Card key={category.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                category.type === "income"
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              {category.icon}
            </div>
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {category.type === "income" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span>
                  {category.transactionCount || 0}{" "}
                  {t.categories.transactions_this_month}
                </span>
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
              <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                {t.common.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(category.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                {t.common.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t.categories.monthly_amount}
            </span>
            <span
              className={`font-semibold ${
                category.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {category.type === "income" ? "+" : "-"}
              {formatCurrency(category.monthlyAmount || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="all">
            {t.categories.filter_all} ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="income">
            <TrendingUp className="mr-1 h-3 w-3" />
            {t.categories.types.income} ({incomeCategories.length})
          </TabsTrigger>
          <TabsTrigger value="expense">
            <TrendingDown className="mr-1 h-3 w-3" />
            {t.categories.types.expense} ({expenseCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border rounded-lg bg-muted/10">
              {t.categories.no_categories}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map(renderCategoryCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          {incomeCategories.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border rounded-lg bg-muted/10">
              {t.categories.no_income_categories}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map(renderCategoryCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expense" className="mt-6">
          {expenseCategories.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border rounded-lg bg-muted/10">
              {t.categories.no_expense_categories}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map(renderCategoryCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editingCategory && (
        <CategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />
      )}
    </>
  );
}
