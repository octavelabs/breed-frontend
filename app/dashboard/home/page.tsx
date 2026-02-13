import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout"
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";


const HomePage = () => {

     const weekDays = [
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
    { day: 'F', completed: false },
    { day: 'S', completed: false },
    { day: 'S', completed: true },
  ];

    return (
        <DashboardLayout>
            <div className="mx-auto">
      {/* Greeting */}
      <h1 className="text-[32px] font-bold  mb-8">Good Morning, Bello</h1>

      {/* Consistency Tracker */}
      <div style={{ backgroundImage: `url('/dashboard-header.png')` }} className="rounded-2xl">
      <div className="bg-white/90 rounded-2xl px-[66px] py-[44px] mb-[64px] shadow-[0px_4px_4px_0px_#00000008] relative z-20">
       
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold  mb-4">Consistency is Key</h2>
             <div className="flex gap-4">
          {weekDays.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <FlameIcon />
              <span className="text-sm font-medium text-gray-600">{item.day}</span>
            </div>
          ))}
        </div>
          </div>
         
          <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-[#D2D9DF] bg-white">
            <FlameIcon size={38} />
            <span className="text-2xl font-bold">5</span>
          </div>
        </div>
        
       </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Suggested Course */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Course</h3>
          <Link href='/dashboard/learn'>
          <div 
            className="bg-white rounded-2xl px-[28px] py-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            
          >
            <div className="flex gap-10 items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">The Grace Story</p>
                <p className="text-base font-bold text-gray-900 leading-none mb-4">
                  Grace is God's response to our brokenness undeserved, yet freely given through Christ.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>15mins . 4Chapters</span>
                </div>
              </div>
              <img
                src="/home-dashboard.jpg"
                alt="Course"
                className="w-[173px] h-[171px] object-cover rounded-[20px]"
              />
            </div>
          </div>
          </Link>

        </div>

        {/* Say a Prayer Today */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Say a Prayer Today</h3>
          <Link href='/dashboard/buildup'>
          <div className="bg-white rounded-2xl px-[28px] py-4 shadow-sm">
            <div className="flex gap-10 items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Personal Devotion</p>
                <p className="text-base font-bold text-gray-900 leading-none mb-4">
                  Lord, help me to develop and sustain a consistent time of fellowship with You, no matter how busy life gets.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>4 - 5mins</span>
                </div>
              </div>
              <img
                src="/DailyEdification2.png"
                alt="Prayer"
                className="w-[173px] h-[171px] object-cover rounded-[20px]"
              />
            </div>
          </div>
          </Link>
        </div>
      </div>

      {/* Featured Article */}
      
      <div 
        className="relative rounded-2xl px-[30px] py-[75px] shadow-lg cursor-pointer overflow-hidden h-64"
        style={{
          backgroundImage: `url('/dashboard-gratitude.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
        }}
      >
        <div className="text-white">
          <h2 className="text-[24px] font-bold mb-1 leading-none">Gratitude</h2>
          <p className=" text-[20px] mb-4">
            Gratitude is a powerful expression of the heart that shifts our focus from what we lack to what 
            we've received. It cultivates contentment & deepens our awareness of God's goodness.
          </p>
          <Link href="/dashboard/home/article">
          <button className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
            <span className="text-[20px] leading-none">Continue Reading</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          </Link>
        </div>
      </div>
      
    </div>
        </DashboardLayout>
    )
}

export default HomePage