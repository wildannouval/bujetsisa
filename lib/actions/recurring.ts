"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: "income" | "expense";
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_date: string;
  is_active: boolean;
  created_at: string;
  wallet?: { id: string; name: string; icon: string };
  category?: { id: string; name: string; icon: string };
}

export async function getRecurringTransactions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select(
      `
      *,
      wallet:wallets(id, name, icon),
      category:categories(id, name, icon)
    `,
    )
    .eq("user_id", user.id)
    .order("next_date", { ascending: true });

  if (error) {
    console.error("Error fetching recurring transactions:", error);
    return [];
  }

  return data || [];
}

export async function createRecurringTransaction(formData: FormData) {
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
  const type = (formData.get("type") as string) || "expense";
  const description = formData.get("description") as string;
  const frequency = (formData.get("frequency") as string) || "monthly";
  const next_date = formData.get("next_date") as string;

  if (!wallet_id) {
    return { error: "Wallet is required" };
  }

  if (amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: user.id,
      wallet_id,
      category_id,
      amount,
      type,
      description,
      frequency,
      next_date,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating recurring transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateRecurringTransaction(
  id: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const wallet_id = formData.get("wallet_id") as string;
  const category_id = (formData.get("category_id") as string) || null;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const frequency = formData.get("frequency") as string;
  const next_date = formData.get("next_date") as string;
  const is_active = formData.get("is_active") === "true";

  const { data, error } = await supabase
    .from("recurring_transactions")
    .update({
      wallet_id,
      category_id,
      amount,
      type,
      description,
      frequency,
      next_date,
      is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating recurring transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  return { data };
}

export async function deleteRecurringTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting recurring transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleRecurringTransaction(
  id: string,
  is_active: boolean,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recurring_transactions")
    .update({ is_active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling recurring transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/recurring");
  return { data };
}

// Process due recurring transactions (called by cron or manual trigger)
export async function processDueRecurringTransactions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { processed: 0 };

  const today = new Date().toISOString().split("T")[0];

  // Get all due recurring transactions
  const { data: dueTransactions } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .lte("next_date", today);

  if (!dueTransactions || dueTransactions.length === 0) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const recurring of dueTransactions) {
    // Create the transaction
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        wallet_id: recurring.wallet_id,
        category_id: recurring.category_id,
        amount: recurring.amount,
        type: recurring.type,
        description: `[Auto] ${recurring.description}`,
        date: recurring.next_date,
      });

    if (!transactionError) {
      // Calculate next date
      const nextDate = calculateNextDate(
        recurring.next_date,
        recurring.frequency,
      );

      // Update next_date
      await supabase
        .from("recurring_transactions")
        .update({ next_date: nextDate })
        .eq("id", recurring.id);

      processed++;
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/dashboard");

  return { processed };
}

function calculateNextDate(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.toISOString().split("T")[0];
}

// Get upcoming recurring transactions (reminders)
export async function getUpcomingRecurring(days: number = 7) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select(
      `
      *,
      wallet:wallets(id, name, icon),
      category:categories(id, name, icon)
    `,
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gte("next_date", today.toISOString().split("T")[0])
    .lte("next_date", futureDate.toISOString().split("T")[0])
    .order("next_date", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming recurring:", error);
    return [];
  }

  return data || [];
}
