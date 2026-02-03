import { CategoryDialog } from "@/components/categories/category-dialog";
import { CategoryList } from "@/components/categories/category-list";
import { CategorySummary } from "@/components/categories/category-summary";
import {
  getCategoriesWithStats,
  getCategoryStats,
} from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const [categories, stats] = await Promise.all([
    getCategoriesWithStats().catch(() => []),
    getCategoryStats().catch(() => ({
      totalCategories: 0,
      incomeCategories: 0,
      expenseCategories: 0,
    })),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:gap-8 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Kategori
        </h1>
        <CategoryDialog />
      </div>

      <CategorySummary stats={stats} />

      <CategoryList categories={categories} />
    </div>
  );
}
