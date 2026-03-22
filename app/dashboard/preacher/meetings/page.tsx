'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Tabs from '@/app/components/Tabs';


import AllMeetingsList from './components/AllMeetings';
import { CreateCommunityMeetingModal } from './components/CreateCommunityMeetingModal';
import { CreateOpenMeetingModal } from './components/CreateOpenMeetingModal';
import { CommunityMeeting } from './components/CommunityMeeting';
import { OpenMeeting } from './components/OpenMeetings';
import DraftRecordings from './components/DraftRecordings';
import PublishedRecordings from './components/PublishedRecording';

const PreacherMeetings = () => {
  const [openModal, setOpenModal] = useState({
      community: false,
      open: false
    });


  const tabs = [
    {
      label: "All",
      value: "all",
      content: <AllMeetingsList setOpenModal={setOpenModal}/>,
    },
    {
      label: "Community",
      value: "community",
      content: <CommunityMeeting setOpenModal={setOpenModal}/>,
    },
    {
      label: "Open",
      value: "open",
      content: <OpenMeeting setOpenModal={setOpenModal} />,
    },
    {
      label: "Draft recordings",
      value: "draft recordings",
      content: <DraftRecordings />,
    },
    {
      label: "Published recordings",
      value: "published recordings",
      content: <PublishedRecordings />,
    },
  ];


  return (
    <DashboardLayout custom={true}>
      {openModal?.community && (
             <CreateCommunityMeetingModal
               isOpen={openModal?.community}
               onClose={() => (setOpenModal(prev => ({...prev, community: false })))}
             />
           )}
             {openModal?.open && (
             <CreateOpenMeetingModal
               isOpen={openModal?.open}
               onClose={() => (setOpenModal(prev => ({...prev, open: false })))}
             />
           )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4  px-4 lg:px-10 pt-6 bg-white">
        <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">Meetings</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white py-[33px] ">
        <Tabs tabs={tabs} defaultTab={"all"} className="px-4 lg:px-10" customClass='!rounded-full'/>
      </div>


    </DashboardLayout>
  );
};

export default PreacherMeetings;
