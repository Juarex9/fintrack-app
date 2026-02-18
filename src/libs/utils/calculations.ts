import type { Transaction } from "../../types/finance";
import { monthFromISODate } from "./dates";

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => monthFromISODate(t.date) === month);
}

export function sumIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
}

export function sumExpense(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
}

export function sumByCategoryExpense(transactions: Transaction[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
  }
  return map;
}

export function spentPercentage(expense: number, budgetTotal: number): number {
  if (budgetTotal <= 0) return 0;
  return Math.min(999, (expense / budgetTotal) * 100);
}
