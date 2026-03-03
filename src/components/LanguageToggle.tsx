import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("es") ? "es" : "en";

  function setLang(lng: "en" | "es") {
    i18n.changeLanguage(lng);
    localStorage.setItem("fintrack.lang", lng);
  }

  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/40 p-1">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 text-xs rounded-lg ${
          current === "en" ? "bg-white/10 text-slate-50" : "text-slate-300 hover:bg-white/5"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("es")}
        className={`px-3 py-1.5 text-xs rounded-lg ${
          current === "es" ? "bg-white/10 text-slate-50" : "text-slate-300 hover:bg-white/5"
        }`}
      >
        ES
      </button>
    </div>
  );
}
