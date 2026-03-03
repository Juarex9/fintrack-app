import { transactionsStorage } from "../storage/transactions.storage";
import { budgetsStorage } from "../storage/budgets.storage";
import { goalsStorage } from "../storage/goal.storage";
import { categoriesStorage } from "../storage/categories.storage";

import type { Transaction, MonthlyBudget, Goal } from "../../types/finance";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthKey(d: Date) {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

function rid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Intenta persistir un budget con el método disponible.
 * (evita errores TS por diferencias entre tu storage y el mío)
 */
function saveBudget(budget: MonthlyBudget) {
  const s: any = budgetsStorage as any;

  if (typeof s.upsert === "function") return s.upsert(budget);
  if (typeof s.set === "function") return s.set(budget);
  if (typeof s.save === "function") return s.save(budget);
  if (typeof s.put === "function") return s.put(budget);

  // fallback: si no hay nada, no hacemos nada (pero no rompe)
  console.warn("No budget save method found on budgetsStorage");
}

/**
 * Intenta persistir un goal con el método disponible.
 */
function saveGoal(goal: Goal) {
  const s: any = goalsStorage as any;

  if (typeof s.create === "function") return s.create(goal);
  if (typeof s.upsert === "function") return s.upsert(goal);
  if (typeof s.set === "function") return s.set(goal);
  if (typeof s.save === "function") return s.save(goal);

  console.warn("No goal save method found on goalsStorage");
}

/**
 * Reset global:
 * 1) si tus storages tienen clear/reset, los usa
 * 2) sino borra keys típicas de localStorage
 */
export function resetAllData() {
  const ts: any = transactionsStorage as any;
  const bs: any = budgetsStorage as any;
  const gs: any = goalsStorage as any;
  const cs: any = categoriesStorage as any;

  if (typeof ts.clear === "function") ts.clear();
  if (typeof bs.clear === "function") bs.clear();
  if (typeof gs.clear === "function") gs.clear();
  if (typeof cs.clear === "function") cs.clear();

  // Fallback (por si tus storages no exponen clear)
  try {
    localStorage.removeItem("fintrack_transactions");
    localStorage.removeItem("fintrack_budgets");
    localStorage.removeItem("fintrack_goals");
    localStorage.removeItem("fintrack_categories");
  } catch {}
}

export function seedDemoData() {
  // Ensure categories exist
  (categoriesStorage as any).ensureSeeded?.();

  const cats = categoriesStorage.list();
  const expenseCats = cats.filter((c: any) => c.kind === "expense");
  const incomeCats = cats.filter((c: any) => c.kind === "income");

  const today = new Date();
  const m = monthKey(today);

  // --- Budget (sin updatedAt porque tu type no lo tiene)
  const demoBudget: MonthlyBudget = {
    month: m,
    totalAmount: 450000,
    warningThreshold: 0.8,
    categoryLimits: Object.fromEntries(
      expenseCats.slice(0, 6).map((c: any, idx: number) => {
        const limits = [120000, 90000, 60000, 40000, 35000, 25000];
        return [c.id, limits[idx] ?? 20000];
      })
    ),
  };

  saveBudget(demoBudget);

  // --- Transactions
  const t: Transaction[] = [];

  const salaryCat = incomeCats[0]?.id;
  if (salaryCat) {
    t.push({
      id: rid("tx"),
      type: "income",
      amount: 800000,
      date: iso(new Date(today.getFullYear(), today.getMonth(), 1)),
      categoryId: salaryCat,
      note: "Salary",
      createdAt: new Date().toISOString(),
    } as any);
  }

  const pick = (i: number) => expenseCats[i % Math.max(1, expenseCats.length)]?.id;

  const base = new Date(today.getFullYear(), today.getMonth(), 1);
  const exp = [
    { day: 2, amt: 18000, note: "Groceries", c: pick(0) },
    { day: 3, amt: 9500, note: "Uber", c: pick(1) },
    { day: 5, amt: 22000, note: "Restaurant", c: pick(0) },
    { day: 7, amt: 12000, note: "Internet", c: pick(2) },
    { day: 10, amt: 35000, note: "Rent portion", c: pick(3) },
    { day: 12, amt: 8000, note: "Coffee", c: pick(0) },
    { day: 14, amt: 17000, note: "Pharmacy", c: pick(4) },
    { day: 16, amt: 26000, note: "Gym", c: pick(5) },
    { day: 18, amt: 14000, note: "Fuel", c: pick(1) },
    { day: 20, amt: 24000, note: "Shopping", c: pick(4) },
    { day: 22, amt: 18000, note: "Groceries 2", c: pick(0) },
  ];

  for (const e of exp) {
    if (!e.c) continue;
    const d = new Date(base.getFullYear(), base.getMonth(), e.day);
    t.push({
      id: rid("tx"),
      type: "expense",
      amount: e.amt,
      date: iso(d),
      categoryId: e.c,
      note: e.note,
      createdAt: new Date().toISOString(),
    } as any);
  }

  for (const tx of t) {
    transactionsStorage.create(tx);
  }

  // --- Goals
  const demoGoals: Goal[] = [
    {
      id: rid("goal"),
      name: "Emergency fund",
      targetAmount: 1500000,
      currentAmount: 250000,
      deadline: "",
      priority: "high",
      status: "active",
    } as any,
    {
      id: rid("goal"),
      name: "New laptop",
      targetAmount: 900000,
      currentAmount: 120000,
      deadline: "",
      priority: "medium",
      status: "active",
    } as any,
  ];

  for (const g of demoGoals) saveGoal(g);
}
