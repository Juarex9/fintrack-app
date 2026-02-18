import type { Category } from "../../types/finance";
import { uid } from "../utils/id";

const KEY = "fintrack.categories.v1";

const SEED: Omit<Category, "id">[] = [
  { name: "Salary", kind: "income" },
  { name: "Freelance", kind: "income" },
  { name: "Other income", kind: "income" },

  { name: "Food", kind: "expense" },
  { name: "Rent", kind: "expense" },
  { name: "Transport", kind: "expense" },
  { name: "Bills", kind: "expense" },
  { name: "Health", kind: "expense" },
  { name: "Entertainment", kind: "expense" },
  { name: "Education", kind: "expense" },
  { name: "Other", kind: "expense" },
];

function read(): Category[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Category[];
  } catch {
    return [];
  }
}

function write(categories: Category[]) {
  localStorage.setItem(KEY, JSON.stringify(categories));
}

export const categoriesStorage = {
  ensureSeeded(): Category[] {
    const existing = read();
    if (existing.length > 0) return existing;
    const seeded: Category[] = SEED.map((c) => ({ id: uid(), ...c }));
    write(seeded);
    return seeded;
  },
  list(): Category[] {
    return this.ensureSeeded();
  },
  listByKind(kind: "income" | "expense"): Category[] {
    return this.list().filter((c) => c.kind === kind);
  },
};
