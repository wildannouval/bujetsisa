"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWallet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const balance = Number(formData.get("balance"));
  const type = formData.get("type") as string;

  const { error } = await supabase.from("wallets").insert({
    user_id: user.id,
    name,
    balance,
    type,
  });

  if (error) return { error: error.message };

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

export async function deleteWallet(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wallets").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

export async function transferBalance(formData: FormData) {
  const supabase = await createClient();
  const fromId = formData.get("from_wallet_id") as string;
  const toId = formData.get("to_wallet_id") as string;
  const amount = Number(formData.get("amount"));

  if (fromId === toId)
    return { error: "Dompet asal dan tujuan tidak boleh sama." };
  if (amount <= 0) return { error: "Jumlah transfer harus lebih dari 0." };

  // 1. Ambil data dompet asal (PENTING: ambil balance dan name)
  const { data: fromWallet } = await supabase
    .from("wallets")
    .select("balance, name")
    .eq("id", fromId)
    .single();

  // 2. Ambil data dompet tujuan (PENTING: ambil balance dan name)
  const { data: toWallet } = await supabase
    .from("wallets")
    .select("balance, name")
    .eq("id", toId)
    .single();

  // 3. Validasi keberadaan dompet dan kecukupan saldo
  if (!fromWallet) return { error: "Dompet asal tidak ditemukan." };
  if (!toWallet) return { error: "Dompet tujuan tidak ditemukan." };
  if (Number(fromWallet.balance) < amount)
    return { error: "Saldo tidak mencukupi." };

  // 4. Update Saldo Dompet Asal
  const { error: errorFrom } = await supabase
    .from("wallets")
    .update({ balance: Number(fromWallet.balance) - amount })
    .eq("id", fromId);

  // 5. Update Saldo Dompet Tujuan
  const { error: errorTo } = await supabase
    .from("wallets")
    .update({ balance: Number(toWallet.balance) + amount })
    .eq("id", toId);

  if (errorFrom || errorTo) return { error: "Gagal memperbarui saldo." };

  // 6. Catat riwayat transaksi otomatis
  await supabase.from("transactions").insert([
    {
      wallet_id: fromId,
      amount,
      type: "expense",
      description: `Transfer ke ${toWallet.name}`,
      date: new Date().toISOString(),
    },
    {
      wallet_id: toId,
      amount,
      type: "income",
      description: `Transfer dari ${fromWallet.name}`,
      date: new Date().toISOString(),
    },
  ]);

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

export async function updateWallet(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const balance = Number(formData.get("balance"));
  const type = formData.get("type") as string;

  const { error } = await supabase
    .from("wallets")
    .update({ name, balance, type })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return { success: true };
}
