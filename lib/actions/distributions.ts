"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Types
export interface DistributionTemplate {
  id: string;
  user_id: string;
  name: string;
  allocations: DistributionAllocation[];
  created_at: string;
  updated_at: string;
}

export interface DistributionAllocation {
  wallet_id: string;
  wallet_name?: string;
  percentage?: number;
  fixed_amount?: number;
}

export interface DistributeIncomeInput {
  total_amount: number;
  allocations: {
    wallet_id: string;
    amount: number;
  }[];
  category_id?: string;
  description?: string;
  date?: string;
}

// Get all distribution templates
export async function getDistributionTemplates() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("distribution_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    console.error("Error fetching distribution templates:", error);
    return [];
  }

  return data || [];
}

// Create distribution template
export async function createDistributionTemplate(
  name: string,
  allocations: DistributionAllocation[],
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase.from("distribution_templates").insert({
    user_id: user.id,
    name,
    allocations,
  });

  if (error) {
    console.error("Error creating distribution template:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/transactions");
  return { success: true };
}

// Delete distribution template
export async function deleteDistributionTemplate(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("distribution_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting distribution template:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/transactions");
  return { success: true };
}

// Distribute income to multiple wallets
export async function distributeIncome(input: DistributeIncomeInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate total
  const totalAllocated = input.allocations.reduce(
    (sum, a) => sum + a.amount,
    0,
  );
  if (Math.abs(totalAllocated - input.total_amount) > 0.01) {
    return {
      success: false,
      error: `Total allocated (${totalAllocated}) doesn't match total amount (${input.total_amount})`,
    };
  }

  // Create transactions for each allocation
  const errors: string[] = [];
  let successCount = 0;

  for (const allocation of input.allocations) {
    if (allocation.amount <= 0) continue;

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      wallet_id: allocation.wallet_id,
      category_id: input.category_id || null,
      amount: allocation.amount,
      type: "income",
      description: input.description || "Distribusi Pendapatan",
      date: input.date || new Date().toISOString().split("T")[0],
    });

    if (error) {
      errors.push(`Wallet ${allocation.wallet_id}: ${error.message}`);
    } else {
      successCount++;

      // Check if wallet is linked to a goal and update goal progress
      await updateGoalFromWallet(allocation.wallet_id);
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  revalidatePath("/goals");

  if (errors.length > 0) {
    return {
      success: false,
      error: `${errors.length} errors: ${errors.join("; ")}`,
      partialSuccess: successCount > 0,
    };
  }

  return { success: true, transactionsCreated: successCount };
}

// Update goal current_amount from linked wallet balance
// Calculates wallet balance from transactions in real-time
export async function updateGoalFromWallet(walletId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Get wallet initial balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", walletId)
    .single();

  if (!wallet) return;

  // Calculate total from transactions for this wallet
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("wallet_id", walletId);

  let transactionBalance = 0;
  if (transactions) {
    transactions.forEach((t) => {
      if (t.type === "income") {
        transactionBalance += Number(t.amount);
      } else {
        transactionBalance -= Number(t.amount);
      }
    });
  }

  // Get wallet's initial balance (balance field stores initial balance)
  // The actual wallet balance = initial + transactions
  // But since balance gets updated by triggers, we just use it directly
  const currentBalance = Number(wallet.balance) || 0;

  // Find goals linked to this wallet and update them
  const { data: goals } = await supabase
    .from("goals")
    .select("id, target_amount, status")
    .eq("wallet_id", walletId)
    .eq("user_id", user.id);

  if (!goals || goals.length === 0) return;

  for (const goal of goals) {
    const newStatus =
      currentBalance >= Number(goal.target_amount) ? "completed" : "active";

    const { error } = await supabase
      .from("goals")
      .update({
        current_amount: currentBalance,
        status: goal.status !== "cancelled" ? newStatus : goal.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating goal from wallet:", error);
    }
  }
}
