/**
 * Chart preferences: which charts to show and which series in the comparative line chart.
 * Stored per user in localStorage.
 */

export type ChartId =
  | "dailyTotal"
  | "accumulated"
  | "byCategory"
  | "byUser"
  | "comparativeLines"
  | "pieDistribution";

export interface ComparativeSeriesOption {
  id: string;
  label: string;
  dataKey: string;
  color: string;
}

export interface ChartPreferences {
  visibleCharts: ChartId[];
  comparativeSeries: ComparativeSeriesOption[];
}

const STORAGE_KEY_PREFIX = "bro_chart_prefs_";
const DEFAULT_VISIBLE: ChartId[] = [
  "dailyTotal",
  "accumulated",
  "comparativeLines",
  "byCategory",
  "byUser",
  "pieDistribution",
];
const DEFAULT_COMPARATIVE: ComparativeSeriesOption[] = [
  { id: "total", label: "Total diario", dataKey: "total", color: "#7F00FF" },
];

export const CHART_COLORS = [
  "#7F00FF",
  "#0ECB81",
  "#F6465D",
  "#F0B90B",
  "#848E9C",
  "#9D00FF",
  "#03A66D",
  "#E84E4E",
];

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getChartPreferences(userId: string): ChartPreferences {
  if (!userId) return { visibleCharts: DEFAULT_VISIBLE, comparativeSeries: DEFAULT_COMPARATIVE };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { visibleCharts: DEFAULT_VISIBLE, comparativeSeries: DEFAULT_COMPARATIVE };
    const parsed = JSON.parse(raw) as ChartPreferences;
    return {
      visibleCharts: Array.isArray(parsed.visibleCharts) ? parsed.visibleCharts : DEFAULT_VISIBLE,
      comparativeSeries: Array.isArray(parsed.comparativeSeries) ? parsed.comparativeSeries : DEFAULT_COMPARATIVE,
    };
  } catch {
    return { visibleCharts: DEFAULT_VISIBLE, comparativeSeries: DEFAULT_COMPARATIVE };
  }
}

export function setChartPreferences(userId: string, prefs: ChartPreferences): void {
  if (!userId) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
