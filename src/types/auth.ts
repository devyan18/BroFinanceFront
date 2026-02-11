// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
}

// User Type
export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  provider: string[];
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Auth Tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Auth Response
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
