import { createContext, useContext, useState, useEffect } from "react";
import {
  apiClient,
  getAccessToken,
  setTokens,
  removeTokens,
} from "../utils/api";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth";

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: (authorizationCode: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: true,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  loginWithGoogle: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  verifyAuth: () => Promise.resolve(false),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Verify authentication by calling the API with the stored token
  const verifyAuth = async (): Promise<boolean> => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      // Call /auth/me endpoint to verify token and get user data
      const response = await apiClient.get<{ user: User }>("/auth/me");

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsLoading(false);
        return true;
      } else {
        removeTokens();
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      removeTokens();
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    verifyAuth();
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      // Call /auth/local/sign-in endpoint
      const response = await apiClient.post<AuthResponse>(
        "/auth/local/sign-in",
        { email, password },
        false, // Don't include auth headers for login
      );

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens in localStorage
        setTokens(tokens.accessToken, tokens.refreshToken);

        // Store user data
        localStorage.setItem("user", JSON.stringify(user));

        // Set user state
        setUser(user);
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async ({
    username,
    email,
    password,
  }: RegisterCredentials) => {
    try {
      // Call /auth/local/sign-up endpoint
      const response = await apiClient.post<AuthResponse>(
        "/auth/local/sign-up",
        { username, email, password },
        false, // Don't include auth headers for registration
      );

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens in localStorage
        setTokens(tokens.accessToken, tokens.refreshToken);

        // Store user data
        localStorage.setItem("user", JSON.stringify(user));

        // Set user state
        setUser(user);
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (authorizationCode: string) => {
    try {
      // Send the authorization code to the backend
      // The backend will exchange it for tokens with Google
      const response = await apiClient.post<AuthResponse>(
        "/auth/google/callback",
        { code: authorizationCode },
        false, // Don't include auth headers for Google login
      );

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens in localStorage
        setTokens(tokens.accessToken, tokens.refreshToken);

        // Store user data
        localStorage.setItem("user", JSON.stringify(user));

        // Set user state
        setUser(user);
      } else {
        throw new Error(response.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call /auth/sign-out endpoint
      await apiClient.post("/auth/sign-out", {});
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local storage and state
      removeTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        verifyAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
