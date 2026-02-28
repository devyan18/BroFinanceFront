import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  apiClient,
  getAccessToken,
  getStoredUser,
  setTokens,
  setStoredUser,
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
  setPassword: (username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User | null) => void;
  refreshUser: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: true,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  loginWithGoogle: () => Promise.resolve(),
  setPassword: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateUser: () => {},
  refreshUser: () => Promise.resolve(false),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const hasVerifiedRef = useRef(false);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    setStoredUser(newUser);
  };

  const refreshUser = async (): Promise<boolean> => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      removeTokens();
      setUser(null);
      return false;
    }
    try {
      const response = await apiClient.get<{ user: User }>("/auth/me");
      if (response.success && response.data) {
        updateUser(response.data.user);
        return true;
      } else {
        removeTokens();
        setUser(null);
        return false;
      }
    } catch {
      removeTokens();
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const stored = getStoredUser() as User | null;
    if (stored && typeof stored === "object" && stored._id) {
      setUser(stored);
      setIsLoading(false);
    }

    refreshUser().then((ok) => {
      if (!ok && stored) setUser(null);
      setIsLoading(false);
    });
  }, []);

  const login = async ({ identifier, password }: LoginCredentials) => {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/local/sign-in",
        { identifier, password },
        false,
      );

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens in localStorage
        setTokens(tokens.accessToken, tokens.refreshToken);
        updateUser(user);
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
        updateUser(user);
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
        updateUser(user);
      } else {
        throw new Error(response.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const setPassword = async (username: string, password: string, confirmPassword: string) => {
    const response = await apiClient.patch<{ user: User }>("/auth/set-password", {
      username,
      password,
      confirmPassword,
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || "Error al configurar la contraseña");
    }
    updateUser(response.data.user);
  };

  const logout = async () => {
    try {
      // Call /auth/sign-out endpoint
      await apiClient.post("/auth/sign-out", {});
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      removeTokens();
      updateUser(null);
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
        setPassword,
        logout,
        updateUser,
        refreshUser,
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
