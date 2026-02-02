"use server";

import { createClient } from "@/lib/supabase/server";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Update password - Supabase handles the password change
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function exportUserData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Fetch all user data
  const [wallets, transactions, categories, budgets, goals, debts] =
    await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", user.id),
      supabase
        .from("transactions")
        .select("*, category:categories(name), wallet:wallets(name)")
        .eq("user_id", user.id),
      supabase.from("categories").select("*").eq("user_id", user.id),
      supabase
        .from("budgets")
        .select("*, category:categories(name)")
        .eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("debts").select("*").eq("user_id", user.id),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "",
      createdAt: user.created_at,
    },
    wallets: wallets.data || [],
    transactions: transactions.data || [],
    categories: categories.data || [],
    budgets: budgets.data || [],
    goals: goals.data || [],
    debts: debts.data || [],
    summary: {
      totalWallets: wallets.data?.length || 0,
      totalTransactions: transactions.data?.length || 0,
      totalCategories: categories.data?.length || 0,
      totalBudgets: budgets.data?.length || 0,
      totalGoals: goals.data?.length || 0,
      totalDebts: debts.data?.length || 0,
    },
  };

  return { data: exportData };
}

export async function deleteUserAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Delete all user data in order (due to foreign key constraints)
  // 1. Delete transactions first (depends on wallets and categories)
  await supabase.from("transactions").delete().eq("user_id", user.id);

  // 2. Delete budgets (depends on categories)
  await supabase.from("budgets").delete().eq("user_id", user.id);

  // 3. Delete goals
  await supabase.from("goals").delete().eq("user_id", user.id);

  // 4. Delete debts
  await supabase.from("debts").delete().eq("user_id", user.id);

  // 5. Delete wallets
  await supabase.from("wallets").delete().eq("user_id", user.id);

  // 6. Delete categories
  await supabase.from("categories").delete().eq("user_id", user.id);

  // Note: Actual user deletion from auth.users typically requires admin privileges
  // or a Supabase Edge Function. Here we just clear all user data.
  // The user account will still exist but with no data.

  return { success: true };
}
