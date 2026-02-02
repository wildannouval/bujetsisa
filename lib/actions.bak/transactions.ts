"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * MENCATAT TRANSAKSI BARU
 */
export async function createTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const amount = Number(formData.get("amount"));
  const type = formData.get("type") as "income" | "expense";
  const wallet_id = formData.get("wallet_id") as string;
  const category_id = formData.get("category_id") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;

  // 1. Ambil saldo dompet saat ini
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", wallet_id)
    .single();

  if (!wallet) return { error: "Dompet tidak ditemukan." };

  // 2. Simpan Transaksi
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

  // 3. Update Saldo Dompet
  const newBalance =
    type === "income"
      ? Number(wallet.balance) + amount
      : Number(wallet.balance) - amount;

  await supabase
    .from("wallets")
    .update({ balance: newBalance })
    .eq("id", wallet_id);

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

/**
 * MENGHAPUS TRANSAKSI (SALDO DIKEMBALIKAN)
 */
export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  // 1. Ambil data transaksi sebelum dihapus
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
      // Kembalikan saldo (kebalikan dari tipe transaksi)
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

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

/**
 * UPDATE TRANSAKSI (LOGIKA REVERSE & APPLY)
 */
export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Ambil data transaksi lama
  const { data: oldTx } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();
  if (!oldTx) return { error: "Transaksi tidak ditemukan" };

  const newAmount = Number(formData.get("amount"));
  const newType = formData.get("type") as "income" | "expense";
  const newWalletId = formData.get("wallet_id") as string;
  const newCategoryId = formData.get("category_id") as string;
  const newDescription = formData.get("description") as string;
  const newDate = formData.get("date") as string;

  // 2. Tahap 1: Batalkan dampak transaksi lama pada dompet lama
  const { data: oldWallet } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("id", oldTx.wallet_id)
    .single();

  if (oldWallet) {
    const reversedBalance =
      oldTx.type === "income"
        ? Number(oldWallet.balance) - Number(oldTx.amount)
        : Number(oldWallet.balance) + Number(oldTx.amount);

    await supabase
      .from("wallets")
      .update({ balance: reversedBalance })
      .eq("id", oldTx.wallet_id);
  }

  // 3. Tahap 2: Ambil saldo terbaru dompet tujuan (mungkin sama dengan dompet lama)
  const { data: newWallet } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("id", newWalletId)
    .single();
  if (!newWallet) return { error: "Dompet tujuan tidak ditemukan" };

  // 4. Tahap 3: Terapkan dampak transaksi baru pada dompet baru
  const finalBalance =
    newType === "income"
      ? Number(newWallet.balance) + newAmount
      : Number(newWallet.balance) - newAmount;

  await supabase
    .from("wallets")
    .update({ balance: finalBalance })
    .eq("id", newWalletId);

  // 5. Update data transaksi di tabel transactions
  const { error: updateError } = await supabase
    .from("transactions")
    .update({
      wallet_id: newWalletId,
      category_id: newCategoryId || null,
      amount: newAmount,
      type: newType,
      description: newDescription,
      date: newDate,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}
