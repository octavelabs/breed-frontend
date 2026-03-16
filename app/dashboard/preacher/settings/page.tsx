'use client';

import React from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';

const PreacherSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences here.</p>
      </div>
    </DashboardLayout>
  );
};

export default PreacherSettings;
