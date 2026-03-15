'use client';

import React from 'react';
import { useUser } from '../context/UserContext';

const TestUserToggle: React.FC = () => {
  const { userType, setUserType } = useUser();

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white border-2 border-purple-500 rounded-lg p-4 shadow-lg">
      <p className="text-sm font-semibold mb-2">Test Mode</p>
      <div className="flex gap-2">
        <button
          onClick={() => setUserType('believer')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            userType === 'believer'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Believer
        </button>
        <button
          onClick={() => setUserType('preacher')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            userType === 'preacher'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Preacher
        </button>
      </div>
    </div>
  );
};

export default TestUserToggle;
