"use client"

import DashboardLayout from '@/app/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';


const PrayerBulletin: React.FC = () => {
const router = useRouter();

  const categories = [
    {
      id: 1,
      title: 'Personal Devotion',
      image: '/courseCategory3.png',
    },
    {
      id: 2,
      title: 'Intercession For The Nation',
      image: '/courseCategory4.png',
    },
    {
      id: 3,
      title: 'Health & Comfort',
      image: '/courseCategory1.png',
    },
    {
      id: 4,
      title: 'Thanksgiving & Testimonies',
      image: '/courseCategory2.png',
    },
  ];

  return (
    <DashboardLayout>
    <div className="">
        <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-5 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 text-[#60666B]" />
      </button>
      <h1 className="text-[32px] leading-none font-bold mb-8">Prayer Bulletin</h1>

      <div className="grid grid-cols-3 gap-6 xl:gap-8">
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
    </div>
    </DashboardLayout>
  );
};

export default PrayerBulletin;