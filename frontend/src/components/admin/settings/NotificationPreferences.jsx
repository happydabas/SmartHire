import React, { useState } from 'react';
import { toast } from 'sonner';

export function NotificationPreferences({ preferences, onUpdate }) {
  const [prefs, setPrefs] = useState(preferences || {
    email: { securityAlerts: true, newCompanies: true, newJobs: false, platformUpdates: true },
    inApp: { securityAlerts: true, systemAnnouncements: true, moderationAlerts: false }
  });

  const handleToggle = async (section, key) => {
    const updated = {
      ...prefs,
      [section]: {
        ...prefs[section],
        [key]: !prefs[section][key]
      }
    };
    setPrefs(updated);
    try {
      await onUpdate(updated);
      toast.success('Notification preference updated successfully');
    } catch (err) {
      toast.error('Failed to save preference settings');
    }
  };

  const Switch = ({ checked, onChange, labelId }) => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange();
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={onChange}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-8">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
          Notification Preferences
        </h3>
        <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">
          Configure how you receive security alerts and moderation updates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Email Notifications section */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
            Email Notifications
          </h4>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { key: 'securityAlerts', title: 'Security Alerts', desc: 'Critical alerts about account security, logins, and API access.' },
              { key: 'newCompanies', title: 'New Company Registrations', desc: 'Receive emails when a company profile is submitted for approval.' },
              { key: 'newJobs', title: 'New Job Reports', desc: 'Get alerts when listings are flagged or reported by users.' },
              { key: 'platformUpdates', title: 'Platform Updates', desc: 'General news and feature announcements.' }
            ].map((opt) => (
              <div key={opt.key} className="flex items-center justify-between pt-4 first:pt-0">
                <div className="space-y-0.5 max-w-[80%]">
                  <p className="text-sm font-bold text-slate-800 dark:text-white" id={`email-${opt.key}`}>
                    {opt.title}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold dark:text-slate-550">
                    {opt.desc}
                  </p>
                </div>
                <Switch
                  checked={prefs.email[opt.key]}
                  onChange={() => handleToggle('email', opt.key)}
                  labelId={`email-${opt.key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* In-App Notifications section */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
            In-App Notifications
          </h4>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { key: 'securityAlerts', title: 'Security Alerts', desc: 'In-app reminders regarding account profile edits and IP changes.' },
              { key: 'systemAnnouncements', title: 'System Announcements', desc: 'Alerts regarding database sync tasks and backend health updates.' },
              { key: 'moderationAlerts', title: 'Moderation Alerts', desc: 'Pings when new job requests or company files require moderation.' }
            ].map((opt) => (
              <div key={opt.key} className="flex items-center justify-between pt-4 first:pt-0">
                <div className="space-y-0.5 max-w-[80%]">
                  <p className="text-sm font-bold text-slate-800 dark:text-white" id={`app-${opt.key}`}>
                    {opt.title}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold dark:text-slate-550">
                    {opt.desc}
                  </p>
                </div>
                <Switch
                  checked={prefs.inApp[opt.key]}
                  onChange={() => handleToggle('inApp', opt.key)}
                  labelId={`app-${opt.key}`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default NotificationPreferences;
