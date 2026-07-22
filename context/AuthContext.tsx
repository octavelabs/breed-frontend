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
import { REFERRAL_STORAGE_KEY } from '../app/providers';
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
    redirectUrl?: string,
  ) => Promise<void>;
  loginWithGoogle: (idToken: string, redirectUrl?: string) => Promise<void>;
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

      let fetchedUser: User | null = null;
      try {
        fetchedUser = await authService.me<User>();
      } catch {
        // First attempt failed — wait 2 s and retry once. This absorbs the
        // window where iOS wakes up the app but the network isn't ready yet.
        try {
          await new Promise<void>((r) => setTimeout(r, 2000));
          fetchedUser = await authService.me<User>();
        } catch {
          // Both attempts failed — token is genuinely invalid or server error.
          clearTokens();
          clearLoggedInCookie();
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      setUser(fetchedUser);
      setSessionCookies(fetchedUser!.role);
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  // ── Apply theme and track OS-level changes when set to "system" ──────────────
  useEffect(() => {
    const theme = user?.preferences?.theme ?? 'system';
    const html = document.documentElement;

    if (theme !== 'system') {
      html.setAttribute('data-theme', theme);
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => html.setAttribute('data-theme', mq.matches ? 'dark' : 'light');

    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [user?.preferences?.theme]);

  // ── Apply text size whenever user preferences change ─────────────────────────
  useEffect(() => {
    const textSize = user?.preferences?.textSize ?? 'medium';
    const scale = textSize === 'small' ? '0.875' : textSize === 'large' ? '1.125' : '1';
    document.documentElement.style.setProperty('--breed-text-scale', scale);
  }, [user?.preferences?.textSize]);

  // ── Derived state ────────────────────────────────────────────────────────────

  const isAuthenticated = user !== null;

  const PREACHER_ROLES = ['PREACHER', 'ADMIN', 'SUPER_ADMIN'];
  const userType: 'believer' | 'preacher' =
    PREACHER_ROLES.includes(user?.role ?? '') ? 'preacher' : 'believer';

  // ── Actions ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (
      emailOrUsername: string,
      password: string,
      rememberMe = false,
      redirectUrl?: string,
    ): Promise<void> => {
      const response = await authService.login<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>({ emailOrUsername, password, rememberMe });

      setTokens(response.accessToken, response.refreshToken);
      setSessionCookies(response.user.role);
      setUser(response.user);

      const isPreachers = ['PREACHER', 'ADMIN', 'SUPER_ADMIN'].includes(response.user.role);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (isPreachers) {
        router.push('/dashboard/preacher/dashboard');
      } else {
        router.push('/dashboard/home');
      }
    },
    [router],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string, redirectUrl?: string): Promise<void> => {
      const refCode = localStorage.getItem(REFERRAL_STORAGE_KEY) ?? undefined;
      const response = await authService.googleLogin<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>(idToken, refCode);
      if (refCode) localStorage.removeItem(REFERRAL_STORAGE_KEY);

      setTokens(response.accessToken, response.refreshToken);
      setSessionCookies(response.user.role);
      setUser(response.user);

      const isPreachers = ['PREACHER', 'ADMIN', 'SUPER_ADMIN'].includes(response.user.role);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (isPreachers) {
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
    loginWithGoogle,
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
