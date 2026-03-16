// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
}

// User wallet (one CBU per provider)
export interface UserWallet {
  _id: string;
  providerKey: string;
  name: string;
  color: string;
  cbu: string;
  darkFont?: boolean;
}

// User Type
export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  provider: string[];
  balance: number;
  cbu?: string;
  showCbu?: boolean;
  showEmail?: boolean;
  wallets?: UserWallet[];
  favoriteWalletId?: string | null;
  notifyNewChargesEmail?: boolean;
  notifyNewChargesPush?: boolean;
  needsPasswordSetup?: boolean;
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
  identifier: string; // email or username
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
