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
  health: healthApi,
};
