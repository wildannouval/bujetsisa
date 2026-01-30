"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDebtLoan(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("debts_loans").insert({
    user_id: user.id,
    person_name: formData.get("person_name"),
    amount: Number(formData.get("amount")),
    current_amount: 0,
    type: formData.get("type"),
    due_date: formData.get("due_date") || null,
    description: formData.get("description"),
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}

export async function payDebtLoan(
  id: string,
  walletId: string,
  paymentAmount: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: item } = await supabase
    .from("debts_loans")
    .select("*")
    .eq("id", id)
    .single();
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", walletId)
    .single();

  if (!item || !wallet) return { error: "Data tidak ditemukan" };

  const newPaidAmount = Number(item.current_amount) + paymentAmount;
  const newStatus = newPaidAmount >= Number(item.amount) ? "paid" : "pending";
  const newWalletBalance =
    item.type === "debt"
      ? Number(wallet.balance) - paymentAmount
      : Number(wallet.balance) + paymentAmount;

  // 1. Update status hutang
  await supabase
    .from("debts_loans")
    .update({
      current_amount: newPaidAmount,
      status: newStatus,
    })
    .eq("id", id);

  // 2. Update saldo dompet
  await supabase
    .from("wallets")
    .update({ balance: newWalletBalance })
    .eq("id", walletId);

  // 3. Catat di riwayat transaksi
  await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id: walletId,
    amount: paymentAmount,
    type: item.type === "debt" ? "expense" : "income",
    description: `Cicilan ${item.type === "debt" ? "Hutang ke" : "Piutang dari"} ${item.person_name}`,
    date: new Date().toISOString().split("T")[0],
  });

  revalidatePath("/debts");
  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDebt(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("debts_loans").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}
