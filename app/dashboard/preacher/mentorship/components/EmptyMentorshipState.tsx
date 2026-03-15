'use client';

import React from 'react';
import { Users } from 'lucide-react';

const EmptyMentorshipState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        {/* Icon Group */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center relative z-10">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        {/* Speech bubbles */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <div className="flex flex-col gap-1">
            <div className="w-6 h-1 bg-gray-300 rounded"></div>
            <div className="w-4 h-1 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <div className="text-2xl">👍</div>
        </div>
      </div>
      
      <p className="text-gray-600 text-center max-w-md">
        You haven't accepted any requests for mentorship yet
      </p>
    </div>
  );
};

export default EmptyMentorshipState;
