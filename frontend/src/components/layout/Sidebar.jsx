import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { ROLES } from '@/constants/roles';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Briefcase,
  Settings,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sun,
  Moon,
  ChevronDown,
  Bell
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function Sidebar({ isCollapsed, setIsCollapsed, onLinkClick, isMobile = false }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isDarkMode = theme === 'dark';

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick();
  };

  const linkClass = ({ isActive }) =>
    `relative px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3.5 transition-all duration-300 border border-transparent ${
      (isCollapsed && !isMobile) ? 'justify-center' : ''
    } ${
      isActive
        ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 font-semibold scale-[1.01]'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/20'
    }`;

  const collapsedMode = isCollapsed && !isMobile;

  return (
    <aside
      className={
        isMobile
          ? "flex flex-col bg-white text-slate-800 dark:bg-[#090a0f] dark:text-slate-200 h-full w-full border-r border-slate-200 dark:border-transparent"
          : `hidden lg:flex flex-col bg-white text-slate-800 dark:bg-[#090a0f] dark:text-slate-200 h-full shrink-0 transition-all duration-300 relative border-r border-slate-200 dark:border-transparent ${
              isCollapsed ? 'w-20' : 'w-64'
            }`
      }
    >

      {/* S SmartHire Logo Header */}
      <div className={twMerge("p-6 flex items-center gap-3", collapsedMode && "justify-center px-4")}>
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0 shadow-md shadow-blue-500/20">
          S
        </div>
        {!collapsedMode && (
          <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
            Smart<span className="text-blue-600">Hire</span>
          </span>
        )}
      </div>

      {/* Navigation Area */}
      <div className="flex flex-col flex-grow overflow-y-auto p-5 space-y-6">
        <nav className="flex flex-col gap-2">
          {/* Job Seeker Navigation Links */}
          {user.role === ROLES.JOB_SEEKER && (
            <>
              <NavLink to="/dashboard" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Dashboard" : undefined}>
                <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/jobs" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Jobs" : undefined}>
                <Briefcase className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Jobs</span>}
              </NavLink>

              <NavLink to="/resume" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Resume" : undefined}>
                <FileText className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Resume</span>}
              </NavLink>

              <NavLink to="/saved-jobs" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Saved Jobs" : undefined}>
                <Bookmark className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Saved Jobs</span>}
              </NavLink>

              <NavLink to="/applications" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Applications" : undefined}>
                <ClipboardList className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Applications</span>}
              </NavLink>

              <NavLink to="/notifications" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Notifications" : undefined}>
                <div className="relative flex items-center justify-between w-full">
                  <div className="flex items-center gap-3.5">
                    <Bell className="w-4.5 h-4.5 shrink-0" />
                    {!collapsedMode && <span>Notifications</span>}
                  </div>
                  {!collapsedMode && unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('AI Career Insights feature is coming soon!');
                  handleLinkClick();
                }}
                className={twMerge(linkClass, "w-full text-left cursor-pointer")}
                title={collapsedMode ? "AI Career Insights (Soon)" : undefined}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4.5 h-4.5 shrink-0 text-indigo-500" />
                    {!collapsedMode && <span>AI Career Insights</span>}
                  </div>
                  {!collapsedMode && (
                    <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">
                      Soon
                    </span>
                  )}
                </div>
              </button>
            </>
          )}

          {/* Recruiter Navigation Links */}
          {user.role === ROLES.RECRUITER && (
            <>
              <NavLink to="/recruiter/dashboard" end onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Dashboard" : undefined}>
                <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/recruiter/jobs" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Job Listings" : undefined}>
                <Briefcase className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Job Listings</span>}
              </NavLink>

              <NavLink to="/recruiter/applicants" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Applicants" : undefined}>
                <User className="w-4.5 h-4.5 shrink-0" />
                {!collapsedMode && <span>Applicants</span>}
              </NavLink>

              <NavLink to="/notifications" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Notifications" : undefined}>
                <div className="relative flex items-center justify-between w-full">
                  <div className="flex items-center gap-3.5">
                    <Bell className="w-4.5 h-4.5 shrink-0" />
                    {!collapsedMode && <span>Notifications</span>}
                  </div>
                  {!collapsedMode && unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>

              <NavLink to="/recruiter/insights" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Hiring Insights" : undefined}>
                <TrendingUp className="w-4.5 h-4.5 shrink-0 text-indigo-500" />
                {!collapsedMode && <span>Hiring Insights</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-grow" />

        <div className="pt-4">
          <button
            onClick={toggleTheme}
            className={twMerge(
              "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/20 w-full text-left cursor-pointer",
              collapsedMode && "justify-center"
            )}
            title={collapsedMode ? (isDarkMode ? "Dark Mode" : "Light Mode") : undefined}
          >
            {isDarkMode ? (
              <>
                <Moon className="w-4 h-4 shrink-0 text-blue-400" />
                {!collapsedMode && <span>Dark Mode</span>}
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 shrink-0 text-amber-500" />
                {!collapsedMode && <span>Light Mode</span>}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pinned user profile footer block with Dropdown Menu */}
      <div className="relative p-4 shrink-0 bg-slate-50/50 dark:bg-transparent">
        
        {/* Floating Backdrop for closing click */}
        {isProfileMenuOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
        )}

        {/* Absolute floating dropdown menu */}
        {isProfileMenuOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-[#0c0d14] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-slideUp">
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                if (user.role === ROLES.JOB_SEEKER) navigate('/profile');
                else navigate('/recruiter/profile');
                handleLinkClick();
              }}
              className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/40 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Settings</span>
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1" />

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                handleLogout();
              }}
              className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Profile Card Trigger */}
        {collapsedMode ? (
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all"
            title="Profile Options"
          >
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </button>
        ) : (
          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center justify-between gap-3 cursor-pointer p-1.5 hover:bg-slate-100/60 dark:hover:bg-slate-850/40 rounded-2xl transition-all group"
            title="Profile Menu"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 border-2 border-slate-205 dark:border-slate-700 group-hover:border-blue-500 transition-all">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-450 dark:text-slate-400 capitalize mt-1 leading-none">
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <ChevronDown className={twMerge("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", isProfileMenuOpen && "rotate-180")} />
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
