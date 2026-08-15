import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { ROUTES } from '@/constants/routes';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  UserCheck,
  Building,
  User,
  Settings,
  ChevronUp,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import CreateCompanyOnboarding from '@/pages/recruiter/CreateCompanyOnboarding';

export function RecruiterLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkMode = theme === 'dark';

  // Sidebar responsive & collapse states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // mini sidebar
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isOwner = Boolean(user?.is_owner || user?.role === 'company_owner');
  const hasNoCompany = Boolean(user?.role === 'recruiter' && !user?.company_id);

  // Dynamic navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: ROUTES.RECRUITER,
      exact: true
    },
    ...(isOwner
      ? [
          {
            name: 'Create Job',
            icon: PlusCircle,
            path: ROUTES.RECRUITER_CREATE_JOB
          }
        ]
      : []),
    {
      name: 'Manage Jobs',
      icon: Briefcase,
      path: ROUTES.RECRUITER_JOBS,
      exact: true
    },
    {
      name: 'Applications',
      icon: Users,
      path: ROUTES.RECRUITER_APPLICANTS
    },
    {
      name: 'Notifications',
      icon: Bell,
      path: ROUTES.RECRUITER_NOTIFICATIONS,
      badge: unreadCount
    },
    ...(isOwner
      ? [
          {
            name: 'Recruiters',
            icon: UserCheck,
            path: '/recruiter/team'
          },
          {
            name: 'Company Settings',
            icon: Building,
            path: ROUTES.RECRUITER_COMPANY_SETTINGS
          }
        ]
      : [])
  ];

  return (
    <div className="h-screen bg-white dark:bg-[#090a0f] text-slate-800 dark:text-slate-200 flex font-sans overflow-hidden transition-colors duration-300">
      {/* Global Toast Alert */}
      {comingSoonMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-slide-in">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">
            <Sparkles className="w-4 h-4 text-blue-100" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{comingSoonMessage}</p>
            <p className="text-[10px] text-slate-400 font-medium">This module is under active construction.</p>
          </div>
        </div>
      )}

      {/* 1. SIDEBAR (Full-height sidebar, no top header bar) */}
      <aside
        className={`hidden lg:flex flex-col bg-white text-slate-800 dark:bg-[#090a0f] dark:text-slate-200 h-full shrink-0 transition-all duration-300 relative border-r border-slate-200 dark:border-slate-800/80 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Logo Header at Sidebar Top */}
        <div className={`p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base block leading-none">
                Smart<span className="text-blue-600 dark:text-blue-400">Hire</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Recruiter Console</span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-5 -right-3.5 w-7 h-7 rounded-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Sidebar Navigation Links */}
        <nav className="flex flex-col gap-1.5 mt-2 flex-1 overflow-y-auto p-4">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `relative px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all duration-200 border border-transparent ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 scale-[1.01]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
                  }`
                }
                title={isCollapsed ? (item.badge > 0 ? `${item.name} (${item.badge})` : item.name) : undefined}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <Icon className="w-5 h-5" />
                    {item.badge > 0 && isCollapsed && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#090a0f]" />
                    )}
                  </div>
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>

                {!isCollapsed && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme Toggler */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/20 w-full text-left cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : undefined}
          >
            {isDarkMode ? (
              <>
                <Moon className="w-4 h-4 shrink-0 text-blue-400" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 shrink-0 text-amber-500" />
                {!isCollapsed && <span>Light Mode</span>}
              </>
            )}
          </button>
        </div>

        {/* User Profile Footer block with Popover Menu */}
        <div className="relative p-4 shrink-0 border-t border-slate-100 dark:border-slate-800/60">
          {/* Floating Backdrop for closing click */}
          {isUserMenuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
          )}

          {/* Absolute floating popover menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-white dark:bg-[#0c0d14] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate(ROUTES.RECRUITER_PROFILE);
                }}
                className="w-full px-3.5 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/40 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Profile</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-3.5 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
              title="User Options"
            >
              {user?.name ? user.name[0].toUpperCase() : 'R'}
            </button>
          ) : (
            <div
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-between gap-3 cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-2xl transition-all group"
              title="User Options"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={user?.profile?.profile_photo_url}
                  alt={user?.name}
                  size="sm"
                  className="ring-2 ring-slate-200 dark:ring-slate-700 shrink-0 group-hover:ring-blue-500 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate">{user?.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 capitalize mt-1 leading-none">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          )}
        </div>
      </aside>

      {/* 2. Mobile Header Bar (Visible on lg:hidden viewports) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#090a0f] border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">
          Smart<span className="text-blue-600">Hire</span>
        </span>
        <NavLink
          to={ROUTES.RECRUITER_NOTIFICATIONS}
          className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </NavLink>
      </div>

      {/* 3. Mobile Slide-out Drawer Panel */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#090a0f] text-slate-800 dark:text-slate-200 p-5 animate-slide-right shadow-2xl border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Recruiter Console</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `relative px-4 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all duration-200 border border-transparent ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60 dark:text-slate-300 dark:hover:bg-slate-800/20'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 4. Main Scrollable Page Area (pt-0 so sticky top-0 in child starts at 0px) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white dark:bg-[#090a0f] pt-14 lg:pt-0 transition-colors duration-300">
        <main className="flex-grow px-4 sm:px-6 md:px-8 pt-0 pb-8">
          <div className="animate-fadeIn">
            {hasNoCompany ? <CreateCompanyOnboarding /> : <Outlet />}
          </div>
        </main>

        <footer className="bg-white dark:bg-[#090a0f] border-t border-slate-150/60 dark:border-slate-800/60 py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide mt-auto select-none transition-colors duration-300">
          &copy; {new Date().getFullYear()} SmartHire Job Portal. Recruiter Console. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default RecruiterLayout;
