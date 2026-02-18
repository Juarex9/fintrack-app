export type TxType = "income" | "expense";
export type CategoryKind = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  note?: string;
  createdAt: string; // ISO
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  totalAmount: number;
  warningThreshold: number; // 0.8 por defecto
  categoryLimits: Record<string, number>; // categoryId -> limit
}

export type GoalStatus = "active" | "paused" | "done";
export type GoalPriority = "low" | "medium" | "high";

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // YYYY-MM-DD
  priority: GoalPriority;
  status: GoalStatus;
  createdAt: string; // ISO
}
