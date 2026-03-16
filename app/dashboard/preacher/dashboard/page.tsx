'use client';

import React from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';

const PreacherDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Preacher Dashboard</h1>
        <p className="text-gray-600">Welcome to your preacher dashboard. This is where you'll manage your ministry activities.</p>
      </div>
    </DashboardLayout>
  );
};

export default PreacherDashboard;
