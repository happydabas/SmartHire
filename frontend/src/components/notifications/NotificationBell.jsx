import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBadge from './NotificationBadge';
import NotificationDropdown from './NotificationDropdown';

/**
 * NotificationBell is the primary interaction header icon.
 * Includes unread count badge overlay and launches the NotificationDropdown.
 * Handles focus returning and click-away boundaries.
 */
export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const bellButtonRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape keypress
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        bellButtonRef.current?.focus(); // Return focus to trigger button
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        ref={bellButtonRef}
        onClick={toggleDropdown}
        className={`relative p-2.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          isOpen
            ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
        }`}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {isOpen && (
        <NotificationDropdown 
          onClose={() => {
            setIsOpen(false);
            bellButtonRef.current?.focus();
          }} 
        />
      )}
    </div>
  );
}

export default NotificationBell;
