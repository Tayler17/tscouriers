'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, ShieldCheck, Trash2, Search, Mail, Zap, ShieldAlert,
  Save, Check, Edit3, X, KeyRound
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Role } from '@/context/AuthContext';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  can_access_accounting: boolean;
  can_access_hr: boolean;
  can_access_shipments: boolean;
  can_access_containers: boolean;
  can_access_analytics: boolean;
  can_access_settings: boolean;
  can_access_users: boolean;
}

type PermKey = keyof Omit<Profile, 'id' | 'name' | 'email' | 'role'>;

const PERM_KEYS: PermKey[] = [
  'can_access_shipments', 'can_access_containers', 'can_access_accounting',
  'can_access_hr', 'can_access_analytics', 'can_access_settings', 'can_access_users',
];

const PERM_LABELS: Record<PermKey, string> = {
  can_access_shipments: 'Shipments',
  can_access_containers: 'Containers',
  can_access_accounting: 'Accounting',
  can_access_hr: 'HR',
  can_access_analytics: 'Analytics',
  can_access_settings: 'Settings',
  can_access_users: 'Users',
};

const DEFAULT_PERMS: Record<PermKey, boolean> = {
  can_access_shipments: true, can_access_containers: true,
  can_access_accounting: false, can_access_hr: false,
  can_access_analytics: false, can_access_settings: false, can_access_users: false,
};

const ADMIN_PERMS: Record<PermKey, boolean> = {
  can_access_shipments: true, can_access_containers: true,
  can_access_accounting: true, can_access_hr: true,
  can_access_analytics: true, can_access_settings: true, can_access_users: true,
};

const CUSTOMER_PERMS: Record<PermKey, boolean> = {
  can_access_shipments: false, can_access_containers: false,
  can_access_accounting: false, can_access_hr: false,
  can_access_analytics: false, can_access_settings: false, can_access_users: false,
};

const DRIVER_PERMS: Record<PermKey, boolean> = {
  can_access_shipments: false, can_access_containers: false,
  can_access_accounting: false, can_access_hr: false,
  can_access_analytics: false, can_access_settings: false, can_access_users: false,
};

const ROLES = [
  { role: 'CUSTOMER' as NonNullable<Role>, desc: 'Customer portal only' },
  { role: 'STAFF'    as NonNullable<Role>, desc: 'Admin panel access' },
  { role: 'DRIVER'   as NonNullable<Role>, desc: 'Driver app access' },
  { role: 'ADMIN'    as NonNullable<Role>, desc: 'Full system access' },
];

