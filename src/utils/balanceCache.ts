/**
 * Local cache for bilateral balances (per roommate).
 * Used to show balances immediately on load; real values are fetched in background.
 */

import type { BalanceData } from "../types/compras";

const STORAGE_KEY_PREFIX = "bro_balances_";

export type CachedBalance = Pick<BalanceData, "balance" | "totalACobrar" | "totalAPagar" | "estado"> & {
  updatedAt: string;
};

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getBalancesCache(userId: string): Record<string, CachedBalance> {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CachedBalance>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function setBalancesCache(
  userId: string,
  data: BalanceData[]
): void {
  if (!userId || !Array.isArray(data)) return;
  try {
    const map: Record<string, CachedBalance> = {};
    const now = new Date().toISOString();
    for (const b of data) {
      map[b.roommateId] = {
        balance: b.balance,
        totalACobrar: b.totalACobrar,
        totalAPagar: b.totalAPagar,
        estado: b.estado,
        updatedAt: now,
      };
    }
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch {
    // ignore
  }
}
