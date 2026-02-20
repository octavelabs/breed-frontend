import Tabs from '@/app/components/Tabs';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Link from 'next/link';
import React from 'react';


const Learn: React.FC = () => {




   const tabs = [
    { 
      label: 'Discover', 
      value: 'discover',
      content: <DiscoverCourses />
    },
    { 
      label: 'In progress', 
      value: 'inProgress',
      content: <DiscoverCourses />
    },
    { 
      label: 'Completed', 
      value: 'completed',
      content: <DiscoverCourses />
    },
  ];

  return (
    <DashboardLayout custom={true}>
      <div className="flex justify-start items-center pb-[27px] lg:pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF]">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold ">Learn</h1>
      </div>
    <div className="bg-white pt-5">
      <Tabs
        tabs={tabs} 
        defaultTab="discover"
        className="px-4 lg:px-12" 
      />
    </div>
    </DashboardLayout>
  );
};

const DiscoverCourses = () => {
    const categories = [
    {
      id: 1,
      title: 'Knowing Jesus',
      image: '/courseCategory3.png',
    },
    {
      id: 2,
      title: 'Salvation',
      image: '/courseCategory4.png',
    },
    {
      id: 3,
      title: 'Understand the Bible',
      image: '/courseCategory1.png',
    },
    {
      id: 4,
      title: 'Preaching the Word',
      image: '/courseCategory2.png',
    },
  ];

  return (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 border-t border-[#D2D9DF] p-4 lg:px-12 bg-[#F8F9FC] pt-6">
        {categories.map((category, index) => (
            <Link href={`/dashboard/learn/${category.id}`} key={index}>
          <div
            className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img
              src={category.image}
              alt={category.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <h3 className="absolute bottom-6 left-6 text-[24px] leading-none font-bold text-white">
              {category.title}
            </h3>
          </div>
          </Link>
        ))}
      </div>
  )
}

export default Learn;