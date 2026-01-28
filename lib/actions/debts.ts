"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDebtLoan(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const person_name = formData.get("person_name") as string;
  const amount = Number(formData.get("amount"));
  const type = formData.get("type") as "debt" | "receivable";
  const due_date = formData.get("due_date") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("debts_loans").insert({
    user_id: user.id,
    person_name,
    amount,
    type,
    due_date: due_date || null,
    description,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}

export async function updateDebtStatus(
  id: string,
  newStatus: "paid" | "pending",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("debts_loans")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/debts");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDebt(id: string) {
  const supabase = await createClient();
  await supabase.from("debts_loans").delete().eq("id", id);
  revalidatePath("/debts");
}
