
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";
import {  LogOut } from 'lucide-react';
import HomeIcon from '@/app/assets/icons/homeIcon';
import LearnIcon from '@/app/assets/icons/learnIcon';
import BuildupIcon from '@/app/assets/icons/buildupIcon';
import CommunityIcon from '@/app/assets/icons/communityIcon';
import MoreIcon from "@/app/assets/icons/MoreIcon";


export const navItems = [
  { path: '/dashboard/home', label: 'Home', icon: HomeIcon },
  { path: '/dashboard/learn', label: 'Learn', icon: LearnIcon },
  { path: '/dashboard/buildup', label: 'Buildup', icon: BuildupIcon },
  { path: '/dashboard/community', label: 'Community', icon: CommunityIcon },
  { path: '/dashboard/more', label: 'More', icon: MoreIcon },
];


const SideBar = () => {
      const pathname = usePathname();
  const router = useRouter();
  
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');
    return (
        <>
        <aside className="h-screen max-h-screen w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        {/* Logo */}
        <div className="px-[26px] pt-[44px] pb-[32px]">
                    <img src="/logo3.png" alt="logo" className="h-[44px] w-auto" />

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[26px] space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-[#FBF6FF] text-[#870BD6]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon color={isActive(item.path) ? "#870BD6" : "#60666B"} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-[26px] pb-[44px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">AJ</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Amber James</p>
              <p className="text-xs text-gray-500">alison.e@rayna.ui</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </aside>
        </>
    )
}

export const MobileNav = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');
  
  return (
    <section
      className="fixed w-screen bottom-0 left-0 right-0 h-[68px] z-[99] px-6 bg-white md:hidden"
    >
      <div className="flex justify-between items-center h-full">
        {navItems.map((item) => (
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
