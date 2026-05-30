import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/api';

const ROLE_CHOICES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'LEAD', label: 'Project Lead' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'WRITER', label: 'Writer' },
  { value: 'REVIEWER', label: 'Reviewer' },
  { value: 'CLIENT', label: 'Client Viewer' },
];

const ROLE_COLORS = {
  ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  LEAD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DESIGNER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  WRITER: 'bg-green-500/20 text-green-400 border-green-500/30',
  REVIEWER: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CLIENT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function TeamPage() {
  const { studioId } = useParams();
  const effectiveStudioId = studioId || 1;

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DESIGNER');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [effectiveStudioId]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/studios/${effectiveStudioId}/members/`);
      setMembers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Could not load team members.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      const newMember = await apiClient.post(
        `/studios/${effectiveStudioId}/members/invite/`,
        { email: inviteEmail, role: inviteRole }
      );
      setMembers([...members, newMember]);
      setInviteEmail('');
      setInviteRole('DESIGNER');
      setIsInviteOpen(false);
    } catch (err) {
      setInviteError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to invite member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the studio?')) return;
    try {
      await apiClient.delete(`/studios/${effectiveStudioId}/members/${memberId}/`);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member.');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const updated = await apiClient.patch(
        `/studios/${effectiveStudioId}/members/${memberId}/change-role/`,
        { role: newRole }
      );
      setMembers(members.map(m => m.id === memberId ? updated : m));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change role.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold">
        Loading Team...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm">CS</div>
          <h1 className="text-lg font-bold tracking-tight text-white">Creative Studio — Team</h1>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          + Invite Member
        </button>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">Team Members</h2>
          <p className="text-sm text-slate-400 mt-1">{members.length} member{members.length !== 1 ? 's' : ''} in this studio</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Members List */}
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No members yet. Invite someone to get started.
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-sm uppercase">
                    {(member.username || member.email || '?')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member.username || '—'}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>

                {/* Role + Actions */}
                <div className="flex items-center gap-3">
                  {/* Role Badge / Selector */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${ROLE_COLORS[member.role] || ROLE_COLORS.DESIGNER}`}>
                    {member.role}
                  </span>

                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {ROLE_CHOICES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleRemove(member.id)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="teammate@studio.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl bg-white text-slate-900 outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                >
                  {ROLE_CHOICES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {inviteError && (
                <p className="text-xs text-red-500 font-semibold">{inviteError}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setIsInviteOpen(false); setInviteError(''); }}
                  className="text-xs font-bold text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                >
                  {inviteLoading ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamPage;