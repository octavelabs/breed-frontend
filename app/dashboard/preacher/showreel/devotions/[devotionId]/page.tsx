'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Button from '@/app/components/Button';
import { Archive, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublishIcon from '@/app/assets/icons/publishIcon';
import Tabs from '@/app/components/Tabs';
import { fetchCourseData } from '@/utils/dummyData';
import DevotionContent from './components/DevotionContent';

// Mock API function to fetch course data


const tabs = [
    { 
      label: 'Content', 
      value: 'content',
      content: <DevotionContent />
    },
    { 
      label: 'Metrics', 
      value: 'metrics',
      content: <DevotionContent />
    },
    { 
      label: 'Comments', 
      value: 'comments',
      content: <DevotionContent />
    },
  ];

const UpdateDevotion = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await fetchCourseData(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);



  return (
    <DashboardLayout custom={true}>
      {/* Header */}
      <div className='bg-white'>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6">
        <div className="flex items-center gap-4">
          <Button
            customClass="!w-fit !px-3 !h-[40px] !bg-transparent"
            type="button"
            buttonType='custom'
            onClick={() => router.push('/dashboard/preacher/showreel')}
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">
            {loading ? 'Loading...' : course?.title}
          </h1>
        </div>
        <div className="flex gap-[18px]">
          <button className="w-10 h-10 flex justify-center items-center rounded-full border border-[#870BD6] bg-[#F3F4F6] text-[#6B7280]  transition-colors">
              <PublishIcon  />
            </button>
            <button className="w-10 h-10 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] text-[#6B7280]  transition-colors">
              <Archive className="w-[18px] h-[18px]" />
            </button>
            <button className="w-10 h-10 flex justify-center items-center rounded-full border border-[#FCA5A5] text-[#EF4444] bg-[#FFE4E4] transition-colors">
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>
      </div>
      <div className="bg-white pt-5">
      <Tabs
        tabs={tabs} 
        defaultTab="content"
        className="px-4 lg:px-12" 
        customClass='!rounded-full'
      />
    </div>


    
      </div>
    </DashboardLayout>
  );
};


export default UpdateDevotion;
