"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data || [];
}

export async function createTag(name: string, color: string = "#6366f1") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: user.id, name, color })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Tag sudah ada" };
    return { error: error.message };
  }

  revalidatePath("/transactions");
  return { data };
}

export async function deleteTag(tagId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tags").delete().eq("id", tagId);

  if (error) return { error: error.message };
  revalidatePath("/transactions");
  return {};
}

export async function getTransactionTags(
  transactionId: string,
): Promise<Tag[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("transaction_tags")
    .select("tag:tags(*)")
    .eq("transaction_id", transactionId);

  if (!data) return [];

  return data
    .map((item: any) => {
      const tag = Array.isArray(item.tag) ? item.tag[0] : item.tag;
      return tag;
    })
    .filter(Boolean);
}

export async function setTransactionTags(
  transactionId: string,
  tagIds: string[],
) {
  const supabase = await createClient();

  // Remove existing tags
  await supabase
    .from("transaction_tags")
    .delete()
    .eq("transaction_id", transactionId);

  // Insert new tags
  if (tagIds.length > 0) {
    const rows = tagIds.map((tagId) => ({
      transaction_id: transactionId,
      tag_id: tagId,
    }));

    const { error } = await supabase.from("transaction_tags").insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath("/transactions");
  return {};
}
