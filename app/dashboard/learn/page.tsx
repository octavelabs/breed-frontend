import DashboardLayout from '@/app/layout/DashboardLayout';
import Link from 'next/link';
import React from 'react';


const Learn: React.FC = () => {


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
    <DashboardLayout>
    <div className="">
      <h1 className="text-[32px] leading-none font-bold mb-8">Learn</h1>

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

export default Learn;