import { transactionsStorage } from "./transactions.storage";
import { budgetsStorage } from "./budgets.storage";
import { goalsStorage } from "./goal.storage";
import { categoriesStorage } from "./categories.storage";
import { settingsStorage, type AppSettings } from "./settings.storage";
import type { Transaction, MonthlyBudget, Goal, Category } from "../../types/finance";

export type AppExport = {
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: MonthlyBudget[]; // si tu budgetsStorage no tiene list(), abajo te explico
  goals: Goal[];
};

export function exportAllData(): AppExport {
  const settings = settingsStorage.get();
  const categories = categoriesStorage.list();
  const transactions = transactionsStorage.list();
  const goals = goalsStorage.list();

  // budgetsStorage: si no tenés list(), guardamos solo los meses existentes (mejorable)
  // RECOMENDADO: agregar budgetsStorage.list() y usarlo acá.
  const budgets: MonthlyBudget[] = budgetsStorage.list ? budgetsStorage.list() : [];

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    categories,
    transactions,
    budgets,
    goals,
  };
}

export function importAllData(payload: AppExport) {
  // minimal validation
  if (!payload || payload.version !== 1) throw new Error("Invalid export version");

  // settings
  settingsStorage.set(payload.settings);

  // overwrite data in storages (need helper methods)
  // Recomendación: agregar .replaceAll() en cada storage para hacerlo prolijo.
  // Para hoy, hacemos reset y recreamos.

  // categories: si tu categoriesStorage no tiene replaceAll, dejalo como seed fijo.
  // acá NO tocamos categorías para evitar romper ids (si vos las editaste, decime y lo habilitamos).

  // transactions
  if (transactionsStorage.replaceAll) transactionsStorage.replaceAll(payload.transactions);
  else {
    // fallback: hard reset via key if exists (no lo puedo asumir)
    payload.transactions.forEach((t) => transactionsStorage.create(t));
  }

  // budgets
  if (budgetsStorage.replaceAll) budgetsStorage.replaceAll(payload.budgets);
  else {
    payload.budgets.forEach((b) => budgetsStorage.set(b));
  }

  // goals
  if (goalsStorage.replaceAll) goalsStorage.replaceAll(payload.goals);
  else {
    payload.goals.forEach((g) => goalsStorage.create(g));
  }
}

export function resetAllData() {
  // si tus storages no tienen reset(), lo correcto es agregarlos.
  transactionsStorage.reset?.();
  goalsStorage.reset?.();
  budgetsStorage.reset?.();
  settingsStorage.reset();

  // categories normalmente no se borran (seed)
  categoriesStorage.ensureSeeded?.();
}
