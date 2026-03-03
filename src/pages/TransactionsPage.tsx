import React from "react";
import Topbar from "../app/layout/Topbar";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { transactionsStorage } from "../libs/storage/transactions.storage";
import { categoriesStorage } from "../libs/storage/categories.storage";

import { currentMonth, currentISODate } from "../libs/utils/dates";
import { formatARS } from "../libs/utils/currency";
import { uid } from "../libs/utils/id";

import type { Transaction, TxType } from "../types/finance";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type FormValues = {
  type: "income" | "expense";
  amount: number;
  date: string;
  categoryId: string;
  note?: string;
};

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function includesQ(text: string | undefined, q: string) {
  if (!q) return true;
  const t = (text ?? "").toLowerCase();
  return t.includes(q.toLowerCase());
}

function cmp(sort: SortKey) {
  switch (sort) {
    case "date_asc":
      return (a: Transaction, b: Transaction) => a.date.localeCompare(b.date);
    case "amount_desc":
      return (a: Transaction, b: Transaction) => b.amount - a.amount;
    case "amount_asc":
      return (a: Transaction, b: Transaction) => a.amount - b.amount;
    case "date_desc":
    default:
      return (a: Transaction, b: Transaction) => b.date.localeCompare(a.date);
  }
}

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // schema needs t(), so define inside component
  const schema = React.useMemo(
    () =>
      z.object({
        type: z.enum(["income", "expense"]),
        amount: z.coerce.number().positive(t("transactions.form.errors.amountPositive")),
        date: z.string().min(10, t("transactions.form.errors.invalidDate")),
        categoryId: z.string().min(1, t("transactions.form.errors.pickCategory")),
        note: z.string().max(120, t("transactions.form.errors.noteTooLong")).optional(),
      }),
    [t]
  );

  // --- Read from URL
  const initialMonth = searchParams.get("month") ?? currentMonth();
  const initialType = (searchParams.get("type") as TxType | null) ?? null;
  const initialCategory = searchParams.get("category") ?? null;

  const initialQ = searchParams.get("q") ?? "";
  const initialSort = (searchParams.get("sort") as SortKey | null) ?? "date_desc";
  const initialFrom = searchParams.get("from") ?? ""; // YYYY-MM-DD
  const initialTo = searchParams.get("to") ?? ""; // YYYY-MM-DD

  const [month, setMonth] = React.useState(initialMonth);
  const [typeFilter, setTypeFilter] = React.useState<TxType | "all">(initialType ?? "all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>(initialCategory ?? "all");

  const [q, setQ] = React.useState(initialQ);
  const [sort, setSort] = React.useState<SortKey>(initialSort);
  const [from, setFrom] = React.useState(initialFrom);
  const [to, setTo] = React.useState(initialTo);

  const [items, setItems] = React.useState<Transaction[]>(() => transactionsStorage.list());

  React.useEffect(() => {
    categoriesStorage.ensureSeeded?.();
  }, []);

  // --- Sync filters -> URL
  React.useEffect(() => {
    const next = new URLSearchParams(searchParams);

    next.set("month", month);

    if (typeFilter === "all") next.delete("type");
    else next.set("type", typeFilter);

    if (categoryFilter === "all") next.delete("category");
    else next.set("category", categoryFilter);

    if (!q) next.delete("q");
    else next.set("q", q);

    if (!sort || sort === "date_desc") next.delete("sort");
    else next.set("sort", sort);

    if (!from) next.delete("from");
    else next.set("from", from);

    if (!to) next.delete("to");
    else next.set("to", to);

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, typeFilter, categoryFilter, q, sort, from, to]);

  const { register, handleSubmit, watch, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: 1,
      date: currentISODate(),
      categoryId: "",
      note: "",
    },
    mode: "onSubmit",
  });

  const type = watch("type");

  const categoriesForForm = React.useMemo(() => {
    const all = categoriesStorage.list();
    return all.filter((c) => c.kind === type);
  }, [type]);

  function refresh() {
    setItems(transactionsStorage.list());
  }

  const onSubmit = (data: FormValues) => {
    const tx: Transaction = {
      id: uid(),
      type: data.type as TxType,
      amount: Number(data.amount),
      date: data.date,
      categoryId: data.categoryId,
      note: data.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    transactionsStorage.create(tx);
    refresh();

    reset({
      type: data.type,
      amount: 1,
      date: data.date,
      categoryId: "",
      note: "",
    });
  };

  const categoryOptions = React.useMemo(() => {
    return categoriesStorage
      .list()
      .filter((c) => (typeFilter === "all" ? true : c.kind === typeFilter));
  }, [typeFilter]);

  const filtered = React.useMemo(() => {
    const arr = items
      .filter((t) => t.date.startsWith(month))
      .filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
      .filter((t) => (categoryFilter === "all" ? true : t.categoryId === categoryFilter))
      .filter((t) => includesQ(t.note, q));

    // Optional date range inside month
    const arr2 = arr
      .filter((t) => (!from ? true : t.date >= from))
      .filter((t) => (!to ? true : t.date <= to));

    return [...arr2].sort(cmp(sort));
  }, [items, month, typeFilter, categoryFilter, q, sort, from, to]);

  function clearFilters() {
    setTypeFilter("all");
    setCategoryFilter("all");
    setQ("");
    setSort("date_desc");
    setFrom("");
    setTo("");
  }

  return (
    <>
      <Topbar title={t("nav.transactions")} month={month} onMonthChange={setMonth} />

      <div className="p-6 space-y-6">
        {/* FORM */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-100">
              {t("transactions.form.title")}
            </h2>
            <div className="text-xs text-slate-400">LocalStorage</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">{t("transactions.form.type")}</label>
              <select
                {...register("type")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="expense">{t("transactions.types.expense")}</option>
                <option value="income">{t("transactions.types.income")}</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-slate-400">{t("transactions.form.amount")}</label>
              <input
                type="number"
                step="1"
                {...register("amount")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {formState.errors.amount && (
                <p className="mt-1 text-xs text-rose-400">{formState.errors.amount.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-slate-400">{t("transactions.form.date")}</label>
              <input
                type="date"
                {...register("date")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {formState.errors.date && (
                <p className="mt-1 text-xs text-rose-400">{formState.errors.date.message}</p>
              )}
            </div>

            <div className="md:col-span-4">
              <label className="text-xs text-slate-400">{t("transactions.form.category")}</label>
              <select
                {...register("categoryId")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">{t("transactions.form.selectPlaceholder")}</option>
                {categoriesForForm.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {formState.errors.categoryId && (
                <p className="mt-1 text-xs text-rose-400">{formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="md:col-span-10">
              <label className="text-xs text-slate-400">{t("transactions.form.noteOptional")}</label>
              <input
                {...register("note")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder={t("transactions.form.notePlaceholder")}
              />
              {formState.errors.note && (
                <p className="mt-1 text-xs text-rose-400">{formState.errors.note.message}</p>
              )}
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="h-10 w-full rounded-xl bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {t("actions.save")}
              </button>
            </div>
          </form>
        </div>

        {/* LIST + FILTERS */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30">
          {/* Filters header */}
          <div className="px-5 py-3 border-b border-white/10 flex flex-col gap-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm font-medium text-slate-100">
                {t("transactions.list.title", { count: filtered.length })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={refresh}
                  className="h-9 rounded-xl bg-white/5 px-3 text-sm text-slate-100 hover:bg-white/10"
                >
                  {t("actions.refresh")}
                </button>
                <button
                  onClick={clearFilters}
                  className="h-9 rounded-xl bg-white/5 px-3 text-sm text-slate-100 hover:bg-white/10"
                >
                  {t("actions.clear")}
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-12">
              {/* q */}
              <div className="md:col-span-4">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("transactions.filters.searchPlaceholder")}
                  className="h-9 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none"
                />
              </div>

              {/* type */}
              <div className="md:col-span-2">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setTypeFilter(next);
                    setCategoryFilter("all");
                  }}
                  className="h-9 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none"
                >
                  <option value="all">{t("transactions.filters.all")}</option>
                  <option value="expense">{t("transactions.filters.expenses")}</option>
                  <option value="income">{t("transactions.filters.income")}</option>
                </select>
              </div>

              {/* category */}
              <div className="md:col-span-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none"
                >
                  <option value="all">{t("transactions.filters.allCategories")}</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* sort */}
              <div className="md:col-span-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-9 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none"
                >
                  <option value="date_desc">{t("transactions.sort.dateDesc")}</option>
                  <option value="date_asc">{t("transactions.sort.dateAsc")}</option>
                  <option value="amount_desc">{t("transactions.sort.amountDesc")}</option>
                  <option value="amount_asc">{t("transactions.sort.amountAsc")}</option>
                </select>
              </div>

              {/* from/to */}
              <div className="md:col-span-3">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-9 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none"
                  title={t("transactions.filters.from")}
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-9 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-100 outline-none"
                  title={t("transactions.filters.to")}
                />
              </div>
            </div>
          </div>

          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">{t("transactions.empty")}</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {filtered.map((tx) => (
                  <li key={tx.id} className="flex items-center gap-3 px-3 py-3">
                    <div
                      className={cx(
                        "h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold",
                        tx.type === "income"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      )}
                      title={tx.type === "income" ? t("transactions.types.income") : t("transactions.types.expense")}
                    >
                      {tx.type === "income" ? "+" : "-"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm text-slate-100">
                          {tx.note || t("transactions.item.defaultTitle")}
                        </div>
                        <div className="text-sm font-medium text-slate-50">
                          {formatARS(tx.amount)}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{tx.date}</span>
                        <span className="truncate">
                          {categoriesStorage
                            .list()
                            .find((c) => c.id === tx.categoryId)?.name ?? "—"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        transactionsStorage.remove(tx.id);
                        refresh();
                      }}
                      className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    >
                      {t("actions.delete")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
