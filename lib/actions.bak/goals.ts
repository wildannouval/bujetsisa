"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function transferBudgetToGoal(
  goalId: string,
  amount: number,
  goalName: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi berakhir, silakan login kembali." };
  if (amount <= 0) return { error: "Tidak ada saldo yang bisa ditabung." };

  // 1. Ambil data Goal saat ini
  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", goalId)
    .single();

  if (!goal) return { error: "Target tidak ditemukan." };

  const newAmount = Number(goal.current_amount) + amount;

  // 2. Update saldo di tabel Goals
  const { error: goalError } = await supabase
    .from("goals")
    .update({ current_amount: newAmount })
    .eq("id", goalId);

  if (goalError) return { error: goalError.message };

  // 3. Catat sebagai transaksi agar jatah bulanan berkurang secara resmi
  // Kita asumsikan ada kategori bernama 'Tabungan' atau gunakan kategori umum
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount: amount,
    type: "expense",
    description: `Alokasi sisa budget ke Goal: ${goalName}`,
    date: new Date().toISOString().split("T")[0],
    // wallet_id: (Anda bisa menambahkan logika memilih wallet utama di sini)
  });

  revalidatePath("/");
  revalidatePath("/budgeting"); // Sesuaikan dengan path halaman goals Anda
  return { success: true };
}
