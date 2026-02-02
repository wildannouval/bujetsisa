export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_seed?: string;
  avatar_style?: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: "cash" | "bank" | "ewallet";
  balance: number;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id?: string;
  amount: number;
  date: string;
  description?: string;
  type: "income" | "expense";
  created_at: string;
  updated_at: string;
  // Join results
  wallet?: Pick<Wallet, "id" | "name">;
  category?: Pick<Category, "id" | "name" | "icon">;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date?: string;
  type: "payable" | "receivable";
  status: "paid" | "unpaid" | "partial";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly";
  created_at: string;
  updated_at: string;
  // Join result
  category?: Pick<Category, "id" | "name" | "icon">;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon: string;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}
