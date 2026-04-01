"use client";

import {
  ArrowLeft,
  Clock,
  MessageSquareText,
  User,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";

const CategoryDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();

  const courses = [
    {
      image: "/courseImage.jpg",
      id: "1",
      title: "Understanding Gods grace",
      date: "Apr 24, 2025",
      chapters: 3,
      lessons: 6,
      participants: 45,
      comments: 3,
    },
   {
      image: "/courseImage.jpg",
      id: "2",
      title: "Understanding Gods grace",
      date: "Apr 24, 2025",
      chapters: 3,
      lessons: 6,
      participants: 45,
      comments: 3,
    },
    {
      image: "/courseImage.jpg",
      id: "3",
      title: "Understanding Gods grace",
      date: "Apr 24, 2025",
      chapters: 3,
      lessons: 6,
      participants: 45,
      comments: 3,
    },
    {
      image: "/courseImage.jpg",
      id: "4",
      title: "Understanding Gods grace",
      date: "Apr 24, 2025",
      chapters: 3,
      lessons: 6,
      participants: 45,
      comments: 3,
    },
    {
      image: "/courseImage.jpg",
      id: "5",
      title: "Understanding Gods grace",
      date: "Apr 24, 2025",
      chapters: 3,
      lessons: 6,
      participants: 45,
      comments: 3,
    }


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

        <h1 className="text-[18px] md:text-[24px] lg:text-[32px] leading-none font-bold mb-8">
          Knowing Jesus
        </h1>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Link
              href={`/dashboard/learn/${id}/chapters/${course.id}`}
              key={index}
            >
              <div className="border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-[16px]">
                <div className="bg-gray-100  rounded-t-[16px] w-full p-[14px]">
                  {/* Image Section */}
                  <div className="relative bg-[#180426] rounded-[12px] h-[188px] overflow-hidden">
                    {course?.image ? (
                      <img
                        src={course?.image}
                        alt={course?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-b-[16px] px-4 py-[18px]">
                  <h3 className="text-sm font-semibold  mb-2 leading-tight line-clamp-2">
                    {course?.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm flex-wrap">
                    <span>{course?.date}</span>
                    <span>•</span>
                    <span>{course?.chapters} chapters</span>
                    <span>•</span>
                    <span>{course?.lessons} lessons</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-[5.57px]">
                      <UserRound size={20} strokeWidth={1.5} />
                      <span className="text-[15px] font-medium">
                        {course?.participants}
                      </span>
                    </div>
                    <div className="flex items-center gap-[5.57px]">
                      <MessageSquareText size={20} strokeWidth={1.5} />
                      <span className="text-[15px] font-medium">
                        {course?.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-sm lg:text-[20px] mb-[5.78px]">{course.title}</h3>
              <p className="text-[12px] lg:text-[18px] leading-tight text-[#60666B] mb-2 lg:mb-3">{course.description}</p>
              <div className='flex mb-2 lg:mb-3 items-center gap-2 text-[#60666B]'>
                <User className="w-4 h-4" />
                <p className='text-sm'>Chibuike Amadi</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#60666B]">
                <Clock className="w-4 h-4" />
                <span className='leading-none text-[#60666B]'>{course.duration} . {course.chapters}</span>
              </div>
            </div>
          </div> */}
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CategoryDetail;