export default function AdminUsersPage() {
  const [profiles, setProfiles]     = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [saved, setSaved]           = useState(false);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create form
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'STAFF' as NonNullable<Role>,
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '', role: 'STAFF' as NonNullable<Role>, newPassword: '',
  });

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('name');
    if (data) setProfiles(data as Profile[]);
    setLoading(false);
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  /* ─── Create ─── */
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      showMsg('error', 'Name, email and password are required.');
      return;
    }
    setCreating(true);

    const { data: { session: adminSession } } = await supabase.auth.getSession();

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { name: formData.name, role: formData.role } },
    });
    if (error) { showMsg('error', error.message); setCreating(false); return; }
    if (!data.user) { showMsg('error', 'Could not create auth user.'); setCreating(false); return; }

    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    const perms =
      formData.role === 'ADMIN'    ? ADMIN_PERMS :
      formData.role === 'CUSTOMER' ? CUSTOMER_PERMS :
      formData.role === 'DRIVER'   ? DRIVER_PERMS :
      DEFAULT_PERMS;

    const profile: Profile = {
      id: data.user.id, name: formData.name, email: formData.email,
      role: formData.role, ...perms,
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profile);
    setCreating(false);
    if (profileError) { showMsg('error', `Profile error: ${profileError.message}`); return; }

    setProfiles(prev => [...prev, profile].sort((a, b) => a.name.localeCompare(b.name)));
    setIsModalOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'STAFF' });
    showMsg('success', 'User created successfully.');
  };

  /* ─── Open edit modal ─── */
  const openEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditForm({ name: profile.name, role: profile.role as NonNullable<Role>, newPassword: '' });
  };

  /* ─── Save edit ─── */
  const handleSaveEdit = async () => {
    if (!editingProfile) return;
    if (!editForm.name.trim()) { showMsg('error', 'Name is required.'); return; }
    setSaving(true);

    // Compute new permissions based on role (only if role changed)
    const roleChanged = editForm.role !== editingProfile.role;
    const newPerms = roleChanged
      ? (editForm.role === 'ADMIN'    ? ADMIN_PERMS :
         editForm.role === 'CUSTOMER' ? CUSTOMER_PERMS :
         editForm.role === 'DRIVER'   ? DRIVER_PERMS :
         DEFAULT_PERMS)
      : undefined;

    const updates: Partial<Profile> = {
      name: editForm.name.trim(),
      role: editForm.role,
      ...(newPerms || {}),
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', editingProfile.id);
    if (error) { showMsg('error', error.message); setSaving(false); return; }

    // Optionally update password — only works if the admin is updating their own account
    // (Supabase anon key can't change other users' passwords; requires service role)
    if (editForm.newPassword && editForm.newPassword.length >= 6) {
      // We'll attempt it — it only works if this is the currently logged-in user
      const { error: pwErr } = await supabase.auth.updateUser({ password: editForm.newPassword });
      if (pwErr) {
        showMsg('error', `Profile saved but password not changed: ${pwErr.message}`);
        setSaving(false);
        setEditingProfile(null);
        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, ...updates } : p));
        return;
      }
    }

    setProfiles(prev =>
      prev.map(p => p.id === editingProfile.id ? { ...p, ...updates } : p)
         .sort((a, b) => a.name.localeCompare(b.name))
    );
    setSaving(false);
    setEditingProfile(null);
    showMsg('success', 'User updated successfully.');
  };

  /* ─── Delete ─── */
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Remove this user from the system? They will lose access.')) return;
    await supabase.from('profiles').delete().eq('id', id);
    setProfiles(prev => prev.filter(p => p.id !== id));
    showMsg('success', 'User removed.');
  };

  /* ─── Toggle permission ─── */
  const togglePermission = async (profile: Profile, key: PermKey) => {
    const newVal = !profile[key];
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, [key]: newVal } : p));
    await supabase.from('profiles').update({ [key]: newVal }).eq('id', profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleColor = (role: Role) => {
    if (role === 'ADMIN')    return 'bg-slate-900';
    if (role === 'DRIVER')   return 'bg-[var(--brand-blue)]';
    if (role === 'STAFF')    return 'bg-[var(--brand-orange)]';
    return 'bg-slate-400';
  };

  const roleBadge = (role: Role) => {
    if (role === 'ADMIN')    return 'bg-slate-100 text-slate-900';
    if (role === 'DRIVER')   return 'bg-blue-50 text-[var(--brand-blue)]';
    if (role === 'STAFF')    return 'bg-orange-50 text-[var(--brand-orange)]';
    return 'bg-slate-100 text-slate-500';
  };

  return (
    <main className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--brand-orange)] font-black text-xs uppercase tracking-widest bg-orange-50 w-fit px-4 py-2 rounded-full border border-orange-100 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> Identity & Access
            </div>
            <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Global <br /><span className="text-[var(--brand-orange)]">User Database</span></h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[var(--brand-orange)] transition-colors" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-16 pr-6 py-5 rounded-3xl outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-600 shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary w-full sm:w-auto py-5 px-10 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-sm"
            >
              <UserPlus className="w-5 h-5" /> New Member
            </button>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 italic">
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Details</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Module Access Permissions</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(profile => (
                    <tr key={profile.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black text-white shadow-xl ${roleColor(profile.role)}`}>
                            {profile.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-lg flex items-center gap-2 group-hover:text-[var(--brand-orange)] transition-colors">
                              {profile.name}
                              {profile.role === 'ADMIN' && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {profile.email}
                              </span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${roleBadge(profile.role)}`}>
                                {profile.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                          {PERM_KEYS.map(pk => {
                            const isActive = profile[pk] as boolean;
                            return (
                              <button
                                key={pk}
                                onClick={() => togglePermission(profile, pk)}
                                disabled={profile.role === 'ADMIN'}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm' : 'bg-white border-slate-100 text-slate-300'} ${profile.role === 'ADMIN' ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 active:scale-95'}`}
                              >
                                {PERM_LABELS[pk]}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(profile)}
                            className="p-4 rounded-2xl transition-all hover:bg-blue-50 text-slate-300 hover:text-[var(--brand-blue)] shadow-sm border border-transparent hover:border-blue-100"
                            title="Edit user"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(profile.id)}
                            disabled={profile.role === 'ADMIN'}
                            className={`p-4 rounded-2xl transition-all ${profile.role === 'ADMIN' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-red-50 text-slate-300 hover:text-red-500 shadow-sm border border-transparent hover:border-red-100'}`}
                            title="Delete user"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <ShieldAlert className="w-16 h-16 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400 uppercase italic">No members found</h3>
              <p className="text-slate-300 text-sm font-bold uppercase tracking-widest italic">Add a new team member to get started.</p>
            </div>
          )}
        </div>

        {/* ─── Create User Modal ─── */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">New Member <span className="text-[var(--brand-orange)]">Onboarding</span></h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Create a new system user</p>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); setFormData({ name: '', email: '', password: '', role: 'STAFF' }); }}
                      className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl flex items-center justify-center transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Juan Perez' },
                      { label: 'Email Address', key: 'email', type: 'email', placeholder: 'j.perez@tscouriers.com' },
                      { label: 'Temporary Password', key: 'password', type: 'password', placeholder: '••••••••' },
                    ].map(field => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={(formData as Record<string, string>)[field.key]}
                          onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold focus:bg-white outline-none transition-all"
                        />
                      </div>
                    ))}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Operational Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {ROLES.map(({ role, desc }) => (
                          <button
                            key={role}
                            onClick={() => setFormData(p => ({ ...p, role }))}
                            className={`py-4 px-4 rounded-xl text-left transition-all border-2 ${formData.role === role ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'}`}
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest">{role}</p>
                            <p className={`text-[9px] mt-0.5 ${formData.role === role ? 'text-slate-400' : 'text-slate-300'}`}>{desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => { setIsModalOpen(false); setFormData({ name: '', email: '', password: '', role: 'STAFF' }); }}
                      className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors">
                      Discard
                    </button>
                    <button onClick={handleCreateUser} disabled={creating}
                      className="flex-1 py-5 rounded-2xl bg-[var(--brand-orange)] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50">
                      {creating ? 'Creating...' : 'Authorize User'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Edit User Modal ─── */}
        <AnimatePresence>
          {editingProfile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 space-y-8">

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-xl font-black text-white ${roleColor(editingProfile.role)}`}>
                        {editingProfile.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Edit <span className="text-[var(--brand-orange)]">User</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {editingProfile.email}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setEditingProfile(null)}
                      className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl flex items-center justify-center transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold focus:bg-white outline-none transition-all"
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {ROLES.map(({ role, desc }) => (
                          <button
                            key={role}
                            onClick={() => setEditForm(p => ({ ...p, role }))}
                            disabled={role === 'ADMIN' && editingProfile.role !== 'ADMIN'}
                            className={`py-4 px-4 rounded-xl text-left transition-all border-2 ${editForm.role === role ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'} disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest">{role}</p>
                            <p className={`text-[9px] mt-0.5 ${editForm.role === role ? 'text-slate-400' : 'text-slate-300'}`}>{desc}</p>
                          </button>
                        ))}
                      </div>
                      {editForm.role !== editingProfile.role && (
                        <p className="text-[10px] font-bold text-amber-500 px-1">
                          ⚠ Role change will reset permissions to defaults for that role.
                        </p>
                      )}
                    </div>

                    {/* New password (only works for own account via anon key) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic flex items-center gap-2">
                        <KeyRound className="w-3 h-3" /> New Password <span className="font-bold normal-case text-slate-300">(leave blank to keep current)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••  (min 6 chars)"
                        value={editForm.newPassword}
                        onChange={e => setEditForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold focus:bg-white outline-none transition-all"
                      />
                      <p className="text-[9px] font-bold text-slate-300 px-1">
                        Password change only applies to your own account. For others, use Supabase Dashboard → Authentication.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setEditingProfile(null)}
                      className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} disabled={saving}
                      className="flex-1 py-5 rounded-2xl bg-[var(--brand-blue)] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permissions Saved toast */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 z-[200]">
              <Save className="w-5 h-5" />
              <span className="font-black uppercase italic tracking-tighter">Permissions Sync Successful!</span>
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
