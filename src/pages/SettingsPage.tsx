import React from "react";
import Topbar from "../app/layout/Topbar";

import { seedDemoData, resetAllData } from "../libs/demo/demoData";
import { currentMonth } from "../libs/utils/dates";

export default function SettingsPage() {
  // Topbar requiere month + onMonthChange
  const [month, setMonth] = React.useState(currentMonth());

  return (
    <>
      <Topbar title="Settings" month={month} onMonthChange={setMonth} />

      <div className="p-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
          <h2 className="text-sm font-medium text-slate-100">Demo tools</h2>
          <p className="mt-1 text-sm text-slate-400">
            Useful for portfolio demos: load sample data and reset everything.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => {
                const ok = confirm(
                  "Load demo data? This will ADD demo data to your current data."
                );
                if (!ok) return;
                seedDemoData();
                alert("Demo data loaded. Go to Dashboard.");
              }}
              className="h-10 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400"
            >
              Load demo data
            </button>

            <button
              onClick={() => {
                const ok = confirm(
                  "Reset ALL data? This will delete transactions, budgets, goals and categories."
                );
                if (!ok) return;
                resetAllData();
                alert("All data deleted.");
              }}
              className="h-10 rounded-xl bg-rose-500/90 px-4 text-sm font-medium text-white hover:bg-rose-500"
            >
              Reset all data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
