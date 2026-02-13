"use client"

import { ArrowLeft, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';

const CategoryDetail: React.FC = () => {
const router = useRouter();
const { id } = useParams();

  const courses = [
    {
      id: 1,
      title: 'Gentleness is Key',
      description: 'Lorem ipsum dolor sit amet consectetur. Magna urna ipsum',
      duration: '15mins',
      chapters: '4Chapters',
      image: '/courseImage.jpg',
    },
    {
      id: 2,
      title: 'Gentleness is Key',
      description: 'Lorem ipsum dolor sit amet consectetur. Magna urna ipsum',
      duration: '15mins',
      chapters: '4Chapters',
      image: '/courseImage.jpg',
    },
    {
      id: 3,
      title: 'Gentleness is Key',
      description: 'Lorem ipsum dolor sit amet consectetur. Magna urna ipsum',
      duration: '15mins',
      chapters: '4Chapters',
      image: '/courseImage.jpg',
    },
    {
      id: 4,
      title: 'Gentleness is Key',
      description: 'Lorem ipsum dolor sit amet consectetur. Magna urna ipsum',
      duration: '15mins',
      chapters: '4Chapters',
      image: '/courseImage.jpg',
    },
    {
      id: 5,
      title: 'Gentleness is Key',
      description: 'Lorem ipsum dolor sit amet consectetur. Magna urna ipsum',
      duration: '15mins',
      chapters: '4Chapters',
      image: '/courseImage.jpg',
    },
    {
      id: 6,
      title: 'Gentleness is Key',
      description: 'Lorem ipsum dolor sit amet consectetur. Magna urna ipsum',
      duration: '15mins',
      chapters: '4Chapters',
      image: '/courseImage.jpg',
    },
  ];

  return (
    <DashboardLayout>
    <div className="">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h1 className="text-[32px] leading-none font-bold mb-8">Knowing Jesus</h1>

      {/* Courses Grid */}
      <div className="grid grid-cols-3 gap-6">
        {courses.map((course, index) => (
            <Link href={`/dashboard/learn/${id}/chapters/${course.id}`} key={index}>
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-[20px] mb-[5.78px]">{course.title}</h3>
              <p className="text-[18px] leading-tight text-[#60666B] mb-3">{course.description}</p>
              <div className='flex mb-3 items-center gap-2 text-[#60666B]'>
                <User className="w-4 h-4" />
                <p className='text-sm'>Chibuike Amadi</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#60666B]">
                <Clock className="w-4 h-4" />
                <span className='leading-none text-[#60666B]'>{course.duration} . {course.chapters}</span>
              </div>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default CategoryDetail;