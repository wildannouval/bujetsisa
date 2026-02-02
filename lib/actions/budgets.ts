"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBudgets() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data: budgets, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      category:categories(id, name, icon, type)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }

  return budgets || [];
}

export async function getBudgetsWithSpending() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // Get budgets with categories
  const { data: budgets, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      category:categories(id, name, icon, type)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !budgets) {
    return [];
  }

  // Calculate spending for each budget based on period
  const now = new Date();
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      let startDate: Date;

      switch (budget.period) {
        case "weekly":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default: // monthly
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("category_id", budget.category_id)
        .eq("type", "expense")
        .gte("date", startDate.toISOString().split("T")[0]);

      const spent =
        transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const percentage =
        budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;

      return {
        ...budget,
        spent,
        percentage: Math.round(percentage),
        remaining: Math.max(budget.amount - spent, 0),
        isOverBudget: spent > budget.amount,
      };
    }),
  );

  return budgetsWithSpending;
}

export async function getBudgetStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalBudgets: 0,
      totalBudgeted: 0,
      totalSpent: 0,
      onTrack: 0,
      overBudget: 0,
    };
  }

  const budgets = await getBudgetsWithSpending();

  const totalBudgets = budgets.length;
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
  const overBudget = budgets.filter((b) => b.isOverBudget).length;
  const onTrack = totalBudgets - overBudget;

  return { totalBudgets, totalBudgeted, totalSpent, onTrack, overBudget };
}

export async function createBudget(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const category_id = formData.get("category_id") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const period = (formData.get("period") as string) || "monthly";

  if (!category_id) {
    return { error: "Category is required" };
  }

  if (amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  // Check if budget already exists for this category
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category_id", category_id)
    .single();

  if (existing) {
    return { error: "Budget for this category already exists" };
  }

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category_id,
      amount,
      period,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating budget:", error);
    return { error: error.message };
  }

  revalidatePath("/budgeting");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateBudget(id: string, formData: FormData) {
  const supabase = await createClient();

  const category_id = formData.get("category_id") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const period = formData.get("period") as string;

  const { data, error } = await supabase
    .from("budgets")
    .update({ category_id, amount, period })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating budget:", error);
    return { error: error.message };
  }

  revalidatePath("/budgeting");
  revalidatePath("/dashboard");
  return { data };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting budget:", error);
    return { error: error.message };
  }

  revalidatePath("/budgeting");
  revalidatePath("/dashboard");
  return { success: true };
}
