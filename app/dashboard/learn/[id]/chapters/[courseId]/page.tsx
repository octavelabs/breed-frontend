"use client"

import React from 'react';

import { ArrowLeft, Clock, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Link from 'next/link';

const CourseDetail: React.FC = () => {
const router = useRouter();

  const chapters = [
    {
      id: 1,
      title: 'The Fall That Made Grace Necessary',
      description: 'When humanity chose disobedience, separation from God became our reality. But in our fall, grace was born not as a backup plan, but as God\'s loving response to bring us back.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
      hasButton: true,
    },
    {
      id: 2,
      title: 'Grace Found Me First',
      description: 'Before I ever reached for God, He reached for me. Grace came running when I was lost, undeserved yet freely given reminding me that salvation starts with Him, not me.',
      image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=200',
    },
    {
      id: 3,
      title: 'Saved by Grace, Not by Works',
      description: 'No effort, no achievement, no good deed could earn my salvation. It is grace alone God\'s gift through Christ that rescues and restores, leaving no room for pride, only praise.',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200',
    },
    {
      id: 4,
      title: 'Not by Works',
      description: 'It\'s not about what I can do or how hard I try. Grace isn\'t measured by performance but by promise. Grace cancels the pressure to earn God\'s love and reminds us it\'s already ours in Christ.',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200',
    },
  ];

  return (
    <DashboardLayout>
    <div className=" mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-[32px] leading-none font-bold mb-8">Greatness Is Key</h1>

      {/* Course Header */}
      <div className="flex gap-12 mb-10">
        <div className="flex-1 text-[#60666B] text-base w-1/2">
          <p className="mb-2 leading-relaxed">
            Greatness isn't just about success it's about rising to purpose. It's the quiet discipling, the faithful obedience, 
            and the courage to serve when no one's watching.
          </p>
          
          <p className="mb-4 leading-relaxed">
            True greatness in God's Kingdom starts with humility, grows through sacrifice, and shines in love. It's not the 
            spotlight that defines it, but the Spirit that fuels it.
          </p>
          
          <p className="mb-6 leading-relaxed">
            Greatness is key not to fame, but to fulfilling the call.
          </p>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>15mins . 4Chapters</span>
          </div>
        </div>

        {/* Course Image */}
        <div className="w-1/2 h-full max-h-[300px] rounded-2xl overflow-hidden">
          <img
            src="/courseImage.jpg"
            alt="Course"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Chapters List */}
      <div>
        <h2 className="text-[20px] font-bold mb-6 border-b border-[#D2D9DF]">Chapters</h2>
        
        <div className="flex flex-col gap-8">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="px-4">
              <div className="flex gap-4">
                <img
                  src={chapter.image}
                  alt={chapter.title}
                  className="w-[100px] h-[100px] rounded-lg object-cover"
                />
                <div>
                <div className="mb-3">
                  <p className="text-sm fot-semibold text-[#60666B] mb-1">Chapter {chapter.id}</p>
                  <h3 className="font-semibold mb-1">{chapter.title}</h3>
                  <p className="text-sm text-[#60666B]">{chapter.description}</p>
                </div>
                {chapter.hasButton && (
                  <Link href={`/dashboard/learn/materials/${chapter.id}`}>
                  <button className="flex mb-3 items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-6 py-2 rounded-full font-medium transition-colors">
                    <Play className="w-4 h-4" />
                    <span>Start Learning</span>
                  </button>
                  </Link>
                )}
                </div>

                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default CourseDetail;