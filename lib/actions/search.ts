"use server";

import { createClient } from "@/lib/supabase/server";

export async function globalSearch(query: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !query || query.length < 2) {
    return { transactions: [], wallets: [], categories: [], investments: [] };
  }

  const searchTerm = `%${query}%`;

  const [transactions, wallets, categories, investments] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, description, amount, type, date, category:categories(name, icon)",
      )
      .eq("user_id", user.id)
      .ilike("description", searchTerm)
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("wallets")
      .select("id, name, icon, balance")
      .eq("user_id", user.id)
      .ilike("name", searchTerm)
      .limit(5),
    supabase
      .from("categories")
      .select("id, name, icon, type")
      .eq("user_id", user.id)
      .ilike("name", searchTerm)
      .limit(5),
    supabase
      .from("investments")
      .select("id, name, icon, current_price, quantity")
      .eq("user_id", user.id)
      .ilike("name", searchTerm)
      .limit(5),
  ]);

  return {
    transactions: transactions.data || [],
    wallets: wallets.data || [],
    categories: categories.data || [],
    investments: investments.data || [],
  };
}
