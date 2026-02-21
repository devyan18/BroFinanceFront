/**
 * BroFinance API Service
 *
 * This file contains all API endpoints for the BroFinance application.
 * Based on the BroFinance API documentation.
 */

import { apiClient } from "../utils/api";
import type {
  ApiResponse,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import type {
  Compra,
  TipoCompra,
  Roommate,
  CreateCompraInput,
  CreateCompraBatchInput,
  UpdateCompraInput,
  ComprasPagination,
  BalanceData,
} from "../types/compras";

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Register a new user
   * POST /auth/local/sign-up
   */
  signUp: async (
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>(
      "/auth/local/sign-up",
      credentials,
      false,
    );
  },

  /**
   * Sign in with email and password
   * POST /auth/local/sign-in
   */
  signIn: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>(
      "/auth/local/sign-in",
      credentials,
      false,
    );
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get<{ user: User }>("/auth/me");
  },

  /**
   * Sign out current user
   * POST /auth/sign-out
   */
  signOut: async (): Promise<ApiResponse<null>> => {
    return apiClient.post<null>("/auth/sign-out", {});
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    return apiClient.post<{ accessToken: string }>("/auth/refresh", {});
  },

  /**
   * Google OAuth callback
   * POST /auth/google/callback
   * Exchanges Google authorization code for tokens
   */
  googleCallback: async (code: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>(
      "/auth/google/callback",
      { code },
      false,
    );
  },

  /**
   * Update profile (username, cbu, avatarUrl, showCbu, showEmail)
   * PATCH /auth/profile
   */
  updateProfile: async (data: {
    username?: string;
    cbu?: string;
    avatarUrl?: string;
    showCbu?: boolean;
    showEmail?: boolean;
  }): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.patch<{ user: User }>("/auth/profile", data);
  },

  /**
   * Get public profile of another user
   * GET /auth/profile/:id
   */
  getUserPublic: async (userId: string): Promise<ApiResponse<{ user: Partial<User> }>> => {
    return apiClient.get<{ user: Partial<User> }>(`/auth/profile/${userId}`);
  },

  /**
   * Upload avatar image
   * POST /auth/avatar (multipart/form-data, field: avatar)
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ user: User; avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.postFormData<{ user: User; avatarUrl: string }>("/auth/avatar", formData);
  },
};

/**
 * Compras (purchases/expenses) API endpoints
 */
export interface ComprasQuery {
  page?: number;
  limit?: number;
  sort?: "createdAt" | "montoTotal" | "montoDeudor";
  order?: "asc" | "desc";
  tipo?: string;
  usuario?: string;
}

export const comprasApi = {
  getAll: async (
    page = 1,
    limit = 10,
    query?: Partial<ComprasQuery>
  ): Promise<
    ApiResponse<Compra[]> & { pagination?: ComprasPagination }
  > => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (query?.sort) params.set("sort", query.sort);
    if (query?.order) params.set("order", query.order);
    if (query?.tipo) params.set("tipo", query.tipo);
    if (query?.usuario) params.set("usuario", query.usuario);
    return apiClient.get<Compra[]>(
      `/compras?${params.toString()}`
    ) as Promise<ApiResponse<Compra[]> & { pagination?: ComprasPagination }>;
  },

  getById: async (id: string): Promise<ApiResponse<Compra>> => {
    return apiClient.get<Compra>(`/compras/${id}`);
  },

  getTipos: async (): Promise<ApiResponse<TipoCompra[]>> => {
    return apiClient.get<TipoCompra[]>(`/compras/tipos`);
  },

  getUsuarios: async (): Promise<ApiResponse<Roommate[]>> => {
    return apiClient.get<Roommate[]>(`/compras/usuarios`);
  },

  getRoommates: async (): Promise<ApiResponse<Roommate[]>> => {
    return apiClient.get<Roommate[]>(`/compras/roommates`);
  },

  getBalance: async (
    roommateId: string
  ): Promise<ApiResponse<BalanceData>> => {
    return apiClient.get<BalanceData>(`/compras/balance/${roommateId}`);
  },

  create: async (
    data: CreateCompraInput
  ): Promise<ApiResponse<Compra>> => {
    return apiClient.post<Compra>(`/compras`, data);
  },

  createBatch: async (
    data: CreateCompraBatchInput
  ): Promise<ApiResponse<Compra[]>> => {
    return apiClient.post<Compra[]>(`/compras/batch`, data);
  },

  update: async (
    id: string,
    data: UpdateCompraInput
  ): Promise<ApiResponse<Compra>> => {
    return apiClient.patch<Compra>(`/compras/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/compras/${id}`);
  },

  accept: async (id: string): Promise<ApiResponse<Compra>> => {
    return apiClient.patch<Compra>(`/compras/${id}/accept`, {});
  },

  requestPayment: async (id: string): Promise<ApiResponse<Compra>> => {
    return apiClient.patch<Compra>(`/compras/${id}/request-payment`, {});
  },

  confirmPayment: async (id: string): Promise<ApiResponse<Compra>> => {
    return apiClient.patch<Compra>(`/compras/${id}/confirm-payment`, {});
  },

  rejectPayment: async (id: string): Promise<ApiResponse<Compra>> => {
    return apiClient.patch<Compra>(`/compras/${id}/reject-payment`, {});
  },

  reject: async (id: string): Promise<ApiResponse<Compra>> => {
    return apiClient.patch<Compra>(`/compras/${id}/reject`, {});
  },
};

