import React, { useState, useEffect, useCallback } from 'react';
import { adminSettingsService } from '@/services/adminSettingsService';
import ProfileTab from '@/components/admin/settings/ProfileTab';
import SecurityTab from '@/components/admin/settings/SecurityTab';
import NotificationPreferences from '@/components/admin/settings/NotificationPreferences';
import SystemInformation from '@/components/admin/settings/SystemInformation';
import AuditLogsTable from '@/components/admin/settings/AuditLogsTable';
import AuditLogFilters from '@/components/admin/settings/AuditLogFilters';
import AuditLogPagination from '@/components/admin/settings/AuditLogPagination';
import SettingsSkeleton from '@/components/admin/settings/SettingsSkeleton';
import { AlertCircle, RotateCcw, Shield, Bell, Cpu, History, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  
  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profData, prefData, sysData] = await Promise.all([
        adminSettingsService.getProfile(),
        adminSettingsService.getNotificationPreferences(),
        adminSettingsService.getSystemInformation()
      ]);
      
      setProfile(profData);
      setPrefs(prefData);
      setSystemInfo(sysData);

      // Audit logs
      const logsData = await adminSettingsService.getAuditLogs({
        page: currentPage,
        limit: 10,
        search,
        module: moduleFilter,
        status: statusFilter
      });
      setLogs(logsData.items || []);
      setTotalPages(logsData.totalPages || 1);
    } catch (err) {
      console.error('Failed to load settings data:', err);
      setError('Could not retrieve settings details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, moduleFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProfileUpdate = async (updates) => {
    const updated = await adminSettingsService.updateProfile(updates);
    setProfile(updated);
  };

  const handlePasswordUpdate = async (currentPwd, newPwd) => {
    await adminSettingsService.changePassword(currentPwd, newPwd);
  };

  const handlePrefsUpdate = async (updatedPrefs) => {
    const updated = await adminSettingsService.updateNotificationPreferences(updatedPrefs);
    setPrefs(updated);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setCurrentPage(1);
  };

  const handleModuleChange = (modVal) => {
    setModuleFilter(modVal);
    setCurrentPage(1);
  };

  const handleStatusChange = (statVal) => {
    setStatusFilter(statVal);
    setCurrentPage(1);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Info', icon: Cpu },
    { id: 'audit', label: 'Audit Logs', icon: History }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <PageHeader
        title="Admin Settings"
        subtitle="Manage your system administrator profile, notification options, and audit logs."
      />

      {error ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-rose-100 rounded-3xl dark:bg-slate-900 dark:border-rose-950/20">
          <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30 animate-bounce">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            Access Error
          </h3>
          <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
            {error}
          </p>
          <Button variant="primary" onClick={loadData} className="rounded-xl font-black px-6 py-2.5">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : loading && !profile ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Tab selectors row */}
          <div className="border-b border-slate-100 dark:border-slate-800">
            <nav className="flex space-x-6 overflow-x-auto" aria-label="Settings tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 text-sm font-extrabold transition-all border-b-2 outline-none whitespace-nowrap ${
                      isActive 
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' 
                        : 'border-transparent text-slate-450 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-350'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active tab content panel */}
          <div className="pt-2">
            {activeTab === 'profile' && (
              <ProfileTab profile={profile} onUpdate={handleProfileUpdate} />
            )}

            {activeTab === 'security' && (
              <SecurityTab onPasswordUpdate={handlePasswordUpdate} />
            )}

            {activeTab === 'notifications' && (
              <NotificationPreferences preferences={prefs} onUpdate={handlePrefsUpdate} />
            )}

            {activeTab === 'system' && (
              <SystemInformation info={systemInfo} />
            )}

            {activeTab === 'audit' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <AuditLogFilters
                  search={search}
                  moduleFilter={moduleFilter}
                  statusFilter={statusFilter}
                  onSearchChange={handleSearchChange}
                  onModuleChange={handleModuleChange}
                  onStatusChange={handleStatusChange}
                />

                <div className="border border-slate-100 rounded-2xl overflow-hidden dark:border-slate-800">
                  <AuditLogsTable logs={logs} loading={loading} />
                  
                  {!loading && logs.length === 0 && (
                    <div className="p-12 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
                      No audit logs available.
                    </div>
                  )}
                </div>

                {!loading && logs.length > 0 && (
                  <AuditLogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
