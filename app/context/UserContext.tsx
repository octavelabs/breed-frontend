'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type UserType = 'believer' | 'preacher';

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
}

const USER_TYPE_STORAGE_KEY = 'breed_user_type';
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<UserType>('believer');
  const router = useRouter();

  useEffect(() => {
    const storedUserType = window.localStorage.getItem(USER_TYPE_STORAGE_KEY);
    if (storedUserType === 'believer' || storedUserType === 'preacher') {
      setUserType(storedUserType);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(USER_TYPE_STORAGE_KEY, userType);
  }, [userType]);

  const toggleUserType = () => {
    setUserType((prev) => {
      const nextUserType: UserType = prev === 'believer' ? 'preacher' : 'believer';
      router.push(nextUserType === 'preacher' ? '/dashboard/preacher/dashboard' : '/dashboard/home');
      return nextUserType;
    });
  };

  return (
    <UserContext.Provider value={{ userType, setUserType, toggleUserType }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
