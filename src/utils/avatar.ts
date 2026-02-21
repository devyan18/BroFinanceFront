/**
 * Resolves avatar URL for display.
 * External URLs (https) are used as-is.
 * Internal paths (avatars/xxx.jpg) are resolved to the backend upload URL.
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
const UPLOAD_BASE = API_BASE.replace(/\/api\/v1\/?$/, "") || "http://localhost:4000";

export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${UPLOAD_BASE}/api/v1/uploads/${url}`;
}
