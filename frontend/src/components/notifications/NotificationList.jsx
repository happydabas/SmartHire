import React from 'react';
import { NotificationItem } from './NotificationItem';

export function NotificationList({ notifications, onClose }) {
  return (
    <div id="notification-list-panel" className="divide-y divide-slate-100 dark:divide-slate-800" role="tabpanel">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

export default NotificationList;
