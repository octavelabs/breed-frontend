import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useReducer } from "react";
import { getUnreadCommunityCount, subscribe as subscribeUnread } from "@/app/dashboard/community/lib/unreadTracker";
import { LogOut } from 'lucide-react';

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}
import {
  Home2, Book1, Clipboard, People, Profile2User,
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
            : "bg-white dark:bg-[#181A1F] border-gray-200 dark:border-[#2D313A]"
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

const lightGlass: React.CSSProperties = {
  background: 'rgba(245, 235, 255, 0.45)',
  backdropFilter: 'blur(32px) saturate(2)',
  WebkitBackdropFilter: 'blur(32px) saturate(2)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.95)',
};

const darkGlass: React.CSSProperties = {
  background: 'rgba(24, 26, 31, 0.95)',
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
  border: '1px solid rgba(45, 49, 58, 0.8)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
};

const NavItem = ({
  item,
  active,
  isDark,
  badge,
}: {
  item: { path: string; label: string; icon: React.ElementType };
  active: boolean;
  isDark: boolean;
  badge?: number;
}) => {
  const activeColor = isDark ? '#A855F7' : '#870BD6';
  const inactiveColor = isDark ? '#717784' : '#6B7280';
  return (
    <Link href={item.path} className="relative flex flex-col items-center gap-[3px] px-2 py-1 z-10">
      {active && (
        <span
          className="absolute -inset-x-3 -inset-y-0.5 rounded-full"
          style={{
            background: isDark ? '#1A2342' : 'rgba(255,255,255,0.97)',
            boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1)',
            zIndex: -1,
          }}
        />
      )}
      <div className="relative">
        <item.icon color={active ? activeColor : inactiveColor} size={22} variant={active ? 'Bold' : 'Linear'} />
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-4 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold relative" style={{ color: active ? activeColor : inactiveColor }}>
        {item.label}
      </span>
    </Link>
  );
};

export const MobileNav = () => {
  const pathname = usePathname();
  const { userType } = useUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const isDark = useDarkMode();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeUnread(forceUpdate), []);
  const communityUnreadCount = getUnreadCommunityCount();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const isAdminRoute    = pathname?.startsWith('/dashboard/admin');
  const isPreacherRoute = pathname?.startsWith('/dashboard/preacher');
  const isPreacher = userType === 'preacher' || isPreacherRoute || isAdminRoute;

  const currentNavItems = isAdminRoute ? adminNavItems : isPreacher ? preacherNavItems : navItems;

  const visibleItems = isAdminRoute ? currentNavItems.slice(0, 4) : currentNavItems;
  const overflowItems = isAdminRoute ? currentNavItems.slice(4) : [];
  const hasOverflow = overflowItems.length > 0;

  const glassStyle = isDark ? darkGlass : lightGlass;
  const activeColor = isDark ? '#A855F7' : '#870BD6';
  const inactiveColor = isDark ? '#717784' : '#6B7280';
  const sheenColor = isDark
    ? 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0))'
    : 'linear-gradient(to bottom, rgba(255,255,255,0.38), rgba(255,255,255,0))';

  return (
    <section className="fixed bottom-4 left-4 right-4 z-[99] md:hidden">

      {/* Overflow sheet */}
      {hasOverflow && moreOpen && (
        <>
          <div className="fixed inset-0 z-[98]" onClick={() => setMoreOpen(false)} />
          <div
            className="absolute bottom-[76px] right-0 w-48 rounded-[20px] overflow-hidden z-[100] py-1"
            style={glassStyle}
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[20px]"
              style={{ background: sheenColor }}
            />
            {overflowItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 relative z-10"
                >
                  {active && (
                    <span
                      className="absolute inset-x-2 inset-y-1 rounded-xl"
                      style={{ background: isDark ? '#1A2342' : 'rgba(255,255,255,0.97)', zIndex: -1 }}
                    />
                  )}
                  <Icon color={active ? activeColor : inactiveColor} size={20} variant={active ? 'Bold' : 'Linear'} />
                  <span className="text-sm font-semibold" style={{ color: active ? activeColor : inactiveColor }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Main pill */}
      <nav
        className="relative flex justify-between items-center h-[64px] px-5 rounded-[30px] overflow-hidden"
        style={glassStyle}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[30px]"
          style={{ background: sheenColor }}
        />

        {visibleItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            isDark={isDark}
            badge={item.path === '/dashboard/community' ? communityUnreadCount : undefined}
          />
        ))}

        {hasOverflow && (
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className="relative flex flex-col items-center gap-[3px] px-2 py-1 z-10"
          >
            {moreOpen && (
              <span
                className="absolute inset-x-0 -inset-y-0.5 rounded-2xl"
                style={{
                  background: isDark ? '#1A2342' : 'rgba(255,255,255,0.97)',
                  boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.10)',
                  zIndex: -1,
                }}
              />
            )}
            <div className="flex gap-[3px] items-center h-[22px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[4px] h-[4px] rounded-full"
                  style={{ background: moreOpen ? activeColor : inactiveColor }}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: moreOpen ? activeColor : inactiveColor }}>
              More
            </span>
          </button>
        )}
      </nav>
    </section>
  );
};

export default SideBar;
