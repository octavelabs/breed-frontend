'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Tabs from '@/app/components/Tabs';
import TakeABreakModal from './components/TakeABreakModal';
import DisciplesList from './components/DisciplesList';
import RequestsList from './components/RequestsList';
import { HelpCircle } from 'lucide-react';
import { SessionCalendar } from './components/SessionCalendar';
import AssessmentList from './components/AssessmentList';
import ReportList from './components/ReportList';
import AvailabilitySettings from './components/AvailabilitySettings';
import { mentorshipService } from '@/lib/api-services';

const PreacherMentorship = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakDaysLeft, setBreakDaysLeft] = useState(0);
  const [discipleRefreshSignal, setDiscipleRefreshSignal] = useState(0);

  useEffect(() => {
    mentorshipService.getMentorProfile()
      .then((profile: any) => {
        setIsOnBreak(profile?.isOnBreak ?? false);
        if (profile?.breakEndsAt) {
          const days = Math.ceil((new Date(profile.breakEndsAt).getTime() - Date.now()) / 86400000);
          setBreakDaysLeft(Math.max(0, days));
        }
      })
      .catch(() => {});
  }, []);


  const tabs = [
    {
      label: "Mentees",
      value: "disciples",
      content: <DisciplesList refreshSignal={discipleRefreshSignal} />,
    },
    {
      label: "Requests",
      value: "requests",
      content: <RequestsList onRequestHandled={() => setDiscipleRefreshSignal((n) => n + 1)} />,
    },
    {
      label: "Sessions",
      value: "sessions",
      content: (
        <div className="mx-4 lg:mx-10 pb-6">
          <SessionCalendar refreshSignal={discipleRefreshSignal} />
        </div>
      ),
    },
    {
      label: "Assessments",
      value: "assessments",
      content: <AssessmentList />,
    },
    {
      label: "Reports",
      value: "reports",
      content: <ReportList />,
    },
    {
      label: "Availability",
      value: "availability",
      content: <AvailabilitySettings />,
    },
  ];


  return (
    <DashboardLayout custom={true}>
      {openModal && (
        <TakeABreakModal
          isOpen={openModal}
          isCurrentlyOnBreak={isOnBreak}
          onClose={(refreshNeeded) => {
            setOpenModal(false);
            if (refreshNeeded) {
              mentorshipService.getMentorProfile()
                .then((profile: any) => {
                  setIsOnBreak(profile?.isOnBreak ?? false);
                  if (profile?.breakEndsAt) {
                    const days = Math.ceil((new Date(profile.breakEndsAt).getTime() - Date.now()) / 86400000);
                    setBreakDaysLeft(Math.max(0, days));
                  } else {
                    setBreakDaysLeft(0);
                  }
                })
                .catch(() => {});
            }
          }}
        />
      )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4  px-4 lg:px-10 pt-6 bg-white">
        <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">Mentorship</h1>
        
        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {isOnBreak && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F5EBFF] border border-[#D4A8F0] rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#870BD6] shrink-0" />
              <span className="text-sm font-medium text-[#5B26B1]">
                On Break{breakDaysLeft > 0 ? ` · ${breakDaysLeft}d left` : ''}
              </span>
            </div>
          )}

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-3 px-4 py-2.5 bg-[#E2E3E5] border border-[#D2D9DF] rounded-full transition-colors hover:bg-[#D8DADC]"
          >
            <HelpCircle className="w-5 h-5 text-[#737D86]" />
            <span className="text-sm font-medium text-[#330750]">{isOnBreak ? 'End Break' : 'Take a break'}</span>
            {!isOnBreak && (
              <div className="w-11 h-6 bg-[#DCE4EB] rounded-full relative pointer-events-none">
                <div className="absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white pt-8 ">
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
