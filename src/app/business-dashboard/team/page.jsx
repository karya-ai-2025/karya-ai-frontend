'use client';

// Team — the people in an enterprise organization.
//
// Enterprise accounts only; an individual account is sent back to the
// dashboard. What each person can do here follows their role: everyone sees
// the list, admins and managers invite, and only admins change roles or
// suspend. The backend enforces the same rules on every request — hiding a
// control here is for clarity, not security.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  fetchMyOrganization,
  fetchMembers,
  inviteMember,
  resendInvite,
  revokeInvite,
  changeMemberRole,
  suspendMember,
  reactivateMember,
} from '@/lib/organizationApi';
import { UsersRound, UserPlus, Mail, Crown, RefreshCw, Trash2, Ban, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

const ROLE_LABEL = { admin: 'Admin', manager: 'Manager', employee: 'Employee' };

const ROLE_DESCRIPTION = {
  admin: 'Full access, including billing, team and company settings.',
  manager: 'Sees all work, approves and starts campaigns, exports leads, invites employees.',
  employee: 'Builds their own campaigns and lead lists, then submits campaigns for approval.',
};

const STATUS_STYLE = {
  active: { label: 'Active', class: 'bg-green-50 text-green-700 border-green-200' },
  invited: { label: 'Invited', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspended', class: 'bg-red-50 text-red-700 border-red-200' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TeamPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, isEnterprise, can } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('team');

  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }
  const [busyId, setBusyId] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviting, setInviting] = useState(false);

  const canInvite = can('members.invite');
  const canManage = can('members.manage');
  const invitableRoles = useMemo(() => organization?.invitableRoles || [], [organization]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!isEnterprise) router.replace('/business-dashboard');
  }, [authLoading, isAuthenticated, isEnterprise, router]);

  const load = useCallback(async () => {
    try {
      const [org, list] = await Promise.all([fetchMyOrganization(), fetchMembers()]);
      setOrganization(org);
      setMembers(list);
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Could not load your team' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isEnterprise) load();
  }, [authLoading, isEnterprise, load]);

  // Keep the role picker on something this person is allowed to hand out.
  useEffect(() => {
    if (invitableRoles.length && !invitableRoles.includes(inviteRole)) {
      setInviteRole(invitableRoles[invitableRoles.length - 1]);
    }
  }, [invitableRoles, inviteRole]);

  // Run one row action, report the outcome, and refresh the list.
  const run = async (id, action, successText) => {
    setBusyId(id);
    setNotice(null);
    try {
      const result = await action();
      setNotice({ type: 'success', text: result?.message || successText });
      await load();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setBusyId(null);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    setInviting(true);
    setNotice(null);
    try {
      const result = await inviteMember(email, inviteRole);
      // The invitation can exist even when its email failed to send.
      setNotice({ type: result.emailSent === false ? 'error' : 'success', text: result.message });
      setInviteEmail('');
      await load();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Could not send the invitation' });
    } finally {
      setInviting(false);
    }
  };

  const handleSuspend = (member) => {
    if (!confirm(`Suspend ${member.user?.fullName || member.email}? They will lose access immediately. Their work stays in the organization.`)) return;
    run(member._id, () => suspendMember(member._id), 'Member suspended');
  };

  const handleRevoke = (member) => {
    if (!confirm(`Withdraw the invitation to ${member.email}?`)) return;
    run(member._id, () => revokeInvite(member._id), 'Invitation withdrawn');
  };

  const isSelf = (member) => member.user && String(member.user._id) === String(user?._id || user?.id);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Team</h1>
              {organization && (
                <span className="text-sm text-gray-500">· {organization.name}</span>
              )}
            </div>
            {organization && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                Your role: {ROLE_LABEL[organization.role] || organization.role}
              </span>
            )}
          </div>

          {notice && (
            <div className={`mb-4 p-3 rounded-xl border flex items-start gap-2 ${
              notice.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              {notice.type === 'success'
                ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
              <p className={`text-sm ${notice.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>{notice.text}</p>
            </div>
          )}

          {/* Invite */}
          {canInvite && invitableRoles.length > 0 && (
            <form onSubmit={handleInvite} className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">Invite a team member</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={inviting}
                    placeholder="colleague@company.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50 disabled:opacity-50"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={inviting || invitableRoles.length === 1}
                  aria-label="Role"
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50 disabled:opacity-60"
                >
                  {invitableRoles.map((role) => (
                    <option key={role} value={role}>{ROLE_LABEL[role] || role}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {inviting ? 'Sending…' : 'Send invitation'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{ROLE_DESCRIPTION[inviteRole]}</p>
            </form>
          )}

          {/* Members */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200">
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const status = STATUS_STYLE[member.status] || STATUS_STYLE.active;
                    const busy = busyId === member._id;
                    const pending = member.status === 'invited';
                    // The owner and your own row are never editable.
                    const editable = canManage && !pending && !member.isOwner && !isSelf(member);
                    // A manager may only manage invitations for roles they can hand out.
                    const inviteManageable = canInvite && pending && invitableRoles.includes(member.role);

                    return (
                      <tr key={member._id} className="border-b border-gray-100 last:border-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                {member.user?.fullName || member.email}
                                {member.isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" aria-label="Organization owner" />}
                                {isSelf(member) && <span className="text-xs font-normal text-gray-400">(you)</span>}
                              </p>
                              {member.user && <p className="text-xs text-gray-500">{member.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {editable ? (
                            <select
                              value={member.role}
                              disabled={busy}
                              aria-label={`Role for ${member.user?.fullName || member.email}`}
                              onChange={(e) => run(member._id, () => changeMemberRole(member._id, e.target.value), 'Role changed')}
                              className="px-2 py-1 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                            >
                              {Object.keys(ROLE_LABEL).map((role) => (
                                <option key={role} value={role}>{ROLE_LABEL[role]}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-700">{ROLE_LABEL[member.role] || member.role}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.class}`}>{status.label}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {pending ? `Invited ${formatDate(member.invitedAt)}` : formatDate(member.joinedAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {inviteManageable && (
                              <>
                                <button
                                  onClick={() => run(member._id, () => resendInvite(member._id), 'Invitation resent')}
                                  disabled={busy}
                                  title="Resend invitation"
                                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 cursor-pointer"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRevoke(member)}
                                  disabled={busy}
                                  title="Withdraw invitation"
                                  className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {editable && member.status === 'active' && (
                              <button
                                onClick={() => handleSuspend(member)}
                                disabled={busy}
                                title="Suspend member"
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            {editable && member.status === 'suspended' && (
                              <button
                                onClick={() => run(member._id, () => reactivateMember(member._id), 'Member reactivated')}
                                disabled={busy}
                                title="Reactivate member"
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
