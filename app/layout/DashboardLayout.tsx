'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, Flame, Users, Menu, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  custom?: boolean
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, custom }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { path: '/dashboard/home', label: 'Home', icon: Home },
    { path: '/dashboard/learn', label: 'Learn', icon: BookOpen },
    { path: '/dashboard/buildup', label: 'Buildup', icon: Flame },
    { path: '/dashboard/community', label: 'Community', icon: Users },
      { path: '/dashboard/more', label: 'More', icon: Menu },
  ];

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <div className="flex h-screen bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="h-screen max-h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-[26px] pt-[44px] pb-[32px]">
                    <img src="/logo3.png" alt="logo" className="h-[44px] w-auto" />

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[26px] space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-[#FBF6FF] text-[#870BD6]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-[26px] pb-[44px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">AJ</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Amber James</p>
              <p className="text-xs text-gray-500">alison.e@rayna.ui</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${custom ? "" : "p-[70px] pt-[79px]"}`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;