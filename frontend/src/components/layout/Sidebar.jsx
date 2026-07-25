import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Briefcase,
  Settings,
  ShieldAlert,
  Building,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  BarChart2,
  Sparkles,
  History,
  TrendingUp
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Avatar from '@/components/ui/Avatar';

export function Sidebar({ isCollapsed, setIsCollapsed, onLinkClick, isMobile = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    `px-4 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-3 transition-all ${
      (isCollapsed && !isMobile) ? 'justify-center' : ''
    } ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  const collapsedMode = isCollapsed && !isMobile;

  return (
    <aside
      className={
        isMobile
          ? "flex flex-col bg-slate-900 text-white h-full w-full"
          : `hidden lg:flex flex-col bg-slate-900 text-white h-full shrink-0 transition-all duration-300 relative border-r border-slate-800 ${
              isCollapsed ? 'w-20' : 'w-64'
            }`
      }
    >
      {/* Collapse toggle button for desktop sidebar */}
      {!isMobile && setIsCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-3.5 w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {/* ── Scrollable nav area ── */}
      <div className="flex flex-col flex-1 overflow-y-auto p-6 space-y-6">
        {!collapsedMode && (
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Workspace Portal
          </div>
        )}

        <nav className="flex flex-col gap-1.5">
          {/* Job Seeker Navigation Links */}
          {user.role === ROLES.JOB_SEEKER && (
            <>
              <NavLink to="/dashboard" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Dashboard" : undefined}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/profile" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Profile Settings" : undefined}>
                <User className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Profile Settings</span>}
              </NavLink>

              <NavLink to="/resume" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "My Resume" : undefined}>
                <FileText className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>My Resume</span>}
              </NavLink>

              <NavLink to="/profile/resume-parser" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "AI Resume Parser" : undefined}>
                <BrainCircuit className="w-4 h-4 shrink-0 text-blue-400" />
                {!collapsedMode && <span>AI Resume Parser</span>}
              </NavLink>

              <NavLink to="/profile/resume-analysis" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "AI Resume Analyzer" : undefined}>
                <BarChart2 className="w-4 h-4 shrink-0 text-indigo-400" />
                {!collapsedMode && <span>AI Resume Analyzer</span>}
              </NavLink>

              <NavLink to="/profile/recommendations" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Recommended Jobs" : undefined}>
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                {!collapsedMode && <span>Recommended Jobs</span>}
              </NavLink>

              <NavLink to="/profile/recommendations/history" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Recommendation History" : undefined}>
                <History className="w-4 h-4 shrink-0 text-slate-400" />
                {!collapsedMode && <span>Recommendation History</span>}
              </NavLink>

              <NavLink to="/profile/insights" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "AI Career Insights" : undefined}>
                <TrendingUp className="w-4 h-4 shrink-0 text-indigo-400" />
                {!collapsedMode && <span>AI Career Insights</span>}
              </NavLink>

              <NavLink to="/saved-jobs" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Saved Jobs" : undefined}>
                <Bookmark className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Saved Jobs</span>}
              </NavLink>

              <NavLink to="/applications" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Applications" : undefined}>
                <ClipboardList className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Applications</span>}
              </NavLink>
            </>
          )}

          {/* Recruiter Navigation Links */}
          {user.role === ROLES.RECRUITER && (
            <>
              <NavLink to="/recruiter/dashboard" end onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Dashboard" : undefined}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/recruiter/jobs" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Job Listings" : undefined}>
                <Briefcase className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Job Listings</span>}
              </NavLink>

              <NavLink to="/recruiter/applicants" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Applicants" : undefined}>
                <User className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Applicants</span>}
              </NavLink>

              <NavLink to="/recruiter/insights" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Hiring Insights" : undefined}>
                <TrendingUp className="w-4 h-4 shrink-0 text-indigo-400" />
                {!collapsedMode && <span>Hiring Insights</span>}
              </NavLink>
            </>
          )}

          {/* Company Owner Navigation Links */}
          {user.role === ROLES.COMPANY_OWNER && (
            <>
              <NavLink to="/company" end onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Company Profile" : undefined}>
                <Building className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Company Profile</span>}
              </NavLink>

              <NavLink to="/company/settings" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Settings" : undefined}>
                <Settings className="w-4 h-4 shrink-0" />
                {!collapsedMode && <span>Settings</span>}
              </NavLink>
            </>
          )}

          {/* Admin Navigation Links */}
          {user.role === ROLES.ADMIN && (
            <NavLink to="/admin" onClick={handleLinkClick} className={linkClass} title={collapsedMode ? "Admin Control" : undefined}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {!collapsedMode && <span>Admin Control</span>}
            </NavLink>
          )}
        </nav>
      </div>

      {/* ── User profile + logout pinned at bottom ── */}
      <div className={twMerge("border-t border-slate-800 p-4 shrink-0", collapsedMode && "flex justify-center")}>
        {collapsedMode ? (
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
              src={user.profile?.profile_photo_url}
              alt={user.name}
              size="sm"
              className="ring-2 ring-slate-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none truncate">{user.name}</p>
              <p className="text-[10px] font-semibold text-slate-400 capitalize mt-0.5">
                {user.role?.replace('_', ' ')}
              </p>
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
  );
}

export default Sidebar;
