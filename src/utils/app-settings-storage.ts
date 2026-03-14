/**
 * Persistencia de configuración de app en localStorage (solo este dispositivo).
 */

import type { AppSettings } from "../types/app-settings";
import { DEFAULT_APP_SETTINGS } from "../types/app-settings";

const STORAGE_KEY = "appSettings";

export function getStoredAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme: parsed.theme === "light" ? "light" : DEFAULT_APP_SETTINGS.theme,
      language: typeof parsed.language === "string" ? parsed.language : DEFAULT_APP_SETTINGS.language,
    };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function setStoredAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
