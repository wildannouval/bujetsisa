"use server";

import { createClient } from "@/lib/supabase/server";

interface FinancialInsights {
  // Health Score (0-100)
  healthScore: number;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  healthMessage: string;

  // Emergency Fund
  emergencyFundTotal: number;
  emergencyFundTarget: number;
  emergencyFundPercentage: number;
  monthsOfCoverage: number;

  // Survival Calculation
  averageMonthlyExpense: number;
  totalAvailableFunds: number;
  survivalMonths: number;
  survivalMessage: string;

  // Recommendations
  recommendations: {
    type: "warning" | "tip" | "success";
    title: string;
    message: string;
    priority: number;
  }[];

  // Debt Health
  debtToIncomeRatio: number;
  totalUnpaidDebt: number;

  // Savings Rate
  savingsRate: number;
  monthlySavings: number;
}

export async function getFinancialInsights(): Promise<FinancialInsights | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get all wallets for total balance
  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("user_id", user.id);

  const totalBalance =
    wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;

  // Get goals with emergency fund info
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);

  const emergencyFundGoals = goals?.filter((g) => g.is_emergency_fund) || [];

  // Calculate emergency fund total - use wallet balance if linked
  let emergencyFundTotal = 0;
  for (const goal of emergencyFundGoals) {
    if (goal.wallet_id) {
      const linkedWallet = wallets?.find((w) => w.id === goal.wallet_id);
      emergencyFundTotal += linkedWallet ? Number(linkedWallet.balance) : 0;
    } else {
      emergencyFundTotal += Number(goal.current_amount);
    }
  }

  const emergencyFundTarget = emergencyFundGoals.reduce(
    (sum, g) => sum + Number(g.target_amount),
    0,
  );

  // Get transactions for last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type, date")
    .eq("user_id", user.id)
    .gte("date", threeMonthsAgo.toISOString().split("T")[0]);

  // Calculate monthly averages
  let totalExpense3m = 0;
  let totalIncome3m = 0;

  transactions?.forEach((t) => {
    if (t.type === "expense") {
      totalExpense3m += Number(t.amount);
    } else {
      totalIncome3m += Number(t.amount);
    }
  });

  const averageMonthlyExpense = totalExpense3m / 3;
  const averageMonthlyIncome = totalIncome3m / 3;
  const monthlySavings = averageMonthlyIncome - averageMonthlyExpense;
  const savingsRate =
    averageMonthlyIncome > 0
      ? (monthlySavings / averageMonthlyIncome) * 100
      : 0;

  // Get unpaid debts
  const { data: debts } = await supabase
    .from("debts")
    .select("amount, type")
    .eq("user_id", user.id)
    .eq("status", "unpaid");

  const totalUnpaidPayable =
    debts
      ?.filter((d) => d.type === "payable")
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalUnpaidReceivable =
    debts
      ?.filter((d) => d.type === "receivable")
      .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  // Survival Calculation
  // totalAvailableFunds = totalBalance (emergency fund wallets are already included in totalBalance)
  const totalAvailableFunds = totalBalance;
  const survivalMonths =
    averageMonthlyExpense > 0
      ? totalAvailableFunds / averageMonthlyExpense
      : 999;

  // Debt to Income Ratio
  const debtToIncomeRatio =
    averageMonthlyIncome > 0
      ? (totalUnpaidPayable / averageMonthlyIncome) * 100
      : 0;

  // Calculate Health Score (0-100)
  let healthScore = 50; // Base score

  // Emergency fund factor (+/- 20)
  const monthsOfCoverage =
    averageMonthlyExpense > 0 ? emergencyFundTotal / averageMonthlyExpense : 0;
  if (monthsOfCoverage >= 6) healthScore += 20;
  else if (monthsOfCoverage >= 3) healthScore += 10;
  else if (monthsOfCoverage >= 1) healthScore += 0;
  else healthScore -= 10;

  // Savings rate factor (+/- 15)
  if (savingsRate >= 30) healthScore += 15;
  else if (savingsRate >= 20) healthScore += 10;
  else if (savingsRate >= 10) healthScore += 5;
  else if (savingsRate < 0) healthScore -= 15;

  // Debt factor (+/- 15)
  if (totalUnpaidPayable === 0) healthScore += 15;
  else if (debtToIncomeRatio <= 10) healthScore += 10;
  else if (debtToIncomeRatio <= 30) healthScore += 0;
  else if (debtToIncomeRatio <= 50) healthScore -= 10;
  else healthScore -= 15;

  // Clamp score
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Determine status
  let healthStatus: FinancialInsights["healthStatus"];
  let healthMessage: string;

  if (healthScore >= 80) {
    healthStatus = "excellent";
    healthMessage =
      "Keuangan Anda sangat sehat! Pertahankan kebiasaan baik ini.";
  } else if (healthScore >= 60) {
    healthStatus = "good";
    healthMessage =
      "Keuangan Anda cukup baik. Ada beberapa area yang bisa ditingkatkan.";
  } else if (healthScore >= 40) {
    healthStatus = "fair";
    healthMessage =
      "Keuangan Anda perlu perhatian. Fokus pada penghematan dan dana darurat.";
  } else if (healthScore >= 20) {
    healthStatus = "poor";
    healthMessage = "Peringatan! Keuangan Anda butuh perbaikan segera.";
  } else {
    healthStatus = "critical";
    healthMessage =
      "Darurat! Segera evaluasi pengeluaran dan cari sumber pendapatan tambahan.";
  }

  // Survival message
  let survivalMessage: string;
  if (survivalMonths >= 12) {
    survivalMessage = `Dana Anda bisa bertahan ${Math.floor(survivalMonths)} bulan. Sangat aman!`;
  } else if (survivalMonths >= 6) {
    survivalMessage = `Dana Anda bisa bertahan ${Math.floor(survivalMonths)} bulan. Cukup aman.`;
  } else if (survivalMonths >= 3) {
    survivalMessage = `Dana Anda bisa bertahan ${Math.floor(survivalMonths)} bulan. Perlu ditingkatkan.`;
  } else {
    survivalMessage = `Peringatan! Dana Anda hanya cukup untuk ${survivalMonths.toFixed(1)} bulan.`;
  }

  // Generate recommendations
  const recommendations: FinancialInsights["recommendations"] = [];

  // Emergency fund recommendations
  if (monthsOfCoverage < 3) {
    recommendations.push({
      type: "warning",
      title: "Dana Darurat Kurang",
      message: `Dana darurat Anda hanya cukup untuk ${monthsOfCoverage.toFixed(1)} bulan. Target minimal 3-6 bulan pengeluaran.`,
      priority: 1,
    });
  } else if (monthsOfCoverage >= 6) {
    recommendations.push({
      type: "success",
      title: "Dana Darurat Aman",
      message: `Selamat! Dana darurat Anda mencukupi untuk ${monthsOfCoverage.toFixed(1)} bulan.`,
      priority: 5,
    });
  }

  // Savings rate recommendations
  if (savingsRate < 10) {
    recommendations.push({
      type: "warning",
      title: "Tingkat Tabungan Rendah",
      message: `Tingkat tabungan Anda ${savingsRate.toFixed(1)}%. Target minimal 10-20% dari pendapatan.`,
      priority: 2,
    });
  } else if (savingsRate >= 30) {
    recommendations.push({
      type: "success",
      title: "Tabungan Sangat Baik",
      message: `Wow! Anda menabung ${savingsRate.toFixed(1)}% dari pendapatan. Luar biasa!`,
      priority: 5,
    });
  }

  // Debt recommendations
  if (totalUnpaidPayable > 0) {
    recommendations.push({
      type: debtToIncomeRatio > 30 ? "warning" : "tip",
      title: "Hutang Belum Lunas",
      message: `Anda memiliki hutang Rp ${totalUnpaidPayable.toLocaleString("id-ID")}. Prioritaskan pelunasan.`,
      priority: debtToIncomeRatio > 30 ? 1 : 3,
    });
  }

  // Receivable reminder
  if (totalUnpaidReceivable > 0) {
    recommendations.push({
      type: "tip",
      title: "Piutang Belum Diterima",
      message: `Ada piutang Rp ${totalUnpaidReceivable.toLocaleString("id-ID")} yang belum diterima. Ingatkan yang berhutang.`,
      priority: 4,
    });
  }

  // Sort recommendations by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  return {
    healthScore,
    healthStatus,
    healthMessage,
    emergencyFundTotal,
    emergencyFundTarget,
    emergencyFundPercentage:
      emergencyFundTarget > 0
        ? (emergencyFundTotal / emergencyFundTarget) * 100
        : 0,
    monthsOfCoverage,
    averageMonthlyExpense,
    totalAvailableFunds,
    survivalMonths,
    survivalMessage,
    recommendations,
    debtToIncomeRatio,
    totalUnpaidDebt: totalUnpaidPayable,
    savingsRate,
    monthlySavings,
  };
}

