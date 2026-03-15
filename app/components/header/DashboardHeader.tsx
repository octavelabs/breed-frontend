'use client';

import React from 'react';
import { Bell, HelpCircle } from 'lucide-react';
import { useUser } from '@/app/context/UserContext';

const DashboardHeader: React.FC = () => {
  const { userType, toggleUserType } = useUser();

  return (
    <header className="h-[72px] bg-white border-b border-gray-200 px-6 flex items-center justify-end gap-4">
      {/* Need Help Button */}
      <button className="flex items-center gap-2 text-[#870BD6] hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors">
        <HelpCircle className="w-5 h-5" />
        <span className="font-medium text-sm">Need Help?</span>
      </button>

      {/* Toggle Switch - Only visible for preachers */}
      {userType === 'preacher' && (
        <button
          onClick={toggleUserType}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
        >
          <span className="font-medium text-sm text-gray-700">Switch to Believer</span>
        </button>
      )}

      {/* Notification Bell */}
      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
        <Bell className="w-5 h-5 text-gray-600" />
        {/* Optional notification badge */}
        {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
      </button>

      {/* User Avatar */}
      <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-semibold text-sm">AA</span>
        </div>
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </header>
  );
};

export default DashboardHeader;
