"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMonthlyReport(year?: number, month?: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month !== undefined ? month : now.getMonth();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (!transactions) {
    return {
      month: targetMonth,
      year: targetYear,
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      transactionCount: 0,
      categoryBreakdown: [],
      dailyData: [],
    };
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Category breakdown for expenses
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (
        acc: { [key: string]: { name: string; icon: string; amount: number } },
        t,
      ) => {
        const categoryId = t.category_id || "uncategorized";
        const categoryName = t.category?.name || "Uncategorized";
        const categoryIcon = t.category?.icon || "📦";

        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: categoryName,
            icon: categoryIcon,
            amount: 0,
          };
        }
        acc[categoryId].amount += Number(t.amount);
        return acc;
      },
      {},
    );

  const categoryBreakdown = Object.entries(expensesByCategory)
    .map(([id, data]) => ({
      id,
      name: data.name,
      icon: data.icon,
      amount: data.amount,
      percentage:
        totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Daily data for the month
  const dailyMap: { [key: number]: { income: number; expense: number } } = {};
  for (let day = 1; day <= endDate.getDate(); day++) {
    dailyMap[day] = { income: 0, expense: 0 };
  }

  transactions.forEach((t) => {
    const day = new Date(t.date).getDate();
    if (t.type === "income") {
      dailyMap[day].income += Number(t.amount);
    } else {
      dailyMap[day].expense += Number(t.amount);
    }
  });

  const dailyData = Object.entries(dailyMap).map(([day, data]) => ({
    day: parseInt(day),
    income: data.income,
    expense: data.expense,
  }));

  return {
    month: targetMonth,
    year: targetYear,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    transactionCount: transactions.length,
    categoryBreakdown,
    dailyData,
  };
}

export async function getYearlyReport(year?: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const targetYear = year || new Date().getFullYear();

  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0]);

  if (!transactions) {
    return {
      year: targetYear,
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      monthlyData: [],
    };
  }

  // Monthly breakdown
  const monthlyMap: { [key: number]: { income: number; expense: number } } = {};
  for (let month = 0; month < 12; month++) {
    monthlyMap[month] = { income: 0, expense: 0 };
  }

  transactions.forEach((t) => {
    const month = new Date(t.date).getMonth();
    if (t.type === "income") {
      monthlyMap[month].income += Number(t.amount);
    } else {
      monthlyMap[month].expense += Number(t.amount);
    }
  });

  const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
    month: parseInt(month),
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
  }));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    year: targetYear,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    monthlyData,
  };
}

export async function getFinancialSummary() {
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
    .select("balance")
    .eq("user_id", user.id);

  const totalBalance =
    wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;

  // Get total debts
  const { data: debts } = await supabase
    .from("debts")
    .select("amount, type, status")
    .eq("user_id", user.id)
    .eq("status", "unpaid");

  const totalPayable =
    debts
      ?.filter((d) => d.type === "payable")
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const totalReceivable =
    debts
      ?.filter((d) => d.type === "receivable")
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  // Get goals progress
  const { data: goals } = await supabase
    .from("goals")
    .select("current_amount, target_amount, status")
    .eq("user_id", user.id);

  const totalSaved =
    goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0;
  const totalTarget =
    goals?.reduce((sum, g) => sum + Number(g.target_amount), 0) || 0;
  const activeGoals = goals?.filter((g) => g.status === "active").length || 0;

  // Net worth calculation
  const netWorth = totalBalance + totalReceivable - totalPayable;

  return {
    totalBalance,
    totalPayable,
    totalReceivable,
    totalSaved,
    totalTarget,
    activeGoals,
    netWorth,
  };
}