// Get spending trends
export async function getSpendingTrends() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Get last 6 months of transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      amount, type, date,
      category:categories(id, name, icon)
    `,
    )
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", sixMonthsAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (!transactions) return null;

  // Group by month
  const monthlyData: Record<string, number> = {};
  const categoryData: Record<
    string,
    { name: string; icon: string; total: number }
  > = {};

  transactions.forEach((t) => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(t.amount);

    // Handle category as array or object
    const cat = Array.isArray(t.category) ? t.category[0] : t.category;
    if (cat) {
      if (!categoryData[cat.id]) {
        categoryData[cat.id] = { name: cat.name, icon: cat.icon, total: 0 };
      }
      categoryData[cat.id].total += Number(t.amount);
    }
  });

  // Calculate trend
  const months = Object.keys(monthlyData).sort();
  const values = months.map((m) => monthlyData[m]);

  // Calculate trend direction
  let trend: "up" | "down" | "stable" = "stable";
  if (values.length >= 2) {
    const lastMonth = values[values.length - 1];
    const previousMonth = values[values.length - 2];
    const change = ((lastMonth - previousMonth) / previousMonth) * 100;
    if (change > 5) trend = "up";
    else if (change < -5) trend = "down";
  }

  // Top categories
  const topCategories = Object.values(categoryData)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    monthlyData: months.map((month) => ({
      month,
      amount: monthlyData[month],
    })),
    trend,
    trendPercentage:
      values.length >= 2
        ? ((values[values.length - 1] - values[values.length - 2]) /
            values[values.length - 2]) *
          100
        : 0,
    topCategories,
    totalExpense6m: values.reduce((sum, v) => sum + v, 0),
  };
}

// Get monthly comparison data
export async function getMonthlyComparison(monthsBack: number = 1) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      currentMonth: { income: 0, expense: 0, net: 0, transactionCount: 0 },
      compareMonth: { income: 0, expense: 0, net: 0, transactionCount: 0 },
      incomeChange: 0,
      expenseChange: 0,
      netChange: 0,
    };
  }

  // Calculate date ranges
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const compareMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - monthsBack,
    1,
  );
  const compareMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() - monthsBack + 1,
    0,
  );

  // Get current month transactions
  const { data: currentTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", currentMonthStart.toISOString().split("T")[0])
    .lte("date", currentMonthEnd.toISOString().split("T")[0]);

  // Get compare month transactions
  const { data: compareTransactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .gte("date", compareMonthStart.toISOString().split("T")[0])
    .lte("date", compareMonthEnd.toISOString().split("T")[0]);

  // Calculate current month totals
  let currentIncome = 0;
  let currentExpense = 0;
  currentTransactions?.forEach((t) => {
    if (t.type === "income") {
      currentIncome += Number(t.amount);
    } else {
      currentExpense += Number(t.amount);
    }
  });

  // Calculate compare month totals
  let compareIncome = 0;
  let compareExpense = 0;
  compareTransactions?.forEach((t) => {
    if (t.type === "income") {
      compareIncome += Number(t.amount);
    } else {
      compareExpense += Number(t.amount);
    }
  });

  // Calculate changes
  const incomeChange =
    compareIncome > 0
      ? ((currentIncome - compareIncome) / compareIncome) * 100
      : currentIncome > 0
        ? 100
        : 0;

  const expenseChange =
    compareExpense > 0
      ? ((currentExpense - compareExpense) / compareExpense) * 100
      : currentExpense > 0
        ? 100
        : 0;

  const currentNet = currentIncome - currentExpense;
  const compareNet = compareIncome - compareExpense;
  const netChange =
    compareNet !== 0
      ? ((currentNet - compareNet) / Math.abs(compareNet)) * 100
      : currentNet !== 0
        ? 100
        : 0;

  return {
    currentMonth: {
      income: currentIncome,
      expense: currentExpense,
      net: currentNet,
      transactionCount: currentTransactions?.length || 0,
    },
    compareMonth: {
      income: compareIncome,
      expense: compareExpense,
      net: compareNet,
      transactionCount: compareTransactions?.length || 0,
    },
    incomeChange,
    expenseChange,
    netChange,
  };
}
