export function uid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    // Fallback simple
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
      