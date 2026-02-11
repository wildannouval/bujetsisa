"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInvestments() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error && Object.keys(error).length > 0) {
    console.error("Error fetching investments:", error);
    return [];
  }

  return data || [];
}

export async function getInvestment(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: investment, error } = await supabase
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  // Get transactions for this investment
  const { data: transactions } = await supabase
    .from("investment_transactions")
    .select("*")
    .eq("investment_id", id)
    .order("date", { ascending: false });

  return {
    ...investment,
    transactions: transactions || [],
  };
}

export async function getInvestmentStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      investmentCount: 0,
    };
  }

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (!investments || investments.length === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      investmentCount: 0,
    };
  }

  let totalInvested = 0;
  let currentValue = 0;

  investments.forEach((inv) => {
    const invested = Number(inv.quantity) * Number(inv.avg_buy_price);
    const current = Number(inv.quantity) * Number(inv.current_price);
    totalInvested += invested;
    currentValue += current;
  });

  const totalGain = currentValue - totalInvested;
  const totalGainPercent =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalGain,
    totalGainPercent,
    investmentCount: investments.length,
  };
}

export async function createInvestment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "other";
  const ticker = formData.get("ticker") as string;
  const quantityStr = formData.get("quantity") as string;
  const quantity = parseFloat(
    quantityStr?.replace(/\./g, "").replace(",", ".") || "0",
  );
  const avgBuyPriceStr = formData.get("avg_buy_price") as string;
  const avgBuyPrice = parseFloat(
    avgBuyPriceStr?.replace(/\./g, "").replace(",", ".") || "0",
  );
  const currentPriceStr = formData.get("current_price") as string;
  const currentPrice =
    parseFloat(currentPriceStr?.replace(/\./g, "").replace(",", ".") || "0") ||
    avgBuyPrice;
  const platform = formData.get("platform") as string;
  const notes = formData.get("notes") as string;
  const icon = (formData.get("icon") as string) || "📈";

  if (!name) {
    return { error: "Name is required" };
  }

  const { data, error } = await supabase
    .from("investments")
    .insert({
      user_id: user.id,
      name,
      type,
      ticker: ticker || null,
      quantity,
      avg_buy_price: avgBuyPrice,
      current_price: currentPrice,
      currency: "IDR",
      platform: platform || null,
      notes: notes || null,
      icon,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating investment:", error);
    return { error: error.message };
  }

  // Create initial buy transaction
  if (quantity > 0 && avgBuyPrice > 0) {
    await supabase.from("investment_transactions").insert({
      user_id: user.id,
      investment_id: data.id,
      type: "buy",
      quantity,
      price: avgBuyPrice,
      total_amount: quantity * avgBuyPrice,
      fees: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "Pembelian awal",
    });
  }

  revalidatePath("/investments");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateInvestment(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const ticker = formData.get("ticker") as string;
  const currentPriceStr = formData.get("current_price") as string;
  const currentPrice = parseFloat(
    currentPriceStr?.replace(/\./g, "").replace(",", ".") || "0",
  );
  const platform = formData.get("platform") as string;
  const notes = formData.get("notes") as string;
  const icon = formData.get("icon") as string;
  const status = formData.get("status") as string;

  const { data, error } = await supabase
    .from("investments")
    .update({
      name,
      type,
      ticker: ticker || null,
      current_price: currentPrice,
      platform: platform || null,
      notes: notes || null,
      icon,
      status: status || "active",
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating investment:", error);
    return { error: error.message };
  }

  revalidatePath("/investments");
  revalidatePath(`/investments/${id}`);
  revalidatePath("/dashboard");
  return { data };
}

export async function updateInvestmentPrice(id: string, price: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("investments")
    .update({ current_price: price })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/investments");
  revalidatePath(`/investments/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteInvestment(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Delete transactions first
  await supabase
    .from("investment_transactions")
    .delete()
    .eq("investment_id", id);

  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting investment:", error);
    return { error: error.message };
  }

  revalidatePath("/investments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addInvestmentTransaction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const investmentId = formData.get("investment_id") as string;
  const type = formData.get("type") as string;
  const quantityStr = formData.get("quantity") as string;
  const quantity = parseFloat(
    quantityStr?.replace(/\./g, "").replace(",", ".") || "0",
  );
  const priceStr = formData.get("price") as string;
  const price = parseFloat(
    priceStr?.replace(/\./g, "").replace(",", ".") || "0",
  );
  const feesStr = formData.get("fees") as string;
  const fees = parseFloat(feesStr?.replace(/\./g, "").replace(",", ".") || "0");
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  if (!investmentId || !type || quantity <= 0 || price <= 0) {
    return { error: "Invalid transaction data" };
  }

  // For sell: fees reduce proceeds. For buy: fees add to cost.
  const totalAmount =
    type === "sell" ? quantity * price - fees : quantity * price + fees;

  // Get current investment
  const { data: investment } = await supabase
    .from("investments")
    .select("*")
    .eq("id", investmentId)
    .eq("user_id", user.id)
    .single();

  if (!investment) {
    return { error: "Investment not found" };
  }

  // Create transaction
  const { error: txError } = await supabase
    .from("investment_transactions")
    .insert({
      user_id: user.id,
      investment_id: investmentId,
      type,
      quantity,
      price,
      total_amount: totalAmount,
      fees,
      date: date || new Date().toISOString().split("T")[0],
      notes: notes || null,
    });

  if (txError) {
    return { error: txError.message };
  }

  // Update investment based on transaction type
  let newQuantity = Number(investment.quantity);
  let newAvgPrice = Number(investment.avg_buy_price);

  if (type === "buy") {
    const oldTotal = newQuantity * newAvgPrice;
    const newTotal = quantity * price;
    newQuantity += quantity;
    newAvgPrice = newQuantity > 0 ? (oldTotal + newTotal) / newQuantity : 0;
  } else if (type === "sell") {
    newQuantity -= quantity;
    if (newQuantity <= 0) {
      newQuantity = 0;
    }
  } else if (type === "stock_split") {
    // For stock split, quantity is the multiplier
    newQuantity = newQuantity * quantity;
    newAvgPrice = newAvgPrice / quantity;
  }

  // Update investment — only update current_price for buy/sell (not dividend)
  const updateData: Record<string, any> = {
    quantity: newQuantity,
    avg_buy_price: newAvgPrice,
    status: newQuantity <= 0 ? "sold" : "active",
  };
  if (type === "buy" || type === "sell") {
    updateData.current_price = price;
  }

  await supabase.from("investments").update(updateData).eq("id", investmentId);

  revalidatePath("/investments");
  revalidatePath(`/investments/${investmentId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getInvestmentsByType() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (!investments) return [];

  // Group by type
  const grouped: Record<
    string,
    { type: string; totalValue: number; totalInvested: number; count: number }
  > = {};

  investments.forEach((inv) => {
    const type = inv.type;
    const invested = Number(inv.quantity) * Number(inv.avg_buy_price);
    const current = Number(inv.quantity) * Number(inv.current_price);

    if (!grouped[type]) {
      grouped[type] = { type, totalValue: 0, totalInvested: 0, count: 0 };
    }
    grouped[type].totalValue += current;
    grouped[type].totalInvested += invested;
    grouped[type].count += 1;
  });

  return Object.values(grouped);
}
