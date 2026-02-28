import type { ApiResponse } from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// Token management
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const removeTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): unknown => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user: unknown): void => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// API Client
export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication headers if required
    if (includeAuth) {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      if (refreshToken) {
        headers["x-refresh-token"] = `Bearer ${refreshToken}`;
      }
    }

    // Merge custom headers if provided
    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.assign(headers, customHeaders);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check for new access token in response headers
    const newAccessToken = response.headers.get("x-new-access-token");
    if (newAccessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    }

    const data: ApiResponse<T> = await response.json();

    // Handle errors
    if (!response.ok) {
      // If 401, clear tokens and redirect to login
      if (response.status === 401) {
        removeTokens();
      }
      const errMsg = data.error || `HTTP ${response.status}`;
      const err = new Error(errMsg) as Error & { errors?: Array<{ path: string; message: string }> };
      if (data.errors?.length) err.errors = data.errors;
      throw err;
    }

    return data;
  },

  async get<T>(endpoint: string, includeAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" }, includeAuth);
  },

  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth,
    );
  },

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    includeAuth = true,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    if (includeAuth) {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (refreshToken) headers["x-refresh-token"] = `Bearer ${refreshToken}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers,
    });
    const newAccessToken = response.headers.get("x-new-access-token");
    if (newAccessToken) setTokens(newAccessToken, getRefreshToken() ?? "");
    const data: ApiResponse<T> = await response.json();
    if (!response.ok) {
      if (response.status === 401) removeTokens();
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  },

  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth,
    );
  },

  async patch<T>(
    endpoint: string,
    data?: unknown,
    includeAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth,
    );
  },

  async delete<T>(
    endpoint: string,
    includeAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, includeAuth);
  },
};

export { API_BASE_URL };
