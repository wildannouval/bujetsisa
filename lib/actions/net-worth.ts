"use server";

import { createClient } from "@/lib/supabase/server";

export async function getNetWorthData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get all wallets balance
  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, name, balance, icon")
    .eq("user_id", user.id);

  const totalWalletBalance =
    wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;

  // Get investments
  const { data: investments } = await supabase
    .from("investments")
    .select("id, name, icon, quantity, current_price, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  const totalInvestmentValue =
    investments?.reduce(
      (sum, inv) => sum + Number(inv.quantity) * Number(inv.current_price),
      0,
    ) || 0;

  // Get debts (receivable = asset, payable = liability)
  const { data: debts } = await supabase
    .from("debts")
    .select("id, name, amount, type, status")
    .eq("user_id", user.id)
    .eq("status", "unpaid");

  const totalReceivable =
    debts
      ?.filter((d) => d.type === "receivable")
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const totalPayable =
    debts
      ?.filter((d) => d.type === "payable")
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  // Calculate net worth
  const totalAssets =
    totalWalletBalance + totalInvestmentValue + totalReceivable;
  const totalLiabilities = totalPayable;
  const netWorth = totalAssets - totalLiabilities;

  // Breakdown data for chart
  const assetBreakdown = [
    {
      name: "Dompet",
      value: totalWalletBalance,
      icon: "💰",
      color: "hsl(217, 91%, 60%)",
    },
    {
      name: "Investasi",
      value: totalInvestmentValue,
      icon: "📈",
      color: "hsl(142, 71%, 45%)",
    },
    {
      name: "Piutang",
      value: totalReceivable,
      icon: "📋",
      color: "hsl(45, 93%, 47%)",
    },
  ].filter((item) => item.value > 0);

  const liabilityBreakdown = [
    {
      name: "Hutang",
      value: totalPayable,
      icon: "💳",
      color: "hsl(0, 84%, 60%)",
    },
  ].filter((item) => item.value > 0);

  // Top wallets
  const topWallets = (wallets || [])
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, 5)
    .map((w) => ({
      name: w.name,
      icon: w.icon || "💵",
      value: Number(w.balance),
    }));

  // Top investments
  const topInvestments = (investments || [])
    .map((inv) => ({
      name: inv.name,
      icon: inv.icon || "📈",
      value: Number(inv.quantity) * Number(inv.current_price),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    netWorth,
    totalAssets,
    totalLiabilities,
    totalWalletBalance,
    totalInvestmentValue,
    totalReceivable,
    totalPayable,
    assetBreakdown,
    liabilityBreakdown,
    topWallets,
    topInvestments,
  };
}
