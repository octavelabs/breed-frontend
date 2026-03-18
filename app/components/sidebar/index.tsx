
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";
import {  LogOut } from 'lucide-react';
import HomeIcon from '@/app/assets/icons/homeIcon';
import LearnIcon from '@/app/assets/icons/learnIcon';
import BuildupIcon from '@/app/assets/icons/buildupIcon';
import CommunityIcon from '@/app/assets/icons/communityIcon';
import MoreIcon from "@/app/assets/icons/MoreIcon";
import { useUser } from '@/app/context/UserContext';
import DashboardIcon from "@/app/assets/icons/dashboardIcon";
import MentorshipIcon from "@/app/assets/icons/MentorshipIcon";
import PreacherCommunityIcon from "@/app/assets/icons/preacherCommunityIcon";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import ShowReelIcon from "@/app/assets/icons/showreelIcon";
import SettingsIcon from "@/app/assets/icons/SettingsIcon";


export const navItems = [
  { path: '/dashboard/home', label: 'Home', icon: HomeIcon },
  { path: '/dashboard/learn', label: 'Learn', icon: LearnIcon },
  { path: '/dashboard/buildup', label: 'Buildup', icon: BuildupIcon },
  { path: '/dashboard/community', label: 'Community', icon: CommunityIcon },
  { path: '/dashboard/more', label: 'More', icon: MoreIcon },
];

export const preacherNavItems = [
  { path: '/dashboard/preacher/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/dashboard/preacher/mentorship', label: 'Mentorship', icon: MentorshipIcon },
  { path: '/dashboard/preacher/community', label: 'Community', icon: PreacherCommunityIcon},
  { path: '/dashboard/preacher/meetings', label: 'Meetings', icon: MeetingIcon },
  { path: '/dashboard/preacher/showreel', label: 'Showreel', icon: ShowReelIcon },
  { path: '/dashboard/preacher/settings', label: 'Settings', icon: SettingsIcon },
];


const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { userType } = useUser();

  console.log(userType, 'ihuh')
  
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');
  
  const isPreacherRoute = pathname?.startsWith('/dashboard/preacher');
  const isPreacher = userType === 'preacher' || isPreacherRoute;
  const currentNavItems = isPreacher ? preacherNavItems : navItems;
  
  return (
    <>
      <aside className={`h-screen max-h-screen w-64 border-r hidden md:flex md:flex-col ${
        isPreacher 
          ? 'bg-[#1A0B2E] border-[#2D1B4E]' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Logo */}
        <div className="px-[26px] pt-[44px] pb-[32px]">
          <img src={isPreacher ? "/logo3.svg" : "/logo3.png"} alt="logo" className="h-[44px] w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[26px] space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const iconColor = isPreacher 
              ? (active ? "#FFFFFF" : "#D1D5DB")
              : (active ? "#870BD6" : "#60666B");
            
            // Check if it's a Lucide icon or custom icon
            const isLucideIcon = 'isLucide' in item ? item.isLucide : false;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isPreacher
                    ? active
                      ? 'bg-[#870BD6] text-white'
                      : 'text-gray-300 hover:bg-[#2D1B4E]'
                    : active
                    ? 'bg-[#FBF6FF] text-[#870BD6]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
               
                  <Icon color={iconColor} size={26} />
                
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-[26px] pb-[44px]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isPreacher ? 'bg-[#2D1B4E]' : 'bg-gray-200'
            }`}>
              <span className={`font-semibold ${
                isPreacher ? 'text-gray-300' : 'text-gray-600'
              }`}>AJ</span>
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${
                isPreacher ? 'text-white' : 'text-gray-900'
              }`}>Amber James</p>
              <p className={`text-xs ${
                isPreacher ? 'text-gray-400' : 'text-gray-500'
              }`}>alison.e@rayna.ui</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className={`p-2 rounded-lg transition-colors ${
                isPreacher 
                  ? 'hover:bg-[#2D1B4E] text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export const MobileNav = () => {
  const pathname = usePathname();
  const { userType } = useUser();
  
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');
  
  const isPreacherRoute = pathname?.startsWith('/dashboard/preacher');
  const isPreacher = userType === 'preacher' || isPreacherRoute;
  const currentNavItems = isPreacher ? preacherNavItems : navItems;
  
  
  return (
    <section
      className="fixed w-screen bottom-0 left-0 right-0 h-[68px] z-[99] px-6 bg-white md:hidden"
    >
      <div className="flex justify-between items-center h-full">
        {currentNavItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path)
                ? 'text-[#870BD6]'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon color={isActive(item.path) ? "#870BD6" : "#60666B"} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SideBar
