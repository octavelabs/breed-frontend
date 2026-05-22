'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../lib/api-services';
import type { User } from '../lib/api-services';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../lib/api';

// ── Cookie helpers (middleware-readable) ──────────────────────────────────────

const LOGGED_IN_COOKIE = 'breed_logged_in';
const ROLE_COOKIE = 'breed_user_role';

function setSessionCookies(role: string): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${LOGGED_IN_COOKIE}=true; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

function clearSessionCookies(): void {
  if (typeof document === 'undefined') return;
  const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `${LOGGED_IN_COOKIE}=; path=/; expires=${past}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; path=/; expires=${past}; SameSite=Lax`;
}

const clearLoggedInCookie = clearSessionCookies;

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userType: 'believer' | 'preacher';
  login: (
    emailOrUsername: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ── Bootstrap: validate token on mount ──────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedUser = await authService.me<User>();
        setUser(fetchedUser);
        setSessionCookies(fetchedUser.role);
      } catch {
        // Token is invalid / expired and refresh already failed inside the
        // interceptor, so just clear everything here.
        clearTokens();
        clearLoggedInCookie();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────

  const isAuthenticated = user !== null;

  const userType: 'believer' | 'preacher' =
    user?.role === 'PREACHER' ? 'preacher' : 'believer';

  // ── Actions ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (
      emailOrUsername: string,
      password: string,
      rememberMe = false,
    ): Promise<void> => {
      // The response interceptor unwraps response.data, so the resolved value
      // IS the login payload directly.
      const response = await authService.login<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>({ emailOrUsername, password, rememberMe });

      setTokens(response.accessToken, response.refreshToken);
      setSessionCookies(response.user.role);
      setUser(response.user);

      if (response.user.role === 'PREACHER') {
        router.push('/dashboard/preacher/dashboard');
      } else {
        router.push('/dashboard/home');
      }
    },
    [router],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = getRefreshToken();
      await authService.logout(refreshToken ?? undefined);
    } catch {
      // Swallow — we still want to clear local state even if the server call fails
    } finally {
      clearTokens();
      clearLoggedInCookie();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const fetchedUser = await authService.me<User>();
      setUser(fetchedUser);
    } catch {
      clearTokens();
      clearLoggedInCookie();
      setUser(null);
    }
  }, []);

  // ── Context value ────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    userType,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/** Backward-compatible hook for components that only need the userType string. */
export function useUserType(): 'believer' | 'preacher' {
  const { userType } = useAuth();
  return userType;
}