/**
 * Friends API - Friend requests and friendships
 */
export interface Friend {
  id: string;
  username: string;
  avatarUrl?: string;
  email?: string;
}

export interface FriendRequest {
  id: string;
  user: { _id: string; username: string; avatarUrl?: string };
  createdAt: string;
}

export interface FriendsRequestsData {
  sent: FriendRequest[];
  received: FriendRequest[];
}

export interface SearchUser {
  id: string;
  username: string;
  avatarUrl?: string;
  email?: string;
}

export type FriendStatus = "self" | "friend" | "pending_sent" | "pending_received" | "none";

export const friendsApi = {
  getFriends: async (): Promise<ApiResponse<Friend[]>> => {
    return apiClient.get<Friend[]>(`/friends`);
  },

  getRequests: async (): Promise<ApiResponse<FriendsRequestsData>> => {
    return apiClient.get<FriendsRequestsData>(`/friends/requests`);
  },

  getStatus: async (userId: string): Promise<ApiResponse<{ status: FriendStatus; requestId?: string }>> => {
    return apiClient.get<{ status: FriendStatus; requestId?: string }>(`/friends/status/${userId}`);
  },

  searchUsers: async (q: string, limit = 20): Promise<ApiResponse<SearchUser[]>> => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return apiClient.get<SearchUser[]>(`/friends/search?${params.toString()}`);
  },

  sendRequest: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(`/friends/request`, { userId });
  },

  acceptRequest: async (requestId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.patch<{ message: string }>(`/friends/requests/${requestId}/accept`, {});
  },

  rejectRequest: async (requestId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.patch<{ message: string }>(`/friends/requests/${requestId}/reject`, {});
  },

  removeFriend: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/friends/${userId}`);
  },
};

/**
 * Payments API - Transfer info (CBU + monto) for debt settlement
 */
export interface TransferInfoInput {
  acreedorId: string;
  compraIds?: string[];
}

export interface TransferInfoResponse {
  cbu: string;
  monto: number;
  descripcion: string;
  acreedorUsername: string;
}

export const paymentsApi = {
  getTransferInfo: async (
    data: TransferInfoInput
  ): Promise<ApiResponse<TransferInfoResponse>> => {
    return apiClient.post<TransferInfoResponse>(
      "/payments/transfer-info",
      data
    );
  },
};

/**
 * Health check endpoint
 */
export const healthApi = {
  /**
   * Check server health
   * GET /health
   */
  check: async (): Promise<
    ApiResponse<{ message: string; timestamp: string }>
  > => {
    return apiClient.get<{ message: string; timestamp: string }>(
      "/health",
      false,
    );
  },
};

// Export all APIs
export default {
  auth: authApi,
  compras: comprasApi,
  friends: friendsApi,
  payments: paymentsApi,
  health: healthApi,
};
