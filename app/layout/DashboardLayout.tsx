'use client';

import React from 'react';
import SideBar, { MobileNav } from '../components/sidebar';
import DashboardHeader from '../components/header/DashboardHeader';
import { UserProvider } from '../context/UserContext';
import TestUserToggle from '../components/TestUserToggle';


interface DashboardLayoutProps {
  children: React.ReactNode;
  custom?: boolean;
  customClass?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, custom, customClass }) => {


  return (
    <UserProvider>
      <div className="block lg:flex min-h-screen bg-[#F8F9FC]">
        <SideBar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <DashboardHeader />
          <main className={`flex-1 pb-[68px] lg:pb-0 overflow-auto ${custom ? "" : "p-4 pt-6 lg:p-[35px] xl:p-[70px] lg:pt-[40px] xl:pt-[79px] relative"} ${customClass}`}>
            {children}
          </main>
        </div>
        
        <MobileNav />
        {/* Test toggle - remove in production */}
        <TestUserToggle />
      </div>
    </UserProvider>
  );
};

export default DashboardLayout;