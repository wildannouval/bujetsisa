"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function getCategoriesWithStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // Get categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Get this month's transactions grouped by category
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("category_id, amount, type")
    .eq("user_id", user.id)
    .gte("date", startOfMonth.toISOString().split("T")[0]);

  // Calculate spending per category
  const spending: Record<string, number> = {};
  const transactionCount: Record<string, number> = {};

  transactions?.forEach((t) => {
    if (t.category_id) {
      spending[t.category_id] =
        (spending[t.category_id] || 0) + Number(t.amount);
      transactionCount[t.category_id] =
        (transactionCount[t.category_id] || 0) + 1;
    }
  });

  return (categories || []).map((cat) => ({
    ...cat,
    monthlyAmount: spending[cat.id] || 0,
    transactionCount: transactionCount[cat.id] || 0,
  }));
}

export async function getCategoryStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { totalCategories: 0, incomeCategories: 0, expenseCategories: 0 };
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("type")
    .eq("user_id", user.id);

  const totalCategories = categories?.length || 0;
  const incomeCategories =
    categories?.filter((c) => c.type === "income").length || 0;
  const expenseCategories =
    categories?.filter((c) => c.type === "expense").length || 0;

  return { totalCategories, incomeCategories, expenseCategories };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "expense";
  const icon = (formData.get("icon") as string) || "📦";

  if (!name) {
    return { error: "Name is required" };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name,
      type,
      icon,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgeting");
  return { data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const icon = formData.get("icon") as string;

  const { data, error } = await supabase
    .from("categories")
    .update({ name, type, icon })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgeting");
  return { data };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgeting");
  return { success: true };
}
