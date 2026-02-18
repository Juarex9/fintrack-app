import type { MonthlyBudget } from "../../types/finance";

const KEY = "fintrack.budgets.v1"; // map month -> budget

type BudgetMap = Record<string, MonthlyBudget>;

function read(): BudgetMap {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as BudgetMap;
  } catch {
    return {};
  }
}

function write(map: BudgetMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export const budgetsStorage = {
  get(month: string): MonthlyBudget | null {
    const map = read();
    return map[month] ?? null;
  },
  set(budget: MonthlyBudget): void {
    const map = read();
    map[budget.month] = budget;
    write(map);
  },
};
