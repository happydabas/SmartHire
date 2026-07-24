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
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

function Sidebar() {
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

  const linkClass = ({ isActive }) =>
    `px-4 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-3 transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 h-full">
      {/* ── Scrollable nav area ── */}
      <div className="flex flex-col flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Workspace Portal
        </div>

        <nav className="flex flex-col gap-1.5">
          {/* Job Seeker Navigation Links */}
          {user.role === ROLES.JOB_SEEKER && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/profile" className={linkClass}>
                <User className="w-4 h-4 shrink-0" />
                <span>Profile Settings</span>
              </NavLink>

              <NavLink to="/resume" className={linkClass}>
                <FileText className="w-4 h-4 shrink-0" />
                <span>My Resume</span>
              </NavLink>

              <NavLink to="/saved-jobs" className={linkClass}>
                <Bookmark className="w-4 h-4 shrink-0" />
                <span>Saved Jobs</span>
              </NavLink>

              <NavLink to="/applications" className={linkClass}>
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span>Applications</span>
              </NavLink>
            </>
          )}

          {/* Recruiter Navigation Links */}
          {user.role === ROLES.RECRUITER && (
            <>
              <NavLink to="/recruiter/dashboard" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/recruiter/jobs" className={linkClass}>
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Job Listings</span>
              </NavLink>

              <NavLink to="/recruiter/applicants" className={linkClass}>
                <User className="w-4 h-4 shrink-0" />
                <span>Applicants</span>
              </NavLink>
            </>
          )}

          {/* Company Owner Navigation Links */}
          {user.role === ROLES.COMPANY_OWNER && (
            <>
              <NavLink to="/company" end className={linkClass}>
                <Building className="w-4 h-4 shrink-0" />
                <span>Company Profile</span>
              </NavLink>

              <NavLink to="/company/settings" className={linkClass}>
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </NavLink>
            </>
          )}

          {/* Admin Navigation Links */}
          {user.role === ROLES.ADMIN && (
            <NavLink to="/admin" className={linkClass}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Admin Control</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* ── User profile + logout pinned at bottom ── */}
      <div className="border-t border-slate-800 p-4 shrink-0">
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
      </div>
    </aside>
  );
}

export default Sidebar;
