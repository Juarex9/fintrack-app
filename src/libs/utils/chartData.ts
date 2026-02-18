import type { Category, Transaction } from "../../types/finance";

/**
 * Line chart: gastos por día (YYYY-MM-DD) dentro del mes actual
 * output: [{ date: "2026-02-01", expense: 12000 }, ...]
 */
export function buildDailyExpenseSeries(monthTx: Transaction[]) {
  const map = new Map<string, number>();

  for (const t of monthTx) {
    if (t.type !== "expense") continue;
    map.set(t.date, (map.get(t.date) ?? 0) + t.amount);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, expense]) => ({ date, expense }));
}

/**
 * Bar/Donut: gastos por categoría (incluye categoryId para navegación)
 * output: [{ categoryId, name: "Food", value: 35000 }, ...]
 */
export function buildCategoryExpenseSeries(
  monthTx: Transaction[],
  categories: Category[]
) {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const map = new Map<string, number>();

  for (const t of monthTx) {
    if (t.type !== "expense") continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }

  return Array.from(map.entries())
    .map(([categoryId, value]) => ({
      categoryId,
      name: nameById.get(categoryId) ?? "Other",
      value,
    }))
    .sort((a, b) => b.value - a.value);
}
