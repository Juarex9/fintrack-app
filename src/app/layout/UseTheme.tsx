import React from "react";
import { settingsStorage } from "../../libs/storage/settings.storage";

export function useThemeSync() {
  React.useEffect(() => {
    const s = settingsStorage.get();
    const root = document.documentElement;

    // aplica theme actual al cargar
    root.classList.toggle("dark", s.theme === "dark");

    // escucha cambios desde otras tabs/ventanas
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "fintrack.settings.v1") return;
      const next = settingsStorage.get();
      root.classList.toggle("dark", next.theme === "dark");
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}
