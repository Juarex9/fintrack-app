import React from "react";
import Topbar from "../app/layout/Topbar";
import { currentMonth } from "../libs/utils/dates";
import { useTranslation } from "react-i18next";

import { settingsStorage, type AppSettings } from "../libs/storage/settings.storage";
import { exportAllData, resetAllData } from "../libs/storage/appData";

function clampThreshold(n: number) {
  if (!Number.isFinite(n)) return 0.8;
  return Math.min(0.95, Math.max(0.1, n));
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = React.useState(currentMonth());

  const [settings, setSettings] = React.useState<AppSettings>(() => settingsStorage.get());
  const [status, setStatus] = React.useState<string>("");

  function save(next: AppSettings) {
    setSettings(next);
    settingsStorage.set(next);
    setStatus(t("settings.status.saved"));
    window.setTimeout(() => setStatus(""), 1500);
  }

  function onChangeLang(lang: "es" | "en") {
    i18n.changeLanguage(lang);
    save({ ...settings, language: lang });
  }

  function downloadJson() {
    const payload = exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        // Para hoy lo dejamos listo pero SIN importar automático hasta que tengamos replaceAll/reset en storages
        // Si ya querés habilitar import, decime y te paso los parches a los storages.
        console.log("import payload", parsed);
        alert(t("settings.data.importNotEnabled"));
      } catch {
        alert(t("settings.data.invalidFile"));
      }
    };
    reader.readAsText(file);
  }

  function confirmReset() {
    const ok = window.confirm(t("settings.data.confirmReset"));
    if (!ok) return;
    resetAllData();
    setSettings(settingsStorage.get());
    setStatus(t("settings.status.resetDone"));
    window.setTimeout(() => setStatus(""), 2000);
  }

  return (
    <>
      <Topbar title={t("nav.settings")} month={month} onMonthChange={setMonth} />

      <div className="p-6 space-y-6">
        {/* Status */}
        {status ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-3 text-sm text-slate-200">
            {status}
          </div>
        ) : null}

        {/* Preferences */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-100">{t("settings.preferences.title")}</h2>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Language */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">{t("settings.preferences.language")}</div>
              <select
                value={settings.language}
                onChange={(e) => onChangeLang(e.target.value as "es" | "en")}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="es">{t("settings.languages.es")}</option>
                <option value="en">{t("settings.languages.en")}</option>
              </select>
            </div>

            {/* Currency */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">{t("settings.preferences.currency")}</div>
              <select
                value={settings.currency}
                onChange={(e) => save({ ...settings, currency: e.target.value as any })}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
              <div className="mt-2 text-xs text-slate-500">{t("settings.preferences.currencyHint")}</div>
            </div>

            {/* Week starts */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">{t("settings.preferences.weekStartsOn")}</div>
              <select
                value={settings.weekStartsOn}
                onChange={(e) => save({ ...settings, weekStartsOn: e.target.value as any })}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="monday">{t("settings.week.monday")}</option>
                <option value="sunday">{t("settings.week.sunday")}</option>
              </select>
            </div>

            {/* Budget alerts */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">{t("settings.preferences.budgetAlerts")}</div>
                  <div className="mt-1 text-xs text-slate-500">{t("settings.preferences.budgetAlertsHint")}</div>
                </div>
                <button
                  onClick={() => save({ ...settings, budgetAlertsEnabled: !settings.budgetAlertsEnabled })}
                  className="h-9 rounded-xl bg-white/5 px-3 text-sm text-slate-100 hover:bg-white/10"
                >
                  {settings.budgetAlertsEnabled ? t("settings.toggle.on") : t("settings.toggle.off")}
                </button>
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-400">{t("settings.preferences.warningThreshold")}</div>
                <input
                  type="number"
                  step="0.05"
                  min={0.1}
                  max={0.95}
                  value={settings.budgetWarningThreshold}
                  onChange={(e) =>
                    save({ ...settings, budgetWarningThreshold: clampThreshold(Number(e.target.value)) })
                  }
                  className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  disabled={!settings.budgetAlertsEnabled}
                />
                <div className="mt-2 text-xs text-slate-500">
                  {t("settings.preferences.warnAt", { pct: Math.round(settings.budgetWarningThreshold * 100) })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/30">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-medium text-slate-100">{t("settings.data.title")}</h2>
            <p className="text-xs text-slate-400 mt-1">{t("settings.data.subtitle")}</p>
          </div>

          <div className="p-5 grid gap-3 md:grid-cols-3">
            <button
              onClick={downloadJson}
              className="h-10 rounded-xl bg-white/5 px-4 text-sm text-slate-100 hover:bg-white/10"
            >
              {t("settings.data.export")}
            </button>

            <label className="h-10 rounded-xl bg-white/5 px-4 text-sm text-slate-100 hover:bg-white/10 flex items-center justify-center cursor-pointer">
              {t("settings.data.import")}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              onClick={confirmReset}
              className="h-10 rounded-xl bg-rose-500/15 px-4 text-sm text-rose-200 hover:bg-rose-500/20 border border-rose-500/20"
            >
              {t("settings.data.resetAll")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
