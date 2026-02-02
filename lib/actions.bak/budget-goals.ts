"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMonthlyBudget(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const amount = formData.get("amount");

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      monthly_amount: Number(amount),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/budgeting");
  return { success: true };
}

export async function addGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name");
  const target = formData.get("target");

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name,
    target_amount: Number(target),
    current_amount: 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/budgeting");
  return { success: true };
}

export async function addSavingsToGoal(goalId: string, amount: number) {
  const supabase = await createClient();
  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", goalId)
    .single();

  const newAmount = (Number(goal?.current_amount) || 0) + amount;

  const { error } = await supabase
    .from("goals")
    .update({ current_amount: newAmount })
    .eq("id", goalId);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/budgeting");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/budgeting");
  return { success: true };
}
