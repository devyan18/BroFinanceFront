/**
 * Configuración de la app (solo dispositivo local).
 * No se sincroniza con el servidor. Expandible: idioma, tema, etc.
 */

export type ThemeMode = "dark" | "light";

export interface AppSettings {
  theme: ThemeMode;
  language: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: "dark",
  language: "es",
};
