import React from "react";
import Topbar from "../app/layout/Topbar";
import { currentMonth } from "../libs/utils/dates";
import { formatARS } from "../libs/utils/currency";
import { uid } from "../libs/utils/id";
import { goalsStorage } from "../libs/storage/goal.storage";
import type { Goal } from "../types/finance";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name too short"),
  targetAmount: z.coerce.number().positive("Target must be > 0"),
  currentAmount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type FormValues = z.infer<typeof schema>;

function progressPct(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
}

export default function GoalsPage() {
  const [month, setMonth] = React.useState(currentMonth());
  const [goals, setGoals] = React.useState<Goal[]>(() => goalsStorage.list());

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
      priority: "medium",
    },
  });

  function refresh() {
    setGoals(goalsStorage.list());
  }

  const onSubmit = (data: FormValues) => {
    const g: Goal = {
      id: uid(),
      name: data.name.trim(),
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      deadline: data.deadline?.trim() || undefined,
      priority: data.priority,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const goal: Goal = {
      id: uid(),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      deadline: data.deadline || "",
      priority: data.priority,
      status: "active", // si tu type lo tiene
      createdAt: new Date().toISOString(),   // <-- CLAVE
    };
    goalsStorage.create(goal);    
  };

  function updateGoal(goal: Goal) {
    goalsStorage.update(goal);
    refresh();
  }

  return (
    <>
      <Topbar title="Goals" month={month} onMonthChange={setMonth} />

      <div className="p-6 space-y-6">
        {/* Create goal */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-100">Create savings goal</h2>
            <div className="text-xs text-slate-400">Local only (today)</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="text-xs text-slate-400">Name</label>
              <input
                {...register("name")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Emergency fund, Trip, New laptop..."
              />
              {formState.errors.name && (
                <p className="mt-1 text-xs text-rose-400">{formState.errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-slate-400">Target</label>
              <input
                type="number"
                {...register("targetAmount")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {formState.errors.targetAmount && (
                <p className="mt-1 text-xs text-rose-400">{formState.errors.targetAmount.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Current</label>
              <input
                type="number"
                {...register("currentAmount")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Priority</label>
              <select
                {...register("priority")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="md:col-span-10">
              <label className="text-xs text-slate-400">Deadline (optional)</label>
              <input
                type="date"
                {...register("deadline")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="h-10 w-full rounded-xl bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                Add goal
              </button>
            </div>
          </form>
        </div>

        {/* Goals list */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-medium text-slate-100">Your goals ({goals.length})</h2>
          </div>

          <div className="p-4 space-y-3">
            {goals.length === 0 ? (
              <div className="text-sm text-slate-400">No goals yet.</div>
            ) : (
              goals.map((g) => {
                const pct = progressPct(g);
                const done = g.status === "done";
                return (
                  <div
                    key={g.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-slate-100 truncate">
                            {g.name}
                          </div>
                          <span className="text-xs rounded-lg px-2 py-1 bg-white/5 text-slate-300">
                            {g.priority}
                          </span>
                          {done && (
                            <span className="text-xs rounded-lg px-2 py-1 bg-emerald-500/15 text-emerald-300">
                              done
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {formatARS(g.currentAmount)} / {formatARS(g.targetAmount)}
                          {g.deadline ? ` • deadline ${g.deadline}` : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={g.currentAmount}
                          onChange={(e) =>
                            updateGoal({ ...g, currentAmount: Math.max(0, Number(e.target.value)) })
                          }
                          className="h-9 w-32 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                        <button
                          onClick={() =>
                            updateGoal({ ...g, status: g.status === "done" ? "active" : "done" })
                          }
                          className="h-9 rounded-xl bg-white/5 px-3 text-sm text-slate-100 hover:bg-white/10"
                        >
                          {g.status === "done" ? "Reopen" : "Mark done"}
                        </button>
                        <button
                          onClick={() => {
                            goalsStorage.remove(g.id);
                            refresh();
                          }}
                          className="h-9 rounded-xl px-3 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{Math.round(pct)}% complete</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
