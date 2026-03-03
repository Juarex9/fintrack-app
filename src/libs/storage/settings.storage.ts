export type AppSettings = {
    language: "es" | "en";
    currency: "ARS" | "USD";
    weekStartsOn: "monday" | "sunday";
    budgetAlertsEnabled: boolean;
    budgetWarningThreshold: number;
    theme: "dark" | "light";
  };
  
  const DEFAULTS: AppSettings = {
    language: "es",
    currency: "ARS",
    weekStartsOn: "monday",
    budgetAlertsEnabled: true,
    budgetWarningThreshold: 0.8,
    theme: "dark", 
  };
  
  const KEY = "fintrack.settings.v1";

  function read(): AppSettings {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    try {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        ...DEFAULTS,
        ...parsed,
        budgetWarningThreshold:
          typeof parsed.budgetWarningThreshold === "number"
            ? Math.min(0.95, Math.max(0.1, parsed.budgetWarningThreshold))
            : DEFAULTS.budgetWarningThreshold,
      };
    } catch {
      return DEFAULTS;
    }
  }
  
  function write(next: AppSettings) {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  
  export const settingsStorage = {
    get(): AppSettings {
      return read();
    },
    set(next: AppSettings) {
      write(next);
    },
    reset() {
      write(DEFAULTS);
    },
  };
  