"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalBalance: 0,
      income: 0,
      expense: 0,
      lastMonthIncome: 0,
      lastMonthExpense: 0,
      recentTransactions: [],
      activeWalletsCount: 0,
      goalsProgress: { active: 0, total: 0, saved: 0, target: 0 },
      budgetStatus: {
        onTrack: 0,
        overBudget: 0,
        totalBudgeted: 0,
        totalSpent: 0,
      },
      debtSummary: { payable: 0, receivable: 0, overdue: 0 },
      topCategories: [],
      weeklySpending: [],
    };
  }

  // Fetch wallets
  const { data: wallets, error: walletsError } = await supabase
    .from("wallets")
    .select("id, name, balance")
    .eq("user_id", user.id);

  if (walletsError) {
    console.error("Error fetching wallets:", walletsError);
  }

  const totalBalance = (wallets || []).reduce((acc, wallet) => {
    return acc + Number(wallet.balance || 0);
  }, 0);

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  // Fetch monthly transactions
  const { data: monthlyTransactions } = await supabase
    .from("transactions")
    .select("amount, type, date, category_id, category:categories(name, icon)")
    .eq("user_id", user.id)
    .gte("date", startOfMonth.toISOString())
    .lte("date", endOfMonth.toISOString());

  // Fetch last month transactions for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  );

  const { data: lastMonthTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", startOfLastMonth.toISOString())
    .lte("date", endOfLastMonth.toISOString());

  let lastMonthIncome = 0;
  let lastMonthExpense = 0;
  for (const t of lastMonthTransactions || []) {
    if (t.type === "income") lastMonthIncome += Number(t.amount || 0);
    else if (t.type === "expense") lastMonthExpense += Number(t.amount || 0);
  }

  let income = 0;
  let expense = 0;
  const categorySpending: {
    [key: string]: { name: string; icon: string; amount: number };
  } = {};

  for (const t of monthlyTransactions || []) {
    if (t.type === "income") {
      income += Number(t.amount || 0);
    } else if (t.type === "expense") {
      expense += Number(t.amount || 0);

      // Track category spending
      if (t.category_id && t.category) {
        const catArray = t.category as unknown as
          | Array<{ name: string; icon: string }>
          | { name: string; icon: string };
        const catData = Array.isArray(catArray) ? catArray[0] : catArray;
        if (catData && !categorySpending[t.category_id]) {
          categorySpending[t.category_id] = {
            name: catData.name,
            icon: catData.icon,
            amount: 0,
          };
        }
        if (catData) {
          categorySpending[t.category_id].amount += Number(t.amount);
        }
      }
    }
  }

  // Top 5 spending categories
  const topCategories = Object.entries(categorySpending)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      type,
      date,
      description,
      category:categories(name, icon),
      wallet:wallets(name)
    `,
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  // Fetch goals data - include wallet_id to get linked wallet balance
  const { data: goals } = await supabase
    .from("goals")
    .select("current_amount, target_amount, status, wallet_id")
    .eq("user_id", user.id);

  // For goals linked to wallets, use the wallet balance as current_amount
  const activeGoals = (goals || []).filter((g) => g.status === "active").length;

  let totalSaved = 0;
  for (const goal of goals || []) {
    if (goal.wallet_id) {
      // Find the linked wallet balance
      const linkedWallet = (wallets || []).find((w) => w.id === goal.wallet_id);
      totalSaved += linkedWallet ? Number(linkedWallet.balance) : 0;
    } else {
      totalSaved += Number(goal.current_amount);
    }
  }

  const totalTarget = (goals || []).reduce(
    (sum, g) => sum + Number(g.target_amount),
    0,
  );

  // Fetch budgets and calculate spending
  const { data: budgets } = await supabase
    .from("budgets")
    .select("amount, category_id, period")
    .eq("user_id", user.id);

  let onTrack = 0;
  let overBudget = 0;
  let totalBudgeted = 0;
  let totalSpent = 0;

  for (const budget of budgets || []) {
    totalBudgeted += Number(budget.amount);

    // Get spending for this category this month
    const spent = (monthlyTransactions || [])
      .filter(
        (t) => t.type === "expense" && t.category_id === budget.category_id,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    totalSpent += spent;

    if (spent > Number(budget.amount)) {
      overBudget++;
    } else {
      onTrack++;
    }
  }

  // Fetch debts summary
  const { data: debts } = await supabase
    .from("debts")
    .select("amount, type, status, due_date")
    .eq("user_id", user.id)
    .eq("status", "unpaid");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const payable = (debts || [])
    .filter((d) => d.type === "payable")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const receivable = (debts || [])
    .filter((d) => d.type === "receivable")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const overdueCount = (debts || []).filter((d) => {
    if (!d.due_date) return false;
    const dueDate = new Date(d.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  // Weekly spending (last 7 days)
  const weeklySpending: {
    day: string;
    shortDay: string;
    income: number;
    expense: number;
  }[] = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    let dayIncome = 0;
    let dayExpense = 0;
    for (const t of monthlyTransactions || []) {
      const tDate = typeof t.date === "string" ? t.date.split("T")[0] : "";
      if (tDate === dateStr) {
        if (t.type === "income") dayIncome += Number(t.amount || 0);
        else if (t.type === "expense") dayExpense += Number(t.amount || 0);
      }
    }
    weeklySpending.push({
      day: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      shortDay: dayNames[d.getDay()],
      income: dayIncome,
      expense: dayExpense,
    });
  }

  return {
    totalBalance,
    income,
    expense,
    lastMonthIncome,
    lastMonthExpense,
    recentTransactions: recentTransactions || [],
    activeWalletsCount: wallets?.length || 0,
    goalsProgress: {
      active: activeGoals,
      total: (goals || []).length,
      saved: totalSaved,
      target: totalTarget,
    },
    budgetStatus: {
      onTrack,
      overBudget,
      totalBudgeted,
      totalSpent,
    },
    debtSummary: {
      payable,
      receivable,
      overdue: overdueCount,
    },
    topCategories,
    weeklySpending,
  };
}
