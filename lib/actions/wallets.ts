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

  const { error } = await supabase.from("wallets").insert({
    user_id: user.id,
    name,
    balance,
  });

  if (error) return { error: error.message };

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}

export async function updateWallet(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wallets")
    .update({ name })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/wallets");
  return { success: true };
}

export async function deleteWallet(id: string) {
  const supabase = await createClient();
  // Catatan: Karena di SQL kita pakai ON DELETE CASCADE,
  // menghapus dompet akan menghapus semua transaksi di dalamnya.
  const { error } = await supabase.from("wallets").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}
