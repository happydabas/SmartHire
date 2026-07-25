import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { NOTIFICATION_TYPES } from '@/constants/notificationTypes';
import { formatNotificationTimestamp } from '@/utils/notificationUtils';
import { Check, Trash2 } from 'lucide-react';

/**
 * NotificationItem represents a single notification item in the dropdown.
 * Renders category icons, timestamps, titles, and text description.
 * Displays interactive Check/Trash controls on hover/focus for unread management.
 */
export function NotificationItem({ notification, onClose }) {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve configuration according to Category Type (or default to System)
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.SYSTEM;
  const IconComponent = typeConfig.icon;

  const handleItemClick = (e) => {
    // Prevent triggering item action if they click on helper action buttons
    if (e.target.closest('.action-btn')) {
      return;
    }
    // Clicking the card body marks it as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (onClose) onClose();

    // Navigate to target views dynamically
    if (notification.navigation_url) {
      navigate(notification.navigation_url);
    } else if (user?.role === 'recruiter') {
      if (notification.application_id) {
        navigate(`/recruiter/applications/${notification.application_id}`);
      } else {
        navigate('/recruiter');
      }
    } else if (user?.role === 'job_seeker') {
      navigate('/applications');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
      if (onClose) onClose();

      if (notification.navigation_url) {
        navigate(notification.navigation_url);
      } else if (user?.role === 'recruiter') {
        if (notification.application_id) {
          navigate(`/recruiter/applications/${notification.application_id}`);
        } else {
          navigate('/recruiter');
        }
      } else if (user?.role === 'job_seeker') {
        navigate('/applications');
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex="0"
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      className={`flex gap-3.5 p-4 text-left transition-all duration-200 outline-none hover:bg-slate-50/80 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 relative group cursor-pointer border-b border-slate-100/50 ${
        !notification.is_read
          ? 'bg-blue-50/15 border-l-4 border-blue-500 pl-3'
          : 'border-l-4 border-transparent pl-3'
      }`}
      aria-label={`${notification.title}: ${notification.message}. ${
        notification.is_read ? 'Read' : 'Unread'
      }`}
    >
      {/* Type Specific Icon Column */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${typeConfig.colorClass}`}
        aria-hidden="true"
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Main Content Details */}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className={`text-xs leading-tight truncate ${!notification.is_read ? 'font-extrabold text-slate-900' : 'font-bold text-slate-700'}`}>
          {notification.title}
        </h4>
        <p className={`text-xs mt-1 leading-normal break-words ${!notification.is_read ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
          {notification.message}
        </p>
        <span className="text-[10px] font-bold text-slate-400 mt-2 block">
          {formatNotificationTimestamp(notification.created_at)}
        </span>
      </div>

      {/* Quick Action Overlay (triggered on hover/focus) */}
      <div 
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Blue Unread Dot */}
        {!notification.is_read && (
          <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100 group-hover:opacity-0 group-focus-within:opacity-0 transition-opacity duration-150" />
        )}

        {/* Check/Delete Controls Container */}
        <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center gap-1 bg-white border border-slate-100 shadow-md p-0.5 rounded-lg transition-opacity duration-150">
          {!notification.is_read && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="action-btn p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              title="Mark as read"
              aria-label="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => deleteNotification(notification.id)}
            className="action-btn p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors outline-none focus-visible:ring-1 focus-visible:ring-red-500"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationItem;
