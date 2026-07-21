import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from 'lucide-react';
import {
  Home2, Book1, Clipboard, People, Profile2User, Setting2,
  Grid3, Video, VideoPlay,
  PresentionChart, Heart, Candle, Link21,
} from 'iconsax-react';
import { useUser } from "@/app/context/UserContext";
import { useAuth } from "@/context/AuthContext";

export const navItems = [
  { path: "/dashboard/home",       label: "Home",        icon: Home2 },
  { path: "/dashboard/learn",      label: "Learn",       icon: Book1 },
  { path: "/dashboard/buildup",    label: "Buildup",     icon: Clipboard },
  { path: "/dashboard/community",  label: "Community",   icon: People },
  { path: "/dashboard/mentorship", label: "Mentorship",  icon: Profile2User },
];

export const preacherNavItems = [
  { path: '/dashboard/preacher/dashboard',  label: 'Dashboard',  icon: Grid3 },
  { path: '/dashboard/preacher/mentorship', label: 'Mentorship', icon: Profile2User },
  { path: '/dashboard/preacher/community',  label: 'Community',  icon: People },
  { path: '/dashboard/preacher/meetings',   label: 'Meetings',   icon: Video },
  { path: '/dashboard/preacher/showreel',   label: 'Showreel',   icon: VideoPlay },
];

export const adminNavItems = [
  { path: '/dashboard/admin/overview',        label: 'Overview',        icon: PresentionChart },
  { path: '/dashboard/admin/users',           label: 'Users',           icon: Profile2User },
  { path: '/dashboard/admin/courses',         label: 'Courses',         icon: Book1 },
  { path: '/dashboard/admin/devotionals',     label: 'Devotionals',     icon: Heart },
  { path: '/dashboard/admin/communities',     label: 'Communities',     icon: People },
  { path: '/dashboard/admin/prayer-requests', label: 'Prayer Requests', icon: Candle },
  { path: '/dashboard/admin/referrals',       label: 'Referrals',       icon: Link21 },
];

const SideBar = () => {
  const pathname = usePathname();
  const { userType } = useUser();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const isAdminRoute    = pathname?.startsWith('/dashboard/admin');
  const isPreacherRoute = pathname?.startsWith('/dashboard/preacher');
  const isPreacher = userType === 'preacher' || isPreacherRoute || isAdminRoute;

  const currentNavItems = isAdminRoute ? adminNavItems : isPreacher ? preacherNavItems : navItems;

  return (
    <>
      <aside
        className={`h-screen max-h-screen w-64 border-r hidden md:flex md:flex-col ${
          isPreacher
            ? "bg-[#1A0B2E] border-[#2D1B4E]"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Logo */}
        <div className="px-[26px] pt-[44px] pb-[28px]">
          <img
            src={isPreacher ? "/logo3.svg" : "/logo3.png"}
            alt="logo"
            className="h-[44px] w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[26px] space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const iconColor = isPreacher
              ? active ? "#FFFFFF" : "#D1D5DB"
              : active ? "#FFFFFF" : "#60666B";

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-[#870BD6] text-white"
                    : isPreacher
                      ? "text-gray-300 hover:bg-[#2D1B4E]"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon color={iconColor} size={24} variant={active ? 'Bold' : 'Linear'} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-[26px] pb-[44px]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                isPreacher ? "bg-[#2D1B4E]" : "bg-gray-200"
              }`}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className={`font-semibold ${
                    isPreacher ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {user
                    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
                    : '??'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-sm truncate ${
                  isPreacher ? "text-white" : "text-gray-900"
                }`}
              >
                {user ? `${user.firstName} ${user.lastName}` : '—'}
              </p>
              <p
                className={`text-xs truncate ${
                  isPreacher ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {user?.email ?? ''}
              </p>
            </div>
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors ${
                isPreacher
                  ? "hover:bg-[#2D1B4E] text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const MobileNav = () => {
  const pathname = usePathname();
  const { userType } = useUser();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const isAdminRoute    = pathname?.startsWith('/dashboard/admin');
  const isPreacherRoute = pathname?.startsWith('/dashboard/preacher');
  const isPreacher = userType === 'preacher' || isPreacherRoute || isAdminRoute;

  const currentNavItems = isAdminRoute ? adminNavItems : isPreacher ? preacherNavItems : navItems;

  return (
    <section className="fixed w-screen bottom-0 left-0 right-0 h-[68px] z-[99] px-6 bg-white md:hidden">
      <div className="flex justify-between items-center h-full">
        {currentNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? "text-[#870BD6]" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon
                color={active ? "#870BD6" : "#60666B"}
                size={24}
                variant={active ? 'Bold' : 'Linear'}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SideBar;
