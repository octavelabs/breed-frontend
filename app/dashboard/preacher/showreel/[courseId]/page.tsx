'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import CourseEditor from '../components/CourseEditor';
import Button from '@/app/components/Button';
import { Archive, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublishIcon from '@/app/assets/icons/publishIcon';

// Mock API function to fetch course data
const fetchCourseData = async (courseId: string) => {
  // This would be replaced with an actual API call
  return {
    id: courseId,
    title: 'Understanding God\'s grace',
    status: 'draft',
    chapters: [
      {
        id: '1',
        name: 'Explore the bible',
        lessons: [
          {
            id: '1',
            name: 'The Beginning',
            content: `<p>Gratitude is more than a momentary feeling, it's a perspective that transforms how we experience life and relate to God. It shifts our attention from what's lacking to what's already been given, reminding us that even in difficult seasons, there is always something to be thankful for.</p>
            <p>When we choose to give thanks, we're not denying hardship; rather, we're acknowledging God's goodness in the midst of it. Gratitude is a spiritual discipline that grounds us in trust that God is at work even when the path is unclear. It is the lens that brings clarity to our challenging circumstances.</p>
            <p>In Scripture, gratitude is not just encouraged it's commanded, because it opens the door to deeper communion with God. "Give thanks in all circumstances," Paul writes in 1 Thessalonians 5:18, "for this is God's will for you in Christ Jesus." This verse reminds us that thanksgiving isn't situational, it's spiritual.</p>
            <p>Whether in plenty or in lack, gratitude becomes a declaration of faith: that God is still good, still present, and still worthy of praise.</p>`,
            isValid: true,
          },
          {
            id: '2',
            name: 'The fall of man',
            content: '',
            isValid: false,
          },
          {
            id: '3',
            name: 'A new hope',
            content: '',
            isValid: false,
          },
          {
            id: '4',
            name: 'Kings & Judges',
            content: '',
            isValid: false,
          },
        ],
      },
      {
        id: '2',
        name: 'Explore the bible',
        lessons: [
          {
            id: '5',
            name: 'Lesson 1',
            content: '',
            isValid: false,
          },
          {
            id: '6',
            name: 'Lesson 2',
            content: '',
            isValid: false,
          },
          {
            id: '7',
            name: 'Lesson 3',
            content: '',
            isValid: false,
          },
          {
            id: '8',
            name: 'Lesson 4',
            content: '',
            isValid: false,
          },
        ],
      },
    ],
  };
};

const UpdateCourse = () => {
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

  const handleSaveDraft = (courseData: any) => {
    console.log('Saving draft:', courseData);
    // Here you would make an API call to save the draft
    // For now, we'll just update the local state
    setCourse(courseData);
    // Show a toast or notification
    alert('Draft saved successfully!');
  };

  const handlePublish = (courseData: any) => {
    console.log('Publishing course:', courseData);
    // Here you would make an API call to publish the course
    // This would change the status from 'draft' to 'live'
  };

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
     

      {/* Course Editor */}
      <div className="bg-white p-4 lg:p-10">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <CourseEditor
            initialCourse={course}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default UpdateCourse;
