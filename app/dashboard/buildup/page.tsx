import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout"
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";


const HomePage = () => {
    return (
        <DashboardLayout>
            <div className="mx-auto">
      <h1 className="text-[32px] leading-none font-bold mb-8">Build Up</h1>
<h3 className="text-xl font-bold text-gray-900 mb-2">For Today</h3>
      <div 
        className="relative rounded-2xl px-[30px] py-[75px] shadow-lg cursor-pointer overflow-hidden h-64"
        style={{
          backgroundImage: `url('/dashboard-gratitude.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
        }}
      >
        <div className="text-white">
          <h2 className="text-[24px] font-bold mb-1 leading-none">Strength to Endure: A Prayer for Perseverance</h2>
          <p className=" text-[20px] mb-4">
            Lord, grant me the strength and steadfast spirit to persevere through trials, not giving up in the face of delay, difficulty, or discouragement. 
          </p>
        
          <button className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
            <span className="text-[20px] leading-none">James 1:12 (NIV)</span>
            <ChevronRight className="w-5 h-5" />
          </button>
       
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-[48px]">
        {/* Suggested Course */}
        <div>
         
          <Link href='/dashboard/buildup/prayerBulletin'>
          <div 
            className="bg-white rounded-2xl px-[28px] py-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            
          >
            <div className="flex gap-10 items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Prayer Bulletin</p>
                <p className="text-base leading-none font-bold">
                  Your Prayer Bulletin is here filled with focused prayer points, scriptures, and spiritual prompts to guide your prayer time.
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
                alt="Course"
                className="w-[173px] h-[171px] object-cover rounded-[20px]"
              />
            </div>
          </div>
          </Link>
        </div>

        {/* Say a Prayer Today */}
        <div>
          <Link href='/dashboard/buildup/mentorshipHub'>
          <div className="bg-white rounded-2xl px-[28px] py-4 shadow-sm">
            <div className="flex gap-10 items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Mentorship Hub</p>
                <p className="text-base font-bold leading-none">
Connect with a trusted mentor, schedule check-ins, receive tailored tasks, and track your spiritual growth step by step.                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
                alt="Prayer"
                className="w-[173px] h-[171px] object-cover rounded-[20px]"
              />
            </div>
          </div>
          </Link>
        </div>
      </div>

      {/* Featured Article */}
      
      
      
    </div>
        </DashboardLayout>
    )
}

export default HomePage