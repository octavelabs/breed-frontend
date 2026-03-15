'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserType = 'believer' | 'preacher';

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<UserType>('believer');
  const router = useRouter();

  const toggleUserType = () => {
    setUserType(prev => prev === 'believer' ? 'preacher' : 'believer');
    router.push('/dashboard/home')
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
