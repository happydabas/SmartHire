import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  Building
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import NotificationBell from '@/components/notifications/NotificationBell';

export function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="h-screen bg-slate-50/50 flex flex-col font-sans overflow-hidden">
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
      <header className="bg-white border-b border-slate-100 h-16 shrink-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Open Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2 select-none">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">S</span>
            <span className="font-black text-slate-800 tracking-tight text-lg">SmartHire <span className="text-blue-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 ml-1">Recruiter</span></span>
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
          className={`hidden lg:flex flex-col bg-slate-900 text-slate-300 h-full shrink-0 transition-all duration-300 relative border-r border-slate-800 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-4 -right-3.5 w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
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
                    className={`px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all text-slate-400 hover:text-white hover:bg-slate-800/60 w-full text-left ${
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
                    `px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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

          {/* User profile + logout pinned at sidebar bottom */}
          <div className={`border-t border-slate-800 p-4 shrink-0 ${ isCollapsed ? 'flex justify-center' : '' }`}>
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
                  className="ring-2 ring-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white leading-none truncate">{user?.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
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
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white p-5 animate-slide-right shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recruiter Portal</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
                        className="px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all text-slate-400 hover:text-white hover:bg-slate-800/60 w-full text-left"
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
                        `px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-grow p-4 sm:p-6 md:p-8">
            <div className="animate-fadeIn animate-slideUp">
              <Outlet />
            </div>
          </main>

          <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs font-semibold text-slate-400 tracking-wide mt-auto select-none">
            &copy; {new Date().getFullYear()} SmartHire Job Portal. Recruiter Console. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}

export default RecruiterLayout;
