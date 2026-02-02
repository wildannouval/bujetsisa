"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGoals() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("goals")
    .select(
      `
      *,
      wallet:wallets(id, balance)
    `,
    )
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }

  // Add calculated fields
  return (data || []).map((goal) => {
    // If goal is linked to wallet, use wallet balance as current_amount
    let current = Number(goal.current_amount) || 0;
    if (goal.wallet && goal.wallet_id) {
      // Wallet data is returned as array or object depending on Supabase query
      const walletData = Array.isArray(goal.wallet)
        ? goal.wallet[0]
        : goal.wallet;
      if (walletData) {
        current = Number(walletData.balance) || 0;
      }
    }

    const target = Number(goal.target_amount) || 0;
    const remaining = Math.max(target - current, 0);
    const percentage =
      target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

    // Calculate days remaining
    let daysRemaining = null;
    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      const today = new Date();
      daysRemaining = Math.ceil(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    // Calculate monthly saving needed
    let monthlySavingNeeded = null;
    if (daysRemaining && daysRemaining > 0 && remaining > 0) {
      const monthsRemaining = Math.max(daysRemaining / 30, 1);
      monthlySavingNeeded = Math.ceil(remaining / monthsRemaining);
    }

    return {
      ...goal,
      current_amount: current, // Use synced amount
      remaining,
      percentage,
      daysRemaining,
      monthlySavingNeeded,
    };
  });
}

export async function getGoalStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      totalTarget: 0,
      totalSaved: 0,
      overallProgress: 0,
    };
  }

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);

  if (!goals) {
    return {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      totalTarget: 0,
      totalSaved: 0,
      overallProgress: 0,
    };
  }

  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const totalTarget = goals.reduce(
    (sum, g) => sum + Number(g.target_amount),
    0,
  );
  const totalSaved = goals.reduce(
    (sum, g) => sum + Number(g.current_amount),
    0,
  );
  const overallProgress =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    totalTarget,
    totalSaved,
    overallProgress,
  };
}

export async function createGoal(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const targetAmountStr = formData.get("target_amount") as string;
  const target_amount = parseFloat(targetAmountStr?.replace(/\./g, "") || "0");
  const currentAmountStr = formData.get("current_amount") as string;
  const current_amount = parseFloat(
    currentAmountStr?.replace(/\./g, "") || "0",
  );
  const target_date = (formData.get("target_date") as string) || null;
  const icon = (formData.get("icon") as string) || "🎯";
  const wallet_id = (formData.get("wallet_id") as string) || null;
  const is_emergency_fund = formData.get("is_emergency_fund") === "true";

  if (!name) {
    return { error: "Name is required" };
  }

  if (target_amount <= 0) {
    return { error: "Target amount must be greater than 0" };
  }

  // If wallet is linked, get current wallet balance as current_amount
  let initialAmount = current_amount;
  if (wallet_id) {
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("id", wallet_id)
      .single();
    if (wallet) {
      initialAmount = Number(wallet.balance) || 0;
    }
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name,
      target_amount,
      current_amount: initialAmount,
      target_date,
      icon,
      wallet_id,
      is_emergency_fund,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating goal:", error);
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const targetAmountStr = formData.get("target_amount") as string;
  const target_amount = parseFloat(targetAmountStr?.replace(/\./g, "") || "0");
  const currentAmountStr = formData.get("current_amount") as string;
  const current_amount = parseFloat(
    currentAmountStr?.replace(/\./g, "") || "0",
  );
  const target_date = (formData.get("target_date") as string) || null;
  const icon = (formData.get("icon") as string) || "🎯";
  const status = (formData.get("status") as string) || "active";
  const wallet_id = (formData.get("wallet_id") as string) || null;
  const is_emergency_fund = formData.get("is_emergency_fund") === "true";

  const { data, error } = await supabase
    .from("goals")
    .update({
      name,
      target_amount,
      current_amount,
      target_date,
      icon,
      status,
      wallet_id,
      is_emergency_fund,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating goal:", error);
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { data };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("goals").delete().eq("id", id);

  if (error) {
    console.error("Error deleting goal:", error);
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addToGoal(id: string, amount: number) {
  const supabase = await createClient();

  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .single();

  if (!goal) {
    return { error: "Goal not found" };
  }

  const newAmount = (Number(goal.current_amount) || 0) + amount;
  const status = newAmount >= goal.target_amount ? "completed" : "active";

  const { data, error } = await supabase
    .from("goals")
    .update({ current_amount: newAmount, status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error adding to goal:", error);
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { data };
}

export async function withdrawFromGoal(id: string, amount: number) {
  const supabase = await createClient();

  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", id)
    .single();

  if (!goal) {
    return { error: "Goal not found" };
  }

  const currentAmount = Number(goal.current_amount) || 0;
  if (amount > currentAmount) {
    return { error: "Insufficient amount" };
  }

  const newAmount = currentAmount - amount;

  const { data, error } = await supabase
    .from("goals")
    .update({ current_amount: newAmount, status: "active" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error withdrawing from goal:", error);
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { data };
}
