"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDebts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching debts:", error);
    return [];
  }

  // Add calculated fields
  return (data || []).map((debt) => {
    let daysUntilDue = null;
    let isOverdue = false;

    if (debt.due_date && debt.status === "unpaid") {
      const dueDate = new Date(debt.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      isOverdue = daysUntilDue < 0;
    }

    return {
      ...debt,
      daysUntilDue,
      isOverdue,
    };
  });
}

export async function getDebtStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalDebts: 0,
      totalPayable: 0,
      totalReceivable: 0,
      unpaidDebts: 0,
      overdueDebts: 0,
      paidDebts: 0,
    };
  }

  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id);

  if (!debts) {
    return {
      totalDebts: 0,
      totalPayable: 0,
      totalReceivable: 0,
      unpaidDebts: 0,
      overdueDebts: 0,
      paidDebts: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDebts = debts.length;
  const unpaidDebts = debts.filter((d) => d.status === "unpaid").length;
  const paidDebts = debts.filter((d) => d.status === "paid").length;

  // Calculate totals
  const totalPayable = debts
    .filter((d) => d.type === "payable" && d.status === "unpaid")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalReceivable = debts
    .filter((d) => d.type === "receivable" && d.status === "unpaid")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  // Count overdue debts
  const overdueDebts = debts.filter((d) => {
    if (d.status === "paid" || !d.due_date) return false;
    const dueDate = new Date(d.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  return {
    totalDebts,
    totalPayable,
    totalReceivable,
    unpaidDebts,
    overdueDebts,
    paidDebts,
  };
}

export async function createDebt(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const due_date = (formData.get("due_date") as string) || null;
  const type = (formData.get("type") as string) || "payable";
  const status = (formData.get("status") as string) || "unpaid";
  const notes = (formData.get("notes") as string) || null;
  const wallet_id = (formData.get("wallet_id") as string) || null;

  if (!name) {
    return { error: "Name is required" };
  }

  if (amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      name,
      amount,
      due_date,
      type,
      status,
      notes,
      wallet_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating debt:", error);
    return { error: error.message };
  }

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateDebt(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr?.replace(/\./g, "") || "0");
  const due_date = (formData.get("due_date") as string) || null;
  const type = formData.get("type") as string;
  const status = formData.get("status") as string;
  const notes = (formData.get("notes") as string) || null;
  const wallet_id = (formData.get("wallet_id") as string) || null;

  const { data, error } = await supabase
    .from("debts")
    .update({ name, amount, due_date, type, status, notes, wallet_id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating debt:", error);
    return { error: error.message };
  }

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { data };
}

export async function deleteDebt(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("debts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting debt:", error);
    return { error: error.message };
  }

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markDebtAsPaid(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get debt details first
  const { data: debt } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .single();

  if (!debt) {
    return { error: "Debt not found" };
  }

  // If debt has linked wallet, create transaction
  if (debt.wallet_id) {
    // payable = hutang (bayar = expense)
    // receivable = piutang (terima = income)
    const transactionType = debt.type === "payable" ? "expense" : "income";
    const description =
      debt.type === "payable"
        ? `Bayar hutang: ${debt.name}`
        : `Terima piutang: ${debt.name}`;

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        wallet_id: debt.wallet_id,
        amount: debt.amount,
        type: transactionType,
        description,
        date: new Date().toISOString().split("T")[0],
      });

    if (transactionError) {
      console.error("Error creating transaction for debt:", transactionError);
      return { error: transactionError.message };
    }
  }

  // Update debt status
  const { data, error } = await supabase
    .from("debts")
    .update({ status: "paid" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error marking debt as paid:", error);
    return { error: error.message };
  }

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/goals");
  return { data };
}

export async function markDebtAsUnpaid(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("debts")
    .update({ status: "unpaid" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error marking debt as unpaid:", error);
    return { error: error.message };
  }

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { data };
}
