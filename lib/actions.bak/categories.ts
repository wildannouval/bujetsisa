"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const type = formData.get("type") as string; // 'income' atau 'expense'
  const monthly_limit = Number(formData.get("monthly_limit")) || 0;

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    type,
    color: color || "#3b82f6",
    monthly_limit: type === "expense" ? monthly_limit : 0, // Hanya expense yang punya limit
  });

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const type = formData.get("type") as string;
  const monthly_limit = Number(formData.get("monthly_limit")) || 0;

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      color,
      type,
      monthly_limit: type === "expense" ? monthly_limit : 0,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}
