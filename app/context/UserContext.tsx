'use client';

/**
 * UserContext — backward-compatibility shim.
 *
 * All components that previously imported `useUser` or `UserProvider` from
 * this file continue to work unchanged.  The actual auth state now lives in
 * `context/AuthContext.tsx`; this file re-exports what those consumers need.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// ── Legacy context shape ──────────────────────────────────────────────────────

type UserType = 'believer' | 'preacher';

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * `UserProvider` is kept so that `DashboardLayout` (and any other tree that
 * wraps it) still compiles without changes.  It reads `userType` from the real
 * `AuthContext` and provides toggle / setUserType helpers that navigate just
 * like the old implementation did.
 */
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userType: authUserType } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Derive current userType from the URL (same logic as before) but fall back
  // to the authenticated role.
  const urlDerivedType: UserType =
    pathname.startsWith('/dashboard/preacher') || pathname.startsWith('/dashboard/admin')
      ? 'preacher'
      : 'believer';

  const userType: UserType = urlDerivedType ?? authUserType;

  const setUserType = useCallback(
    (type: UserType) => {
      if (type === 'preacher') {
        router.push('/dashboard/preacher/dashboard');
      } else {
        router.push('/dashboard/home');
      }
    },
    [router],
  );

  const toggleUserType = useCallback(() => {
    if (userType === 'believer') {
      router.push('/dashboard/preacher/dashboard');
    } else {
      router.push('/dashboard/home');
    }
  }, [userType, router]);

  return (
    <UserContext.Provider value={{ userType, setUserType, toggleUserType }}>
      {children}
    </UserContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
