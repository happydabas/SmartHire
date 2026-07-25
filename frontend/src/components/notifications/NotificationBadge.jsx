import React from 'react';

/**
 * NotificationBadge displays a rounded numeric badge for unread notifications.
 * Automatically hidden if count is zero or null.
 * Caps layout representation at 99+.
 */
export function NotificationBadge({ count }) {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span 
      className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white shadow-md animate-pulse-subtle select-none"
      role="status"
      aria-live="polite"
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
}

export default NotificationBadge;
