'use client';

import Tabs from '@/app/components/Tabs';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { courseService } from '@/lib/api-services';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';


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

const fallbackCategories = [
  {
    id: '1',
    name: 'Knowing Jesus',
    slug: 'knowing-jesus',
    image: '/courseCategory3.png',
  },
  {
    id: '2',
    name: 'Salvation',
    slug: 'salvation',
    image: '/courseCategory4.png',
  },
  {
    id: '3',
    name: 'Understand the Bible',
    slug: 'understand-the-bible',
    image: '/courseCategory1.png',
  },
  {
    id: '4',
    name: 'Preaching the Word',
    slug: 'preaching-the-word',
    image: '/courseCategory2.png',
  },
];

const categoryImages = [
  '/courseCategory3.png',
  '/courseCategory4.png',
  '/courseCategory1.png',
  '/courseCategory2.png',
];

const DiscoverCourses = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await courseService.getCategories();
        const data = (result as any)?.data ?? result;
        const items = Array.isArray(data) ? data : [];
        setCategories(items.length > 0 ? items : fallbackCategories);
      } catch {
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 border-t border-[#D2D9DF] p-4 lg:px-12 bg-[#F8F9FC] pt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative h-48 rounded-2xl overflow-hidden animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="border-t border-[#D2D9DF] p-4 lg:px-12 bg-[#F8F9FC] pt-6">
        <p className="text-gray-500 text-sm">No categories available.</p>
      </div>
    );
  }

  return (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 border-t border-[#D2D9DF] p-4 lg:px-12 bg-[#F8F9FC] pt-6">
        {categories.map((category, index) => (
            <Link href={`/dashboard/learn/${category.slug ?? category.id}`} key={category.id ?? index}>
          <div
            className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img
              src={category.image ?? categoryImages[index % categoryImages.length]}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <h3 className="absolute bottom-6 left-6 text-[24px] leading-none font-bold text-white">
              {category.name}
            </h3>
          </div>
          </Link>
        ))}
      </div>
  );
};

export default Learn;
