import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import NotificationFilters from './NotificationFilters';
import NotificationPagination from './NotificationPagination';
import NotificationActions from './NotificationActions';
import NotificationList from './NotificationList';
import NotificationEmptyState from './NotificationEmptyState';
import { AlertTriangle, RotateCcw, Search, Bell, Users, Briefcase } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';

export function NotificationCenter() {
  const { user } = useAuth();
  const { 
    notifications: globalNotifications, 
    unreadCount, 
    markAllAsRead, 
    deleteAllRead,
    loading: globalLoading
  } = useNotifications();

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'company_owner';

  // local list state
  const [localNotifications, setLocalNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadLocalNotifications = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      const data = await notificationService.getNotifications({
        page: currentPage,
        limit: 10,
        filter: activeFilter,
        search: searchQuery
      });
      setLocalNotifications(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to load local notifications:', err);
      setLocalError('Failed to retrieve notifications. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  }, [currentPage, activeFilter, searchQuery]);

  useEffect(() => {
    loadLocalNotifications();
  }, [loadLocalNotifications, globalNotifications]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const hasUnread = localNotifications.some(n => !n.is_read) || unreadCount > 0;
  const hasRead = localNotifications.some(n => n.is_read) || (totalCount - unreadCount > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4 sm:pt-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header - Symbol removed to match all workspace pages */}
      <PageHeader
        title="Notifications"
        subtitle={
          isRecruiter
            ? 'Track real-time candidate applications, pipeline movements, and recruiter activity.'
            : 'Track real-time alerts on your submitted applications, status updates, and interview calls.'
        }
        sticky={false}
        actions={
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 font-extrabold text-xs px-3.5 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-300">
              Total: {totalCount}
            </span>
            <span className="bg-blue-50 text-blue-700 font-extrabold text-xs px-3.5 py-1.5 rounded-full dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              Unread: {unreadCount}
            </span>
          </div>
        }
      />

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-[#15161e] dark:border-slate-800 space-y-6">
        
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
          <Input
            id="notification-search-bar"
            type="text"
            placeholder={isRecruiter ? "Search candidate applications, job titles, or status..." : "Search notifications by title or message..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161e] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:ring-blue-500/20 focus:border-blue-500 w-full"
          />
        </div>

        {/* Bulk Action Controls */}
        <NotificationActions
          onMarkAllAsRead={markAllAsRead}
          onDeleteAllRead={deleteAllRead}
          hasUnread={hasUnread}
          hasRead={hasRead}
        />

        {/* Filters tab panel */}
        <NotificationFilters
          activeFilter={activeFilter}
          onChangeFilter={handleFilterChange}
        />

        {/* Content list body */}
        <div className="mt-6">
          {localLoading ? (
            <SkeletonLoader />
          ) : localError ? (
            <ErrorState message={localError} onRetry={loadLocalNotifications} />
          ) : localNotifications.length === 0 ? (
            <NotificationEmptyState isFiltered={activeFilter !== 'all' || !!searchQuery} />
          ) : (
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
              <NotificationList notifications={localNotifications} />
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {!localLoading && !localError && localNotifications.length > 0 && (
          <NotificationPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white dark:bg-[#15161e] dark:border-slate-800">
        <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0 dark:bg-slate-800" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-800" />
          <div className="h-3 bg-slate-200 rounded w-3/4 dark:bg-slate-800" />
          <div className="h-2 bg-slate-200 rounded w-12 dark:bg-slate-800" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-rose-100 rounded-2xl dark:bg-[#15161e] dark:border-rose-950/20">
    <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30">
      <AlertTriangle className="w-8 h-8" />
    </div>
    <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
      Loading Error
    </h3>
    <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
      {message}
    </p>
    <Button variant="primary" onClick={onRetry} className="rounded-xl font-black px-6 py-2.5">
      <RotateCcw className="w-4 h-4 mr-2" />
      Retry Loading
    </Button>
  </div>
);

export default NotificationCenter;
