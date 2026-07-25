import React, { useState, useEffect, useCallback } from 'react';
import { NotificationContext } from './NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import { 
  refreshNotificationsListHelper, 
  refreshUnreadCountHelper 
} from '@/utils/notificationUtils';
import { toast } from 'sonner';

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Core fetch operations
  const fetchNotifications = useCallback(async () => {
    try {
      await refreshNotificationsListHelper({
        setNotifications,
        setUnreadCount,
        setLoading,
        setError
      });
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await refreshUnreadCountHelper();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to update unread count:', err);
    }
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
      toast.error('Failed to mark notification as read');
      // Rollback on error
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast.error('Failed to mark notifications as read');
      // Rollback on error
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Delete a single notification
  const deleteNotification = useCallback(async (id) => {
    const target = notifications.find(n => n.id === id);
    if (!target) return;
    
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!target.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
    } catch (err) {
      console.error(`Failed to delete notification ${id}:`, err);
      toast.error('Failed to delete notification');
      // Rollback on error
      fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => !n.is_read));

      await notificationService.deleteAllRead();
      toast.success('All read notifications deleted');
    } catch (err) {
      console.error('Failed to delete all read notifications:', err);
      toast.error('Failed to delete read notifications');
      // Rollback on error
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Handle retry operation
  const retryFetch = useCallback(() => {
    notificationService.useMock = false; // Reset mock toggle to check if API is back up
    fetchNotifications();
  }, [fetchNotifications]);

  // Manage state loading/clearing in response to authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      const handleUpdate = () => {
        fetchNotifications();
      };
      window.addEventListener('smarthire_notifications_update', handleUpdate);

      // Check unread count periodically (e.g. every 30 seconds)
      const intervalId = setInterval(() => {
        refreshUnreadCount();
      }, 30000);

      return () => {
        window.removeEventListener('smarthire_notifications_update', handleUpdate);
        clearInterval(intervalId);
      };
    } else {
      // Clear data on logout
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, fetchNotifications, refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        retryFetch
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
