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
  // When true, main becomes a flex column with overflow-hidden instead of the default
  // scrollable container. Use this for pages (like community chat) that manage their
  // own scroll internally and must fill the viewport without a scroll gap.
  noScroll?: boolean;
  // When true, the mobile bottom nav is not rendered.
  hideNav?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, custom, customClass, noScroll, hideNav }) => {
  return (
    <UserProvider>
      <div className="block lg:flex min-h-screen bg-[#F8F9FC] dark:bg-[#121316]">
        <SideBar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <DashboardHeader />
          <main
            className={`flex-1 ${
              noScroll
                ? "flex flex-col overflow-hidden"
                : `pb-[96px] lg:pb-0 overflow-auto ${custom ? "" : "p-4 pt-6 lg:p-[35px] xl:p-[70px] lg:pt-[40px] xl:pt-[79px] relative"}`
            } ${customClass ?? ""}`}
          >
            {children}
          </main>
        </div>

        {!hideNav && <MobileNav />}

      </div>
    </UserProvider>
  );
};

export default DashboardLayout;