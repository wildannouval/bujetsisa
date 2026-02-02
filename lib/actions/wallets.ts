"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWallets() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching wallets:", error);
    return [];
  }

  return data || [];
}

export async function getWallet(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching wallet:", error);
    return null;
  }

  return data;
}

export async function getWalletWithTransactions(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    return null;
  }

  // Get transactions for this wallet
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories(id, name, icon)
    `,
    )
    .eq("wallet_id", id)
    .order("date", { ascending: false })
    .limit(50);

  return {
    ...wallet,
    transactions: transactions || [],
  };
}

export async function getWalletsStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalBalance: 0,
      walletCount: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
    };
  }

  // Get all wallets
  const { data: wallets } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id);

  const totalBalance =
    wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;
  const walletCount = wallets?.length || 0;

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

  return { totalBalance, walletCount, monthlyIncome, monthlyExpense };
}

export async function getWalletsWithStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // Get all wallets
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!wallets || wallets.length === 0) {
    return [];
  }

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get this month's transactions for all wallets
  const { data: transactions } = await supabase
    .from("transactions")
    .select("wallet_id, amount, type, date")
    .eq("user_id", user.id)
    .gte("date", startOfMonth.toISOString().split("T")[0]);

  // Get last transaction for each wallet
  const { data: lastTransactions } = await supabase
    .from("transactions")
    .select(
      "wallet_id, amount, type, date, description, category:categories(name, icon)",
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  // Calculate stats per wallet
  return wallets.map((wallet) => {
    const walletTransactions = (transactions || []).filter(
      (t) => t.wallet_id === wallet.id,
    );

    const monthlyIncome = walletTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpense = walletTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastTransaction = (lastTransactions || []).find(
      (t) => t.wallet_id === wallet.id,
    );

    const transactionCount = walletTransactions.length;

    return {
      ...wallet,
      monthlyIncome,
      monthlyExpense,
      transactionCount,
      lastTransaction: lastTransaction || null,
    };
  });
}

export async function createWallet(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "cash";
  const balanceStr = formData.get("balance") as string;
  const balance = parseFloat(balanceStr?.replace(/\./g, "") || "0");
  const icon = (formData.get("icon") as string) || "💵";

  if (!name) {
    return { error: "Name is required" };
  }

  const { data, error } = await supabase
    .from("wallets")
    .insert({
      user_id: user.id,
      name,
      type,
      balance,
      icon,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating wallet:", error);
    return { error: error.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateWallet(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const balanceStr = formData.get("balance") as string;
  const balance = parseFloat(balanceStr?.replace(/\./g, "") || "0");
  const icon = (formData.get("icon") as string) || "💵";

  const { data, error } = await supabase
    .from("wallets")
    .update({ name, type, balance, icon })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating wallet:", error);
    return { error: error.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  revalidatePath(`/wallets/${id}`);
  return { data };
}

export async function deleteWallet(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("wallets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting wallet:", error);
    return { error: error.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function transferBetweenWallets(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const fromWalletId = formData.get("from_wallet_id") as string;
  const toWalletId = formData.get("to_wallet_id") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const description =
    (formData.get("description") as string) || "Transfer antar dompet";

  if (!fromWalletId || !toWalletId) {
    return { error: "Both wallets are required" };
  }

  if (fromWalletId === toWalletId) {
    return { error: "Cannot transfer to same wallet" };
  }

  if (amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  // Check source wallet balance
  const { data: fromWallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", fromWalletId)
    .single();

  if (!fromWallet || Number(fromWallet.balance) < amount) {
    return { error: "Insufficient balance" };
  }

  // Create expense transaction from source wallet
  const { error: expenseError } = await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id: fromWalletId,
    amount,
    type: "expense",
    description: `Transfer: ${description}`,
    date: new Date().toISOString().split("T")[0],
  });

  if (expenseError) {
    return { error: expenseError.message };
  }

  // Create income transaction to destination wallet
  const { error: incomeError } = await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id: toWalletId,
    amount,
    type: "income",
    description: `Transfer: ${description}`,
    date: new Date().toISOString().split("T")[0],
  });

  if (incomeError) {
    return { error: incomeError.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true };
}
