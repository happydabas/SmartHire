import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserService } from '@/services/adminUserService';
import UsersTable from '@/components/admin/users/UsersTable';
import UserSearch from '@/components/admin/users/UserSearch';
import UserFilters from '@/components/admin/users/UserFilters';
import UserPagination from '@/components/admin/users/UserPagination';
import { AlertCircle, RotateCcw, UserCheck, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export function UserManagement() {
  const navigate = useNavigate();

  // State managers
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminUserService.getUsers({
        page: currentPage,
        limit: 10,
        search,
        role,
        status
      });
      setUsers(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Could not retrieve user directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(1); // Reset page on search
  };

  const handleRoleChange = (roleVal) => {
    setRole(roleVal);
    setCurrentPage(1); // Reset page on filter
  };

  const handleStatusChange = (statusVal) => {
    setStatus(statusVal);
    setCurrentPage(1); // Reset page on filter
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/admin/users/${id}`);
  };

  const handleActivate = async (id) => {
    try {
      await adminUserService.activateUser(id);
      toast.success('User account activated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to activate user account');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await adminUserService.deactivateUser(id);
      toast.success('User account deactivated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user account');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminUserService.deleteUser(id);
      toast.success('User account deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user account');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setRole('all');
    setStatus('all');
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || role !== 'all' || status !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">
          User Management
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-2 dark:text-slate-400">
          Moderate, activate, and review job seeker and recruiter credentials.
        </p>
      </div>

      {/* Action Controls & Filtering Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <UserSearch onSearch={handleSearch} />
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <UserFilters
              roleFilter={role}
              statusFilter={status}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
            />
            {isFiltered && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="rounded-xl font-black text-xs px-4 py-2.5 border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Display table */}
        <div className="pt-2">
          {error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-rose-100 rounded-2xl dark:bg-slate-900 dark:border-rose-950/20">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                Loading Error
              </h3>
              <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
                {error}
              </p>
              <Button variant="primary" onClick={fetchUsers} className="rounded-xl font-black px-6 py-2.5">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : !loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 dark:bg-slate-800">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                No Users Found
              </h3>
              <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
                No users match the current search or filters.
              </p>
              {isFiltered && (
                <Button variant="primary" onClick={handleClearFilters} className="rounded-xl font-black px-6 py-2.5">
                  Clear Filter Selections
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-slate-100 rounded-2xl overflow-hidden dark:border-slate-800">
              <UsersTable
                users={users}
                loading={loading}
                onView={handleView}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>

        {/* Pagination indicators footer */}
        {!loading && !error && users.length > 0 && (
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default UserManagement;
