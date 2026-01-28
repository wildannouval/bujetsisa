"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const amount = Number(formData.get("amount"));
  const type = formData.get("type") as "income" | "expense";
  const wallet_id = formData.get("wallet_id") as string;
  const category_id = formData.get("category_id") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;

  // 1. Simpan Transaksi
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    wallet_id,
    category_id: category_id || null,
    amount,
    type,
    description,
    date: date || new Date().toISOString().split("T")[0],
  });

  if (txError) return { error: txError.message };

  // 2. Ambil Saldo Dompet Saat Ini
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", wallet_id)
    .single();

  if (wallet) {
    // 3. Kalkulasi Saldo Baru
    const newBalance =
      type === "income"
        ? Number(wallet.balance) + amount
        : Number(wallet.balance) - amount;

    // 4. Update Saldo Dompet
    await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet_id);
  }

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  // Ambil data transaksi sebelum dihapus untuk mengembalikan saldo
  const { data: tx } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (tx) {
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("id", tx.wallet_id)
      .single();
    if (wallet) {
      const restoredBalance =
        tx.type === "income"
          ? Number(wallet.balance) - Number(tx.amount)
          : Number(wallet.balance) + Number(tx.amount);

      await supabase
        .from("wallets")
        .update({ balance: restoredBalance })
        .eq("id", tx.wallet_id);
    }
  }

  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/transactions");
  revalidatePath("/");
}
