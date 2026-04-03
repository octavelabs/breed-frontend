'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Tabs from '@/app/components/Tabs';
import { CreateCourseModal } from './components/CreateCourseModal';
import Button from '@/app/components/Button';
import { Plus } from 'lucide-react';
import CourseList from './components/CourseList';
import DevotionalList from './components/DevotionalList';
import { CreateDevotionalModal } from './components/CreateDevotionalModal';

const PreacherShowreel = () => {
  const [openModal, setOpenModal] = useState({
    course: false,
    devotional: false
  });
  const [activeTab, setActiveTab] = useState("courses");
  const tabs = [
    {
      label: "Courses",
      value: "courses",
      content: <CourseList setOpenModal={setOpenModal}/>,
    },
    {
      label: "Devotionals",
      value: "devotionals",
      content: <DevotionalList setOpenModal={setOpenModal} />,
    },
    // {
    //   label: "Sessions",
    //   value: "sessions",
    //   content: <SessionsList />,
    // },
   
  ];

  return (
    <DashboardLayout custom={true}>
      {openModal?.course && (
        <CreateCourseModal
          isOpen={openModal?.course}
          onClose={() => (setOpenModal(prev => ({...prev, course: false })))}
        />
      )}
        {openModal?.devotional && (
        <CreateDevotionalModal
          isOpen={openModal?.devotional}
          onClose={() => (setOpenModal(prev => ({...prev, devotional: false })))}
        />
      )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4  px-4 lg:px-10 pt-6 bg-white">
        <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">Showreel</h1>
        
      
      </div>

      {/* Tabs */}
      <div className="bg-white pt-[33px] ">
        <Tabs
          tabs={tabs}
          defaultTab={"courses"}
          onChange={setActiveTab}
          className="px-4 lg:px-10"
          customClass='!rounded-full'
          customButton={(activeTab) => (
            <Button
            customClass="hidden lg:block !w-fit px-6 !h-[48px] !text-white"
            type="button"
            onClick={() =>
              setOpenModal((prev) => ({
                ...prev,
                course: activeTab === 'courses',
                devotional: activeTab === 'devotionals',
              }))
            }
          >
            <p className="flex items-center gap-[6px] whitespace-nowrap">
              <Plus stroke="white" />
              {activeTab === 'devotionals' ? 'Create devotional' : 'Create course'}
            </p>
          </Button>
        )}/>
      </div>
       <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() =>
            setOpenModal((prev) => ({
              ...prev,
              course: activeTab === 'courses',
              devotional: activeTab === 'devotionals',
            }))
          }
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          <Plus stroke="white" />
        </button>
      </div>

    
    </DashboardLayout>
  );
};

export default PreacherShowreel;
