import type { Goal } from "../../types/finance";

const KEY = "fintrack.goals.v1";

function read(): Goal[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Goal[];
  } catch {
    return [];
  }
}

function write(items: Goal[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const goalsStorage = {
  list(): Goal[] {
    return read().sort((a, b) =>
      String(b?.createdAt ?? "").localeCompare(String(a?.createdAt ?? ""))
    );
  },
  
  create(goal: Goal): void {
    const items = read();
    items.push(goal);
    write(items);
  },
  update(goal: Goal): void {
    const items = read().map((g) => (g.id === goal.id ? goal : g));
    write(items);
  },
  remove(id: string): void {
    write(read().filter((g) => g.id !== id));
  },
};
