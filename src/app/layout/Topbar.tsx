import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../../components/LanguageToggle";
import { Moon, Sun } from "lucide-react";
import { settingsStorage } from "../../libs/storage/settings.storage";


type TopbarProps = {
  title: string;

  // optional: pages like Settings may not need a month selector
  month?: string;
  onMonthChange?: (value: string) => void;

  onPrimaryAction?: () => void;
  primaryLabelKey?: string; // i18n key (recommended)
  primaryLabel?: string; // fallback
};

export default function Topbar({
  title,
  month,
  onMonthChange,
  onPrimaryAction,
  primaryLabelKey = "actions.newTransaction",
  primaryLabel,
}: TopbarProps) {
  const { t } = useTranslation();

  const showMonth = typeof month === "string" && typeof onMonthChange === "function";
  const [theme, setTheme] = React.useState<"dark" | "light">(() => {
    return settingsStorage.get().theme ?? "dark";
  });

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);

    settingsStorage.set({
      ...settingsStorage.get(),
      theme: next,
    });

    document.documentElement.classList.toggle("dark", next === "dark");
  }


  return (
    <div className="flex flex-col gap-3 border-b border-app bg-app px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-app">{title}</h1>
        <p className="text-sm text-muted">{t("topbar.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {showMonth && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{t("topbar.month")}</span>
            <input
              type="month"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-app bg-panel px-3 text-sm text-app outline-none focus:ring-2 focus:ring-indigo-500/40 sm:w-40"
            />
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-xl border border-app bg-panel flex items-center justify-center hover:bg-white/5"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <LanguageToggle />

        {onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <Plus size={16} />
            {primaryLabel ?? t(primaryLabelKey)}
          </button>
        )}
      </div>
    </div>
  );
}
