import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Settings,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Building,
  Sun,
  Moon
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import NotificationBell from '@/components/notifications/NotificationBell';

export function RecruiterLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkMode = theme === 'dark';

  // Sidebar responsive & collapse states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // tablet/desktop mini sidebar
  const [comingSoonMessage, setComingSoonMessage] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const triggerComingSoon = (featureName) => {
    setComingSoonMessage(featureName);
    setTimeout(() => {
      setComingSoonMessage(null);
    }, 3000);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/recruiter',
      exact: true
    },
    {
      name: 'Create Job',
      icon: PlusCircle,
      path: '/recruiter/jobs/create'
    },
    {
      name: 'Manage Jobs',
      icon: Briefcase,
      path: '/recruiter/jobs'
    },
    {
      name: 'Applicants',
      icon: Users,
      path: '/recruiter/applicants'
    },
    {
      name: 'Company Settings',
      icon: Building,
      path: '/recruiter/company/settings'
    },
    {
      name: 'Profile',
      icon: User,
      path: '/recruiter/profile'
    }
  ];

  return (
    <div className="h-screen bg-white dark:bg-[#090a0f] text-slate-800 dark:text-slate-200 flex flex-col font-sans overflow-hidden transition-colors duration-300">
      {/* 1. Global Coming Soon Toast Alert */}
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

      {/* 2. Top Header Navbar */}
      <header className="bg-white dark:bg-[#090a0f] text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800/60 h-16 shrink-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Open Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2 select-none">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">S</span>
            <span className="font-black text-slate-800 dark:text-white tracking-tight text-lg">SmartHire <span className="text-blue-600 dark:text-blue-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 ml-1">Recruiter</span></span>
          </div>
        </div>

        {/* Right side bell integration */}
        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </header>

      {/* Main Page Layout Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3. Sidebar (Desktop & Collapsible Tablet Panel) */}
        <aside
          className={`hidden lg:flex flex-col bg-white text-slate-800 dark:bg-[#090a0f] dark:text-slate-200 h-full shrink-0 transition-all duration-300 relative border-r border-slate-200 dark:border-transparent ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-4 -right-3.5 w-7 h-7 rounded-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Navigation Links — scrollable */}
          <nav className="flex flex-col gap-1 mt-4 flex-1 overflow-y-auto p-4">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;

              if (item.action) {
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`relative px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3.5 transition-all duration-300 border border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/60 dark:text-white dark:hover:bg-slate-800/20 w-full text-left ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </button>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `relative px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3.5 transition-all duration-300 border border-transparent ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 scale-[1.01]'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60 dark:text-white dark:hover:bg-slate-800/20'
                    }`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Theme Toggler */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
            <button
              onClick={toggleTheme}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/20 w-full text-left ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : undefined}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 shrink-0 text-slate-500 dark:text-white" />
                  {!isCollapsed && <span>Light Mode</span>}
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 shrink-0 text-slate-500 dark:text-white" />
                  {!isCollapsed && <span>Dark Mode</span>}
                </>
              )}
            </button>
          </div>

          {/* User profile + logout pinned at sidebar bottom */}
          <div className={`border-t border-slate-100 dark:border-slate-800/60 p-4 shrink-0 ${ isCollapsed ? 'flex justify-center' : '' }`}>
            {isCollapsed ? (
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.profile?.profile_photo_url}
                  alt={user?.name}
                  size="sm"
                  className="ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate">{user?.name}</p>
                  <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* 4. Mobile Overlay & Slide-out Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#090a0f] text-slate-800 dark:text-slate-205 p-5 animate-slide-right shadow-2xl border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recruiter Portal</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-850 dark:hover:text-white rounded-lg hover:bg-slate-80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex flex-col gap-1.5 flex-1">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;

                  if (item.action) {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setIsSidebarOpen(false);
                          item.action();
                        }}
                        className="relative px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3.5 transition-all duration-300 border border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/60 dark:text-white dark:hover:bg-slate-800/20 w-full text-left"
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={index}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `relative px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3.5 transition-all duration-300 border border-transparent ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60 dark:text-white dark:hover:bg-slate-800/20'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* 5. Main Content Wrapper — scrollable */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white dark:bg-[#090a0f] transition-colors duration-300">
          <main className="flex-grow p-4 sm:p-6 md:p-8">
            <div className="animate-fadeIn animate-slideUp">
              <Outlet />
            </div>
          </main>

          <footer className="bg-white dark:bg-[#090a0f] border-t border-slate-150/60 dark:border-slate-800/60 py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide mt-auto select-none transition-colors duration-300">
            &copy; {new Date().getFullYear()} SmartHire Job Portal. Recruiter Console. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}

export default RecruiterLayout;
