import React from "react";
import Topbar from "../app/layout/Topbar";
import { budgetsStorage } from "../libs/storage/budgets.storage";
import { categoriesStorage } from "../libs/storage/categories.storage";
import { currentMonth } from "../libs/utils/dates";
import { formatARS } from "../libs/utils/currency";
import type { MonthlyBudget } from "../types/finance";

function clampNum(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export default function BudgetsPage() {
  const [month, setMonth] = React.useState(currentMonth());

  const expenseCategories = React.useMemo(
    () => categoriesStorage.listByKind("expense"),
    []
  );

  const [budget, setBudget] = React.useState<MonthlyBudget>(() => {
    const stored = budgetsStorage.get(month);
    return (
      stored ?? {
        month,
        totalAmount: 0,
        warningThreshold: 0.8,
        categoryLimits: {},
      }
    );
  });

  // cuando cambia el mes, cargar budget
  React.useEffect(() => {
    const stored = budgetsStorage.get(month);
    setBudget(
      stored ?? {
        month,
        totalAmount: 0,
        warningThreshold: 0.8,
        categoryLimits: {},
      }
    );
  }, [month]);

  const sumCategories = React.useMemo(() => {
    return Object.values(budget.categoryLimits).reduce((acc, v) => acc + (v || 0), 0);
  }, [budget.categoryLimits]);

  const overTotal = budget.totalAmount > 0 && sumCategories > budget.totalAmount;

  function save() {
    budgetsStorage.set({ ...budget, month });
    alert("Budget saved!");
  }

  return (
    <>
      <Topbar title="Budgets" month={month} onMonthChange={setMonth} />

      <div className="p-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-100">Monthly budget</h2>
            <button
              onClick={save}
              className="h-9 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              Save
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Total budget</div>
              <input
                type="number"
                value={budget.totalAmount}
                onChange={(e) =>
                  setBudget((b) => ({ ...b, totalAmount: clampNum(Number(e.target.value)) }))
                }
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <div className="mt-2 text-xs text-slate-500">{formatARS(budget.totalAmount)}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Warning threshold</div>
              <input
                type="number"
                step="0.05"
                min={0.1}
                max={0.95}
                value={budget.warningThreshold}
                onChange={(e) =>
                  setBudget((b) => ({
                    ...b,
                    warningThreshold: Math.min(0.95, Math.max(0.1, Number(e.target.value))),
                  }))
                }
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <div className="mt-2 text-xs text-slate-500">
                Warnings at {Math.round(budget.warningThreshold * 100)}%
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Category limits sum</div>
              <div className="mt-2 text-2xl font-semibold text-slate-50">{formatARS(sumCategories)}</div>
              <div className="mt-2 text-xs text-slate-500">
                {overTotal ? (
                  <span className="text-rose-400">Sum exceeds total budget.</span>
                ) : (
                  <span>Good: within total budget.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Per category */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-medium text-slate-100">Per-category limits</h2>
            <p className="text-xs text-slate-400 mt-1">
              Optional. Helps alerts/IA detect overspending by category.
            </p>
          </div>

          <div className="p-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {expenseCategories.map((c) => {
              const value = budget.categoryLimits[c.id] ?? 0;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-100">{c.name}</div>
                    <button
                      onClick={() =>
                        setBudget((b) => {
                          const next = { ...b.categoryLimits };
                          delete next[c.id];
                          return { ...b, categoryLimits: next };
                        })
                      }
                      className="text-xs text-slate-500 hover:text-slate-200"
                      title="Remove limit"
                    >
                      Clear
                    </button>
                  </div>

                  <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const n = clampNum(Number(e.target.value));
                      setBudget((b) => ({
                        ...b,
                        categoryLimits: { ...b.categoryLimits, [c.id]: n },
                      }));
                    }}
                    className="mt-3 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <div className="mt-2 text-xs text-slate-500">{formatARS(value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
