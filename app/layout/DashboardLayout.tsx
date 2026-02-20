'use client';

import React from 'react';
import SideBar, { MobileNav } from '../components/sidebar';


interface DashboardLayoutProps {
  children: React.ReactNode;
  custom?: boolean
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, custom }) => {


  return (
    <div className="block lg:flex h-screen bg-[#F8F9FC]">
      <SideBar />
      <main className={`w-screen lg:flex-1 pb-[68px] lg:mb-0 overflow-auto ${custom ? "" : "p-4 pt-6 lg:p-[35px] xl:p-[70px] lg:pt-[40px] xl:pt-[79px] relative"}`}>
        {children}
      </main>
      
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;