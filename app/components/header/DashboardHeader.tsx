'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, ChevronDown, HelpCircle, LogOut, UserRound } from 'lucide-react';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/app/components/notifications/NotificationBell';
import Link from 'next/link';

const DashboardHeader: React.FC = () => {
  const { userType, toggleUserType } = useUser();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPreacherAccount = user?.role === 'PREACHER';

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <header className="h-18 bg-white border-b border-gray-200 px-6 flex items-center justify-between gap-4">
      {/* Logo — hidden on desktop where the sidebar already shows it */}
      <img src="/logo3.png" alt="Breed" className="h-8 w-auto lg:hidden" />

      {/* Right side controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={initials}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 bg-[#E7C8FF] rounded-full flex items-center justify-center">
                <span className="text-[#870BD6] font-semibold text-sm">{initials}</span>
              </div>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] border border-[#E3E8EF] z-50 overflow-hidden py-1">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#F0F2F4]">
                <p className="text-sm font-bold text-[#180426] truncate">
                  {user ? `${user.firstName} ${user.lastName}` : ''}
                </p>
                <p className="text-xs text-[#60666B] truncate">{user?.email}</p>
              </div>

              <Link
                href="/dashboard/more"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-[#180426] hover:bg-[#FAFBFC] transition-colors"
              >
                <UserRound size={16} className="text-[#60666B]" />
                Profile
              </Link>

              <a
                href="mailto:support@joinbreed.com"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-[#180426] hover:bg-[#FAFBFC] transition-colors"
              >
                <HelpCircle size={16} className="text-[#60666B]" />
                Need Help?
              </a>

              {/* Toggle view — only for preacher accounts */}
              {isPreacherAccount && (
                <button
                  onClick={() => { setDropdownOpen(false); toggleUserType(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#180426] hover:bg-[#FAFBFC] transition-colors"
                >
                  <ArrowLeftRight size={16} className="text-[#60666B]" />
                  {userType === 'preacher' ? 'Switch to Believer' : 'Switch to Preacher'}
                </button>
              )}

              <div className="border-t border-[#F0F2F4] mt-1">
                <button
                  onClick={async () => { setDropdownOpen(false); await logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
