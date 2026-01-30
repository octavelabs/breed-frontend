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
            <div className="max-w-7xl mx-auto">
      {/* Greeting */}
      <h1 className="text-4xl font-bold  mb-8">Good Morning, Bello</h1>

      {/* Consistency Tracker */}
      <div className="bg-white rounded-2xl px-[66px] py-[44px] mb-[64px] shadow-[0px_4px_4px_0px_#00000008]"
       style={{ 
                    // backgroundImage: `url('/dashboard-header.png')`,
                    // backgroundSize: 'cover',
                    // backgroundPosition: 'center'
                  }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold  mb-4">Consistency is Key</h2>
             <div className="flex gap-4">
          {weekDays.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                item.completed ? 'bg-purple-600' : 'bg-gray-200'
              }`}>
                <img src='./flame.svg' className={`w-6 h-6 ${item.completed ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <span className="text-sm font-medium text-gray-600">{item.day}</span>
            </div>
          ))}
        </div>
          </div>
         
          <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-[#D2D9DF]">
            <img src='./flame.svg' className="w-6 h-6" />
            <span className="text-2xl font-bold">5</span>
          </div>
        </div>
        
       
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Suggested Course */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Course</h3>
          <Link href='/dashboard/article/grace'>
          <div 
            className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">The Grace Story</p>
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Grace is God's response to our brokenness undeserved, yet freely given through Christ.
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>15mins . 4Chapters</span>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
                alt="Course"
                className="w-40 h-32 object-cover rounded-xl"
              />
            </div>
          </div>
          </Link>
        </div>

        {/* Say a Prayer Today */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Say a Prayer Today</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Personal Devotion</p>
                <p className="text-base font-semibold text-gray-900 mb-4">
                  Lord, help me to develop and sustain a consistent time of fellowship with You, no matter how busy life gets.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>4 - 5mins</span>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
                alt="Prayer"
                className="w-40 h-32 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <Link href="/dashboard/article/gratitude">
      <div 
        className="relative bg-gradient-to-br from-green-900 via-green-800 to-yellow-900 rounded-2xl p-8 shadow-lg cursor-pointer overflow-hidden h-64"
        
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10">
          <h2 className="text-[24px] font-bold text-white mb-4 l">Gratitude</h2>
          <p className="text-white/90 text-lg mb-6 max-w-3xl">
            Gratitude is a powerful expression of the heart that shifts our focus from what we lack to what 
            we've received. It cultivates contentment & deepens our awareness of God's goodness.
          </p>
          <button className="flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all">
            <span>Continue Reading</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      </Link>
    </div>
        </DashboardLayout>
    )
}

export default HomePage