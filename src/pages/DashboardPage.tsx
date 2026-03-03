import React from "react";
import Topbar from "../app/layout/Topbar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { transactionsStorage } from "../libs/storage/transactions.storage";
import { budgetsStorage } from "../libs/storage/budgets.storage";
import { goalsStorage } from "../libs/storage/goal.storage";
import { categoriesStorage } from "../libs/storage/categories.storage";

import { currentMonth } from "../libs/utils/dates";
import { formatARS } from "../libs/utils/currency";
import {
  filterByMonth,
  sumIncome,
  sumExpense,
  sumByCategoryExpense,
  spentPercentage,
} from "../libs/utils/calculations";

import {
  buildDailyExpenseSeries,
  buildCategoryExpenseSeries,
} from "../libs/utils/chartData";

import type { Category, MonthlyBudget, Transaction, Goal } from "../types/finance";

// Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type AlertKind = "info" | "warning" | "danger";

type AlertItem = {
  kind: AlertKind;
  title: string;
  description: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function Panel({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/30">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-slate-100">{title}</h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function pillClasses(kind: AlertKind) {
  switch (kind) {
    case "danger":
      return "bg-rose-500/15 text-rose-300 border-rose-500/20";
    case "warning":
      return "bg-amber-500/15 text-amber-300 border-amber-500/20";
    default:
      return "bg-sky-500/15 text-sky-300 border-sky-500/20";
  }
}

function progressBarKind(pct: number, warnPct: number) {
  if (pct >= 100) return "bg-rose-500";
  if (pct >= warnPct) return "bg-amber-500";
  return "bg-indigo-500";
}

// Donut colors
const DONUT_COLORS = [
  "rgba(99,102,241,0.95)",
  "rgba(16,185,129,0.95)",
  "rgba(245,158,11,0.95)",
  "rgba(239,68,68,0.95)",
  "rgba(14,165,233,0.95)",
  "rgba(168,85,247,0.95)",
  "rgba(244,63,94,0.95)",
  "rgba(34,197,94,0.95)",
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [month, setMonth] = React.useState(currentMonth());

  function goToCategory(categoryId: string) {
    const params = new URLSearchParams();
    params.set("month", month);
    params.set("type", "expense");
    params.set("category", categoryId);
    navigate(`/transactions?${params.toString()}`);
  }

  const categories = React.useMemo<Category[]>(() => categoriesStorage.list(), []);

  const transactions = React.useMemo<Transaction[]>(() => {
    return transactionsStorage.list();
  }, []);

  const monthTx = React.useMemo(() => {
    return filterByMonth(transactions, month);
  }, [transactions, month]);

  const income = React.useMemo(() => sumIncome(monthTx), [monthTx]);
  const expense = React.useMemo(() => sumExpense(monthTx), [monthTx]);
  const balance = React.useMemo(() => income - expense, [income, expense]);

  const budget = React.useMemo<MonthlyBudget | null>(() => {
    return budgetsStorage.get(month);
  }, [month]);

  const budgetTotal = budget?.totalAmount ?? 0;
  const warnThreshold = budget?.warningThreshold ?? 0.8;

  const budgetPct = React.useMemo(() => {
    return spentPercentage(expense, budgetTotal);
  }, [expense, budgetTotal]);

  // Category spending vs limits
  const expenseByCategory = React.useMemo(() => {
    return sumByCategoryExpense(monthTx);
  }, [monthTx]);

  const topCategories = React.useMemo(() => {
    const rows = categories
      .filter((c) => c.kind === "expense")
      .map((c) => {
        const spent = expenseByCategory[c.id] ?? 0;
        const limit = budget?.categoryLimits?.[c.id] ?? 0;
        return { category: c, spent, limit };
      })
      .filter((r) => r.spent > 0 || r.limit > 0);

    rows.sort((a, b) => b.spent - a.spent);
    return rows.slice(0, 6);
  }, [categories, expenseByCategory, budget]);

  // Goals summary
  const goals = React.useMemo<Goal[]>(() => goalsStorage.list(), []);
  const activeGoals = React.useMemo(() => {
    return goals.filter((g) => g.status !== "paused").slice(0, 3);
  }, [goals]);

  // Alerts (translated + interpolated)
  const alerts = React.useMemo<AlertItem[]>(() => {
    const a: AlertItem[] = [];
    const warnPctLocal = warnThreshold * 100;

    if (budgetTotal > 0) {
      if (budgetPct >= 100) {
        a.push({
          kind: "danger",
          title: t("alerts.total.exceeded.title"),
          description: t("alerts.total.exceeded.desc", {
            pct: Math.round(budgetPct),
            spent: formatARS(expense),
            total: formatARS(budgetTotal),
          }),
        });
      } else if (budgetPct >= warnPctLocal) {
        a.push({
          kind: "warning",
          title: t("alerts.total.near.title"),
          description: t("alerts.total.near.desc", {
            pct: Math.round(budgetPct),
            warn: Math.round(warnPctLocal),
          }),
        });
      } else {
        a.push({
          kind: "info",
          title: t("alerts.total.ok.title"),
          description: t("alerts.total.ok.desc", { pct: Math.round(budgetPct) }),
        });
      }
    } else {
      a.push({
        kind: "info",
        title: t("alerts.total.none.title"),
        description: t("alerts.total.none.desc"),
      });
    }

    if (budget?.categoryLimits) {
      const entries = Object.entries(budget.categoryLimits)
        .map(([categoryId, limit]) => {
          const spent = expenseByCategory[categoryId] ?? 0;
          return { categoryId, limit: limit ?? 0, spent };
        })
        .filter((x) => x.limit > 0);

      for (const x of entries) {
        const pct = x.limit > 0 ? (x.spent / x.limit) * 100 : 0;
        const catName =
          categories.find((c) => c.id === x.categoryId)?.name ?? t("common.category");

        if (pct >= 100) {
          a.push({
            kind: "danger",
            title: t("alerts.category.exceeded.title", { name: catName }),
            description: t("alerts.category.exceeded.desc", {
              pct: Math.round(pct),
              spent: formatARS(x.spent),
              limit: formatARS(x.limit),
            }),
          });
        } else if (pct >= warnPctLocal) {
          a.push({
            kind: "warning",
            title: t("alerts.category.near.title", { name: catName }),
            description: t("alerts.category.near.desc", {
              pct: Math.round(pct),
              spent: formatARS(x.spent),
              limit: formatARS(x.limit),
            }),
          });
        }
      }
    }

    return a.slice(0, 6);
  }, [
    t,
    budgetTotal,
    budgetPct,
    warnThreshold,
    expense,
    budget,
    expenseByCategory,
    categories,
  ]);

  // Chart data
  const dailySeries = React.useMemo(() => buildDailyExpenseSeries(monthTx), [monthTx]);

  const categorySeries = React.useMemo(
    () => buildCategoryExpenseSeries(monthTx, categories).slice(0, 8),
    [monthTx, categories]
  );

  const warnPct = warnThreshold * 100;
  const barClass = progressBarKind(budgetPct, warnPct);

  return (
    <>
      <Topbar title={t("dashboard.title")} month={month} onMonthChange={setMonth} />

      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.kpi.incomeMonth")}
            value={formatARS(income)}
            hint={t("dashboard.hints.incomeTxCount", {
              count: monthTx.filter((x) => x.type === "income").length,
            })}
          />
          <StatCard
            label={t("dashboard.kpi.expensesMonth")}
            value={formatARS(expense)}
            hint={t("dashboard.hints.expenseTxCount", {
              count: monthTx.filter((x) => x.type === "expense").length,
            })}
          />
          <StatCard
            label={t("dashboard.kpi.balance")}
            value={formatARS(balance)}
            hint={t("dashboard.hints.incomeMinusExpense")}
          />
          <StatCard
            label={t("dashboard.kpi.budgetUsage")}
            value={budgetTotal > 0 ? `${Math.round(budgetPct)}%` : "—"}
            hint={
              budgetTotal > 0
                ? `${formatARS(expense)} / ${formatARS(budgetTotal)}`
                : t("dashboard.hints.setMonthlyBudget")
            }
          />
        </div>

        {/* Main grid */}
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <Panel title={t("dashboard.panels.spendingOverTime")}>
              <div className="h-64">
                {dailySeries.length === 0 ? (
                  <div className="h-full rounded-xl border border-dashed border-white/15 bg-slate-950/30 flex items-center justify-center text-sm text-slate-500">
                    {t("dashboard.empty.noExpenseData")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySeries} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
                        tickFormatter={(v) => String(v).slice(8, 10)}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      />
                      <YAxis
                        tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
                        tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(2,6,23,0.95)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 12,
                        }}
                        labelStyle={{ color: "rgba(226,232,240,0.85)" }}
                        formatter={(value) => formatARS(Number(value))}
                      />
                      <Line type="monotone" dataKey="expense" stroke="rgba(99,102,241,0.95)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>

            <Panel
              title={t("dashboard.panels.expensesByCategory")}
              right={<span className="text-xs text-slate-500">{t("dashboard.hints.clickToFilter")}</span>}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {/* Bar */}
                <div className="h-64">
                  {categorySeries.length === 0 ? (
                    <div className="h-full rounded-xl border border-dashed border-white/15 bg-slate-950/30 flex items-center justify-center text-sm text-slate-500">
                      {t("dashboard.empty.noCategoryData")}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categorySeries}
                        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                        onClick={(state: any) => {
                          const payload = state?.activePayload?.[0]?.payload;
                          if (payload?.categoryId) goToCategory(payload.categoryId);
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                          tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                          interval={0}
                          tickFormatter={(v) =>
                            String(v).length > 10 ? String(v).slice(0, 10) + "…" : String(v)
                          }
                        />
                        <YAxis
                          tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 12 }}
                          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                          axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                          tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(2,6,23,0.95)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12,
                          }}
                          labelStyle={{ color: "rgba(226,232,240,0.85)" }}
                          formatter={(value) => formatARS(Number(value))}
                        />
                        <Bar dataKey="value" fill="rgba(99,102,241,0.95)" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Donut */}
                <div className="h-64">
                  {categorySeries.length === 0 ? (
                    <div className="h-full rounded-xl border border-dashed border-white/15 bg-slate-950/30 flex items-center justify-center text-sm text-slate-500">
                      {t("dashboard.empty.noData")}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(2,6,23,0.95)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12,
                          }}
                          formatter={(value) => formatARS(Number(value))}
                        />
                        <Pie
                          data={categorySeries}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="55%"
                          outerRadius="80%"
                          paddingAngle={2}
                          onClick={(_, idx) => {
                            const item = categorySeries[idx];
                            if (item?.categoryId) goToCategory(item.categoryId);
                          }}
                        >
                          {categorySeries.map((_, idx) => (
                            <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </Panel>

            <Panel
              title={t("dashboard.panels.topCategories")}
              right={<span className="text-xs text-slate-500">{t("dashboard.hints.clickToFilter")}</span>}
            >
              {topCategories.length === 0 ? (
                <div className="text-sm text-slate-400">{t("dashboard.empty.noTopCategories")}</div>
              ) : (
                <div className="space-y-3">
                  {topCategories.map((r) => {
                    const limit = r.limit;
                    const spent = r.spent;
                    const pct = limit > 0 ? Math.min(999, (spent / limit) * 100) : 0;

                    const kind: AlertKind =
                      limit > 0 && pct >= 100
                        ? "danger"
                        : limit > 0 && pct >= warnPct
                        ? "warning"
                        : "info";

                    return (
                      <div
                        key={r.category.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => goToCategory(r.category.id)}
                        onKeyDown={(e) => e.key === "Enter" && goToCategory(r.category.id)}
                        className="rounded-xl border border-white/10 bg-slate-950/30 p-3 cursor-pointer hover:bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-100">{r.category.name}</div>
                          <div className="text-xs text-slate-400">
                            {formatARS(spent)}
                            {limit > 0 ? ` / ${formatARS(limit)}` : ""}
                          </div>
                        </div>

                        <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                          <div
                            className={cx(
                              "h-2 rounded-full",
                              kind === "danger"
                                ? "bg-rose-500"
                                : kind === "warning"
                                ? "bg-amber-500"
                                : "bg-indigo-500"
                            )}
                            style={{ width: `${limit > 0 ? Math.min(100, pct) : 0}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {limit > 0
                              ? t("dashboard.labels.pctUsed", { pct: Math.round(pct) })
                              : t("dashboard.labels.noLimit")}
                          </span>

                          {limit > 0 && (
                            <span className={cx("rounded-lg border px-2 py-0.5", pillClasses(kind))}>
                              {kind === "danger"
                                ? t("dashboard.badges.exceeded")
                                : kind === "warning"
                                ? t("dashboard.badges.warning")
                                : t("dashboard.badges.ok")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title={t("dashboard.panels.budgetStatus")}>
              <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{t("dashboard.labels.totalMonthlyBudget")}</span>
                  <span className="text-slate-100 font-medium">
                    {budgetTotal > 0 ? formatARS(budgetTotal) : "—"}
                  </span>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className={cx("h-2 rounded-full", barClass)}
                    style={{ width: `${budgetTotal > 0 ? Math.min(100, budgetPct) : 0}%` }}
                  />
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  {budgetTotal > 0
                    ? t("dashboard.labels.budgetUsedWarnAt", {
                        used: Math.round(budgetPct),
                        warn: Math.round(warnPct),
                      })
                    : t("dashboard.hints.setBudgetInBudgets")}
                </div>
              </div>
            </Panel>

            <Panel title={t("dashboard.panels.goals")}>
              {activeGoals.length === 0 ? (
                <div className="text-sm text-slate-400">{t("dashboard.empty.noGoals")}</div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((g) => {
                    const pct =
                      g.targetAmount > 0
                        ? Math.min(100, (g.currentAmount / g.targetAmount) * 100)
                        : 0;
                    return (
                      <div
                        key={g.id}
                        className="rounded-xl border border-white/10 bg-slate-950/30 p-4"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-200">{g.name}</span>
                          <span className="text-slate-400">{Math.round(pct)}%</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {formatARS(g.currentAmount)} / {formatARS(g.targetAmount)}
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel title={t("dashboard.panels.alerts")}>
              {alerts.length === 0 ? (
                <div className="text-sm text-slate-400">{t("dashboard.empty.noAlerts")}</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a, idx) => (
                    <div
                      key={idx}
                      className={cx("rounded-xl border bg-slate-950/30 p-3", pillClasses(a.kind))}
                    >
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="mt-1 text-xs opacity-90">{a.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
