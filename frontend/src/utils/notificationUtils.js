import { notificationService } from '../services/notificationService';

/**
 * Fetch all notifications
 * @returns {Promise<Array>} Notifications list
 */
export const fetchNotificationsHelper = async () => {
  const res = await notificationService.getNotifications();
  return Array.isArray(res) ? res : (res?.items || []);
};

/**
 * Refresh unread count
 * @returns {Promise<number>} Unread count
 */
export const refreshUnreadCountHelper = async () => {
  const response = await notificationService.getUnreadCount();
  return response?.count ?? 0;
};

/**
 * Centrally refresh both notifications list and unread count, managing standard loading/error states.
 * @param {object} stateSetters - Callbacks to set React state
 * @param {function} stateSetters.setNotifications
 * @param {function} stateSetters.setUnreadCount
 * @param {function} stateSetters.setLoading
 * @param {function} stateSetters.setError
 */
export const refreshNotificationsListHelper = async ({
  setNotifications,
  setUnreadCount,
  setLoading,
  setError
}) => {
  if (setLoading) setLoading(true);
  if (setError) setError(null);
  try {
    const response = await notificationService.getNotifications();
    const items = Array.isArray(response) ? response : (response?.items || []);
    if (setNotifications) setNotifications(items);
    
    const count = await refreshUnreadCountHelper();
    if (setUnreadCount) setUnreadCount(count);
    
    return { list: items, count };
  } catch (error) {
    if (setError) setError(error.message || 'Failed to refresh notifications.');
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Format timestamp into user friendly relative string
 * @param {string} dateString - ISO string date
 * @returns {string} Relative timestamp string
 */
export const formatNotificationTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 0) return 'Just now'; // Prevent future dates due to clock drift

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  // Fallback to formatted date if older than 7 days
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};
