'use client';

import { useQuery } from '@tanstack/react-query';
import { userService } from '../api-services';
import type { User } from '../api-services';
import { useAuth } from '../../context/AuthContext';

export function useUser(): { user: User | null; isAuthenticated: boolean } {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
}

export function useUserStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getStats(),
    enabled: isAuthenticated,
  });
}
