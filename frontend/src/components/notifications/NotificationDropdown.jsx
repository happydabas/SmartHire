import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { BellOff, AlertCircle, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * NotificationDropdown renders the floating notifications list panel.
 * Contains loading skeletons, empty state prompts, error logs, and global mark-all-read buttons.
 * Implements keyboard focus-trapping for screen accessibility.
 */
export function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    error,
    markAllAsRead,
    retryFetch
  } = useNotifications();

  const dropdownRef = useRef(null);

  // Focus trap algorithm for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && dropdownRef.current) {
        // Collect all focusable elements inside the dropdown
        const focusableElements = dropdownRef.current.querySelectorAll(
          'button, [href], [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // If Shift + Tab on the first element, wrap focus to the last element
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // If Tab on the last element, wrap focus to the first element
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus the first available element when dropdown mounts
  useEffect(() => {
    if (dropdownRef.current) {
      const focusable = dropdownRef.current.querySelectorAll('button, [tabindex="0"]');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [loading, error]);

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const hasUnread = unreadNotifications.length > 0;

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Notifications panel"
      className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#15161e] border border-slate-100 dark:border-slate-800 shadow-2xl z-50 flex flex-col focus:outline-none animate-fadeIn overflow-hidden"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Notifications</h2>
          {hasUnread && (
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5" aria-live="polite">
              {unreadNotifications.length} unread updates
            </p>
          )}
        </div>
        {hasUnread && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 px-2.5 py-1.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Popover Body List */}
      <div className="max-h-[340px] overflow-y-auto flex-1 divide-y divide-slate-50 dark:divide-slate-800/50">
        {loading ? (
          // Skeleton loader display blocks
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex gap-3 animate-pulse" aria-hidden="true">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Inline error warning UI block
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 dark:text-rose-400 mb-3 border border-rose-100 dark:border-rose-900">
              <AlertCircle className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white">Failed to load</h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-[200px] leading-relaxed">
              {error}
            </p>
            <button
              onClick={retryFetch}
              className="px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Retry Connection
            </button>
          </div>
        ) : notifications.length === 0 ? (
          // Empty panel indicator with illustration icon
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 border border-slate-100 dark:border-slate-800 animate-pulse-subtle">
              <BellOff className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">No notifications yet</h3>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 max-w-[220px] leading-relaxed">
              We'll let you know when you receive job updates, status modifications, or messages.
            </p>
          </div>
        ) : (
          // Standard notification items list
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {/* Popover Footer link container */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex justify-center">
        <button
          onClick={handleViewAll}
          className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all w-full text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;
