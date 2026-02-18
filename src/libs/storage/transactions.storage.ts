import type { Transaction } from "../../types/finance";

const KEY = "fintrack.transactions.v1";

function read(): Transaction[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

function write(items: Transaction[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const transactionsStorage = {
  list(): Transaction[] {
    return read().sort((a, b) => b.date.localeCompare(a.date));
  },
  create(tx: Transaction): void {
    const items = read();
    items.push(tx);
    write(items);
  },
  remove(id: string): void {
    const items = read().filter((t) => t.id !== id);
    write(items);
  },
  clear(): void {
    write([]);
  },
};
