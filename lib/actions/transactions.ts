"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { updateGoalFromWallet } from "./distributions";

export async function getTransactions(filters?: {
  type?: string;
  walletId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(id, name, icon),
      wallet:wallets(id, name, icon)
    `,
    )
    .eq("user_id", user.id);

  // Apply filters
  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }
  if (filters?.walletId && filters.walletId !== "all") {
    query = query.eq("wallet_id", filters.walletId);
  }
  if (filters?.categoryId && filters.categoryId !== "all") {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }
  if (filters?.search) {
    query = query.ilike("description", `%${filters.search}%`);
  }

  const { data, error } = await query.order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

export async function getTransactionStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalTransactions: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      netAmount: 0,
    };
  }

  // Get this month's transactions
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", startOfMonth.toISOString().split("T")[0]);

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  transactions?.forEach((t) => {
    if (t.type === "income") {
      monthlyIncome += Number(t.amount);
    } else {
      monthlyExpense += Number(t.amount);
    }
  });

  // Get total transaction count
  const { count } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return {
    totalTransactions: count || 0,
    monthlyIncome,
    monthlyExpense,
    netAmount: monthlyIncome - monthlyExpense,
  };
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const wallet_id = formData.get("wallet_id") as string;
  const category_id = (formData.get("category_id") as string) || null;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const date = (formData.get("date") as string) || new Date().toISOString();
  const description = (formData.get("description") as string) || "";
  const type = (formData.get("type") as string) || "expense";

  if (!wallet_id) {
    return { error: "Wallet is required" };
  }

  if (amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      wallet_id,
      category_id,
      amount,
      date,
      description,
      type,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    return { error: error.message };
  }

  // Sync goal progress if wallet is linked to a goal
  await updateGoalFromWallet(wallet_id);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/categories");
  revalidatePath("/goals");
  return { data };
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();

  const wallet_id = formData.get("wallet_id") as string;
  const category_id = (formData.get("category_id") as string) || null;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;

  const { data, error } = await supabase
    .from("transactions")
    .update({ wallet_id, category_id, amount, date, description, type })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/categories");
  return { data };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/categories");
  return { success: true };
}
