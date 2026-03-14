import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AppSettings, ThemeMode } from "../types/app-settings";
import { getStoredAppSettings, setStoredAppSettings } from "../utils/app-settings-storage";

type AppSettingsContextType = {
  appSettings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: string) => void;
  updateAppSettings: (partial: Partial<AppSettings>) => void;
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  appSettings: { theme: "dark", language: "es" },
  setTheme: () => {},
  setLanguage: () => {},
  updateAppSettings: () => {},
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [appSettings, setAppSettings] = useState<AppSettings>(getStoredAppSettings);

  useEffect(() => {
    setStoredAppSettings(appSettings);
  }, [appSettings]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setAppSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: string) => {
    setAppSettings((prev) => ({ ...prev, language }));
  }, []);

  const updateAppSettings = useCallback((partial: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{ appSettings, setTheme, setLanguage, updateAppSettings }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
