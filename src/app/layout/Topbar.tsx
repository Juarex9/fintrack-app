import React from "react";
import { Plus } from "lucide-react";

type TopbarProps = {
  title: string;
  month: string;
  onMonthChange: (value: string) => void;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
};

export default function Topbar({
  title,
  month,
  onMonthChange,
  onPrimaryAction,
  primaryLabel = "New transaction",
}: TopbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/60 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-50">{title}</h1>
        <p className="text-sm text-slate-400">Track budgets, spending, and savings goals.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40 sm:w-40"
        />

        {onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <Plus size={16} />
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
