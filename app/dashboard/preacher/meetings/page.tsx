'use client';

import React from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';

const PreacherMeetings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-600">Schedule and manage your meetings here.</p>
      </div>
    </DashboardLayout>
  );
};

export default PreacherMeetings;
