"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportBackup() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch all user data
  const [
    wallets,
    categories,
    transactions,
    debts,
    goals,
    budgets,
    investments,
    investmentTransactions,
    recurring,
    tags,
    transactionTags,
  ] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user.id),
    supabase.from("categories").select("*").eq("user_id", user.id),
    supabase.from("transactions").select("*").eq("user_id", user.id),
    supabase.from("debts").select("*").eq("user_id", user.id),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("budgets").select("*").eq("user_id", user.id),
    supabase.from("investments").select("*").eq("user_id", user.id),
    supabase.from("investment_transactions").select("*").eq("user_id", user.id),
    supabase.from("recurring_transactions").select("*").eq("user_id", user.id),
    supabase.from("tags").select("*").eq("user_id", user.id),
    supabase
      .from("transaction_tags")
      .select("*, tag:tags!inner(user_id)")
      .eq("tag.user_id", user.id),
  ]);

  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    userId: user.id,
    data: {
      wallets: wallets.data || [],
      categories: categories.data || [],
      transactions: transactions.data || [],
      debts: debts.data || [],
      goals: goals.data || [],
      budgets: budgets.data || [],
      investments: investments.data || [],
      investmentTransactions: investmentTransactions.data || [],
      recurring: recurring.data || [],
      tags: tags.data || [],
      transactionTags: (transactionTags.data || []).map((tt: any) => ({
        transaction_id: tt.transaction_id,
        tag_id: tt.tag_id,
      })),
    },
  };

  return { data: backup };
}

export async function importBackup(backupJson: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let backup;
  try {
    backup = JSON.parse(backupJson);
  } catch {
    return { error: "File JSON tidak valid" };
  }

  if (!backup?.version || !backup?.data) {
    return { error: "Format backup tidak dikenali" };
  }

  const d = backup.data;
  const results: string[] = [];

  try {
    // Import in order of dependencies
    // 1. Wallets
    if (d.wallets?.length) {
      const walletsToInsert = d.wallets.map((w: any) => ({
        ...w,
        user_id: user.id,
      }));
      const { error } = await supabase.from("wallets").upsert(walletsToInsert, {
        onConflict: "id",
      });
      results.push(`Dompet: ${error ? "gagal" : d.wallets.length}`);
    }

    // 2. Categories
    if (d.categories?.length) {
      const catsToInsert = d.categories.map((c: any) => ({
        ...c,
        user_id: user.id,
      }));
      const { error } = await supabase
        .from("categories")
        .upsert(catsToInsert, { onConflict: "id" });
      results.push(`Kategori: ${error ? "gagal" : d.categories.length}`);
    }

    // 3. Transactions
    if (d.transactions?.length) {
      const txToInsert = d.transactions.map((t: any) => ({
        ...t,
        user_id: user.id,
      }));
      const { error } = await supabase
        .from("transactions")
        .upsert(txToInsert, { onConflict: "id" });
      results.push(`Transaksi: ${error ? "gagal" : d.transactions.length}`);
    }

    // 4. Debts
    if (d.debts?.length) {
      const debtsToInsert = d.debts.map((db: any) => ({
        ...db,
        user_id: user.id,
      }));
      const { error } = await supabase.from("debts").upsert(debtsToInsert, {
        onConflict: "id",
      });
      results.push(`Hutang: ${error ? "gagal" : d.debts.length}`);
    }

    // 5. Goals
    if (d.goals?.length) {
      const goalsToInsert = d.goals.map((g: any) => ({
        ...g,
        user_id: user.id,
      }));
      const { error } = await supabase.from("goals").upsert(goalsToInsert, {
        onConflict: "id",
      });
      results.push(`Target: ${error ? "gagal" : d.goals.length}`);
    }

    // 6. Budgets
    if (d.budgets?.length) {
      const budgetsToInsert = d.budgets.map((b: any) => ({
        ...b,
        user_id: user.id,
      }));
      const { error } = await supabase
        .from("budgets")
        .upsert(budgetsToInsert, { onConflict: "id" });
      results.push(`Anggaran: ${error ? "gagal" : d.budgets.length}`);
    }

    // 7. Investments
    if (d.investments?.length) {
      const investToInsert = d.investments.map((i: any) => ({
        ...i,
        user_id: user.id,
      }));
      const { error } = await supabase
        .from("investments")
        .upsert(investToInsert, { onConflict: "id" });
      results.push(`Investasi: ${error ? "gagal" : d.investments.length}`);
    }

    // 8. Tags
    if (d.tags?.length) {
      const tagsToInsert = d.tags.map((t: any) => ({
        ...t,
        user_id: user.id,
      }));
      const { error } = await supabase.from("tags").upsert(tagsToInsert, {
        onConflict: "id",
      });
      results.push(`Tags: ${error ? "gagal" : d.tags.length}`);
    }

    return {
      success: true,
      message: `Import berhasil! ${results.join(", ")}`,
    };
  } catch (error: any) {
    return { error: `Import gagal: ${error.message}` };
  }
}
