'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Tabs from '@/app/components/Tabs';
import TakeABreakModal from './components/TakeABreakModal';
import EmptyMentorshipState from './components/EmptyMentorshipState';
import DisciplesList from './components/DisciplesList';
import RequestsList from './components/RequestsList';
import { HelpCircle } from 'lucide-react';
import SessionsList from './components/sessionList';

const PreacherMentorship = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakDaysLeft, setBreakDaysLeft] = useState(12);

  // Placeholder components for other tabs
  const SessionsContent = () => (
    <div className="px-4 lg:px-12 py-8">
      <EmptyMentorshipState />
    </div>
  );

  const AssessmentsContent = () => (
    <div className="px-4 lg:px-12 py-8">
      <EmptyMentorshipState />
    </div>
  );

  const ReportsContent = () => (
    <div className="px-4 lg:px-12 py-8">
      <EmptyMentorshipState />
    </div>
  );

  const tabs = [
    {
      label: "Disciples",
      value: "disciples",
      content: <DisciplesList />,
    },
    {
      label: "Requests",
      value: "requests",
      content: <RequestsList />,
    },
    {
      label: "Sessions",
      value: "sessions",
      content: <SessionsList />,
    },
    {
      label: "Assessments",
      value: "assessments",
      content: <AssessmentsContent />,
    },
    {
      label: "Reports",
      value: "reports",
      content: <ReportsContent />,
    },
  ];


  return (
    <DashboardLayout custom={true}>
      {openModal && (
        <TakeABreakModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4  px-4 lg:px-10 pt-6 bg-white">
        <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">Mentorship</h1>
        
        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {isOnBreak && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#E2E3E5] rounded-full">
              <span className="text-sm font-medium text-purple-700">
                {breakDaysLeft} days left
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnBreak}
                  onChange={() => setIsOnBreak(!isOnBreak)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-purple-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          )}
          
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-3 px-4 py-[10px] bg-[#E2E3E5] border border-[#D2D9DF] rounded-full  transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-[#737D86]" />
            <span className="text-sm font-medium text-[#330750]">Take a break</span>
            {!isOnBreak && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnBreak}
                  onChange={() => setIsOnBreak(!isOnBreak)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#DCE4EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white pt-[33px] ">
        <Tabs tabs={tabs} defaultTab={"disciples"} className="px-4 lg:px-10" customClass='!rounded-full'/>
      </div>

      {/* Mobile Take a Break Button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          <span className="text-sm font-medium">Take a break</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default PreacherMentorship;
