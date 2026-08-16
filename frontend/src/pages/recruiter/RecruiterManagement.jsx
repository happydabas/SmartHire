import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, CheckCircle, Clock, XCircle, Trash2, Copy, Check, Sparkles, Building2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { companyService } from '@/services/company/companyService';

// UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { formatDate } from '@/utils/formatDate';
import { extractErrorMessage } from '@/utils/errorParser';

export function RecruiterManagement() {
  const { user } = useAuth();
  const [resolvedCompanyId, setResolvedCompanyId] = useState(user?.company_id || null);

  const [loading, setLoading] = useState(true);
  const [recruiters, setRecruiters] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Form & Action states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    let active = true;
    const initCompanyId = async () => {
      if (!user?.company_id) {
        try {
          const comp = await companyService.getMyCompany();
          if (active && comp?.id) {
            setResolvedCompanyId(comp.id);
          }
        } catch (e) {
          console.warn("Failed to fetch my company:", e);
        }
      } else {
        setResolvedCompanyId(user.company_id);
      }
    };
    initCompanyId();
    return () => { active = false; };
  }, [user?.company_id]);

  const companyId = resolvedCompanyId || user?.company_id;

  const fetchData = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [recs, invs] = await Promise.all([
        companyService.getRecruiters(companyId).catch(() => []),
        companyService.getInvitations(companyId).catch(() => [])
      ]);
      setRecruiters(recs);
      setInvitations(invs);
    } catch (err) {
      console.error('Failed to load team data:', err);
      triggerToast('Failed to load recruiter management data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const [lastCreatedInv, setLastCreatedInv] = useState(null);

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setInviteError('Recruiter Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address');
      return;
    }

    if (!companyId) {
      setInviteError('No active company profile found. Please set up your company profile first.');
      return;
    }

    try {
      setInviteLoading(true);
      setInviteError(null);
      
      const newInv = await companyService.sendInvitation(companyId, inviteEmail.trim());
      setLastCreatedInv(newInv);
      setInviteEmail('');
      await fetchData();
      triggerToast('Recruiter invitation generated! Click "Copy Link" to share the invitation link directly.', 'success');
    } catch (err) {
      console.error('Send invitation error:', err);
      const detail = extractErrorMessage(err) || 'Failed to send invitation.';
      setInviteError(detail);
      triggerToast(detail, 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!companyId || !invitationId) return;

    try {
      await companyService.cancelInvitation(companyId, invitationId);
      setInvitations(prev => prev.map(inv => inv.id === invitationId ? { ...inv, status: 'cancelled' } : inv));
      setLastCreatedInv(null);
      triggerToast('Invitation cancelled successfully.', 'success');
      await fetchData();
    } catch (err) {
      console.error('Cancel invitation error:', err);
      const detail = extractErrorMessage(err) || 'Failed to cancel invitation.';
      triggerToast(detail, 'error');
    }
  };

  const handleRemoveRecruiter = async (recruiterId, recruiterName) => {
    if (!window.confirm(`Are you sure you want to remove ${recruiterName} from your company?`)) {
      return;
    }

    try {
      await companyService.removeRecruiter(companyId, recruiterId);
      setRecruiters(prev => prev.filter(r => r.id !== recruiterId));
      triggerToast(`${recruiterName} removed from company.`, 'success');
    } catch (err) {
      console.error(err);
      const detail = extractErrorMessage(err) || 'Failed to remove recruiter.';
      triggerToast(detail, 'error');
    }
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/invitations/accept/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    triggerToast('Invitation link copied to clipboard!', 'success');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const isOwner = Boolean(user?.is_owner || user?.role === 'company_owner');

  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full inline-flex border border-amber-200 dark:border-amber-900/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Company Owner Access Required</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Only the Company Owner is authorized to manage recruiters and invitations.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingInvs = invitations.filter(i => i.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <PageHeader
        title="Recruiter Management"
        subtitle="Manage team members, invite new recruiters, and monitor invitation status."
        actions={
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-500/20">
            <Building2 className="w-4 h-4" />
            <span>{recruiters.length} Active Recruiters</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Invite Recruiter Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0d1017] rounded-3xl shadow-sm space-y-5 sticky top-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Add Recruiter</h2>
                <p className="text-[11px] text-slate-400">Invite a recruiter to join your company team.</p>
              </div>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <Input
                id="invite-recruiter-email"
                label="Recruiter Email *"
                placeholder="recruiter@example.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError('');
                }}
                error={inviteError}
                disabled={inviteLoading}
                className="rounded-xl text-xs font-semibold"
              />

              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                The invited recruiter will receive an invitation link to join your company. They will create their own password.
              </p>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={inviteLoading}
                disabled={inviteLoading}
                className="w-full rounded-xl font-bold flex items-center justify-center gap-2 py-2.5 text-xs shadow-md shadow-blue-500/10"
              >
                <Mail className="w-4 h-4" />
                <span>Send Invitation</span>
              </Button>
            </form>

            {lastCreatedInv && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Invitation Link Ready</span>
                  <button 
                    onClick={() => setLastCreatedInv(null)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 truncate">
                  Target: {lastCreatedInv.recruiter_email}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyLink(lastCreatedInv.invitation_token)}
                  className="w-full rounded-xl py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-200 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {copiedToken === lastCreatedInv.invitation_token ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Invitation Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copy Invitation Link</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Active Recruiters & Pending Invitations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Recruiters List */}
          <section className="space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Current Recruiters</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ml-1">
                {recruiters.length}
              </span>
            </h2>

            {recruiters.length === 0 ? (
              <EmptyState
                title="No Recruiters Found"
                description="Your company currently has no other active recruiters."
                icon={<Users className="w-8 h-8" />}
              />
            ) : (
              <div className="space-y-3">
                {recruiters.map((rec) => (
                  <Card key={rec.id} className="p-4 sm:p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0d1017] rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0">
                        {rec.name?.[0]?.toUpperCase() || 'R'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-white text-sm truncate">{rec.name}</span>
                          {rec.is_owner && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shrink-0">
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{rec.email}</p>
                      </div>
                    </div>

                    {!rec.is_owner && rec.id !== user?.id && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveRecruiter(rec.id, rec.name)}
                        className="rounded-xl px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 shrink-0 flex items-center gap-1.5 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Pending Invitations List */}
          <section className="space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending Invitations</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 ml-1">
                {pendingInvs.length}
              </span>
            </h2>

            {pendingInvs.length === 0 ? (
              <EmptyState
                title="No Pending Invitations"
                description="There are currently no active pending recruiter invitations."
                icon={<Mail className="w-8 h-8" />}
              />
            ) : (
              <div className="space-y-3">
                {pendingInvs.map((inv) => (
                  <Card key={inv.id} className="p-4 sm:p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0d1017] rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 dark:text-white text-sm truncate block">{inv.recruiter_email}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Sent {formatDate(inv.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyLink(inv.invitation_token)}
                          className="rounded-xl px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 font-bold"
                          title="Copy Invitation Link"
                        >
                          {copiedToken === inv.invitation_token ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 text-[11px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span className="hidden sm:inline text-[11px]">Copy Link</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancelInvitation(inv.id)}
                          className="rounded-xl px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-1 font-bold"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Cancel</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}

export default RecruiterManagement;
