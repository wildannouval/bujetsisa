"use server";

import { createClient } from "@/lib/supabase/server";

export interface BudgetAlert {
  budgetId: string;
  categoryName: string;
  categoryIcon: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  alertType: "warning" | "danger" | "exceeded";
  message: string;
}

export async function getBudgetAlerts(): Promise<BudgetAlert[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Get all budgets with categories
  const { data: budgets } = await supabase
    .from("budgets")
    .select(
      `
      *,
      category:categories(id, name, icon)
    `,
    )
    .eq("user_id", user.id);

  if (!budgets || budgets.length === 0) return [];

  // Calculate date range based on period
  const now = new Date();
  const alerts: BudgetAlert[] = [];

  for (const budget of budgets) {
    let startDate: Date;

    switch (budget.period) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build query for transactions
    let query = supabase
      .from("transactions")
      .select("amount")
      .eq("category_id", budget.category_id)
      .eq("type", "expense")
      .gte("date", startDate.toISOString().split("T")[0]);

    // Filter by wallet if budget is linked
    if (budget.wallet_id) {
      query = query.eq("wallet_id", budget.wallet_id);
    }

    const { data: transactions } = await query;
    const spentAmount =
      transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const percentage = (spentAmount / Number(budget.amount)) * 100;

    // Handle category as array or object
    const category = Array.isArray(budget.category)
      ? budget.category[0]
      : budget.category;

    // Only create alerts for budgets that are getting close or exceeded
    if (percentage >= 75) {
      let alertType: BudgetAlert["alertType"];
      let message: string;

      if (percentage >= 100) {
        alertType = "exceeded";
        message = `Anggaran melebihi batas! Sudah ${percentage.toFixed(0)}% terpakai.`;
      } else if (percentage >= 90) {
        alertType = "danger";
        message = `Peringatan! Anggaran hampir habis (${percentage.toFixed(0)}%).`;
      } else {
        alertType = "warning";
        message = `Anggaran sudah ${percentage.toFixed(0)}% terpakai.`;
      }

      alerts.push({
        budgetId: budget.id,
        categoryName: category?.name || "Unknown",
        categoryIcon: category?.icon || "📦",
        budgetAmount: Number(budget.amount),
        spentAmount,
        percentage,
        alertType,
        message,
      });
    }
  }

  // Sort by percentage (highest first)
  alerts.sort((a, b) => b.percentage - a.percentage);

  return alerts;
}

// Get alerts count for badge
export async function getBudgetAlertsCount(): Promise<number> {
  const alerts = await getBudgetAlerts();
  return alerts.length;
}
