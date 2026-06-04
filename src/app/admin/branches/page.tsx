'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Building2, MapPin, Phone, Plus, Search, Zap, Users, Globe, Trash2, Save, X, Edit3, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: string;
  name: string;
  type: string;
  address: string;
  country: string;
  contact: string;
  staff: number;
  status: string;
}

const EMPTY_BRANCH: Omit<Branch, 'id'> = {
  name: '', type: 'Warehouse', address: '', country: '', contact: '', staff: 0, status: 'Active',
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<{ open: boolean; branch: Branch | null }>({ open: false, branch: null });
  const [form, setForm] = useState(EMPTY_BRANCH);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchBranches(); }, []);

  const fetchBranches = async () => {
    setLoading(true);
    const { data } = await supabase.from('branches').select('*').order('name');
    if (data) setBranches(data as Branch[]);
    setLoading(false);
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY_BRANCH);
    setModal({ open: true, branch: null });
  };

  const openEdit = (branch: Branch) => {
    setForm({ name: branch.name, type: branch.type, address: branch.address, country: branch.country, contact: branch.contact, staff: branch.staff, status: branch.status });
    setModal({ open: true, branch });
  };

  const handleSave = async () => {
    if (!form.name || !form.address) { showMsg('error', 'Name and address are required.'); return; }
    setSaving(true);

    if (modal.branch) {
      const { error } = await supabase.from('branches').update(form).eq('id', modal.branch.id);
      if (error) { showMsg('error', error.message); setSaving(false); return; }
      setBranches(prev => prev.map(b => b.id === modal.branch!.id ? { ...b, ...form } : b));
      showMsg('success', 'Branch updated.');
    } else {
      const id = `BR-${Date.now().toString().slice(-5)}`;
      const newBranch: Branch = { id, ...form };
      const { error } = await supabase.from('branches').insert(newBranch);
      if (error) { showMsg('error', error.message); setSaving(false); return; }
      setBranches(prev => [...prev, newBranch].sort((a, b) => a.name.localeCompare(b.name)));
      showMsg('success', 'Branch added.');
    }

    setSaving(false);
    setModal({ open: false, branch: null });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    await supabase.from('branches').delete().eq('id', id);
    setBranches(prev => prev.filter(b => b.id !== id));
    showMsg('success', 'Branch deleted.');
  };

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStaff = branches.reduce((sum, b) => sum + (b.staff || 0), 0);
  const countries = new Set(branches.map(b => b.country).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Branch <span className="text-[var(--brand-orange)] font-black">Control</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Global Network & Logistics Hubs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search branches..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-56 font-bold text-sm" />
            </div>
            <button onClick={openCreate} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Branch
            </button>
          </div>
        </header>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><Globe className="w-6 h-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Countries</p>
            <h3 className="text-2xl font-black text-slate-900">{countries}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4"><Building2 className="w-6 h-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Branches</p>
            <h3 className="text-2xl font-black text-slate-900">{branches.length}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4"><Users className="w-6 h-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Personnel</p>
            <h3 className="text-2xl font-black text-slate-900">{totalStaff}</h3>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <Zap className="w-20 h-20 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 italic">Network Health</p>
            <h3 className="text-2xl font-black italic tracking-tighter">Excellent</h3>
          </div>
        </div>

        {/* Branches Grid */}
        {loading ? (
          <div className="bg-white p-20 rounded-[3rem] text-center text-slate-400 font-bold uppercase tracking-widest">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filtered.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-xl border-2 border-slate-100 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-all">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 italic uppercase underline decoration-[var(--brand-orange)] decoration-4 underline-offset-4">{branch.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{branch.type} — {branch.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 text-[10px] font-black uppercase italic tracking-widest">
                      {branch.status}
                    </span>
                    <button onClick={() => openEdit(branch)} className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-slate-300 hover:text-[var(--brand-blue)]">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(branch.id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-300 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-slate-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Physical Location</p>
                      <p className="text-sm font-black text-slate-800 italic uppercase tracking-tighter">{branch.address}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{branch.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-slate-300" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Line</p>
                      <p className="font-black text-slate-800 italic uppercase tracking-tighter text-sm">{branch.contact || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase italic">
                    <Users className="w-4 h-4" />
                    <span>{branch.staff} Management Personnel</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-2 bg-white p-20 rounded-[3rem] text-center text-slate-400 font-bold uppercase tracking-widest">
                No branches found. Add your first branch.
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {modal.open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900 italic uppercase">
                      {modal.branch ? 'Edit' : 'New'} <span className="text-[var(--brand-orange)]">Branch</span>
                    </h2>
                    <button onClick={() => setModal({ open: false, branch: null })} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Branch Name', key: 'name', type: 'text', placeholder: 'London HQ', full: true },
                      { label: 'Type', key: 'type', type: 'text', placeholder: 'Main Hub' },
                      { label: 'Country', key: 'country', type: 'text', placeholder: 'United Kingdom' },
                      { label: 'Contact', key: 'contact', type: 'text', placeholder: '+44 20 7123 4567' },
                      { label: 'Staff Count', key: 'staff', type: 'number', placeholder: '0' },
                      { label: 'Status', key: 'status', type: 'text', placeholder: 'Active' },
                    ].map(f => (
                      <div key={f.key} className={`space-y-2 ${(f as any).full ? 'col-span-2' : ''}`}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:bg-white transition-all" />
                      </div>
                    ))}
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                      <input type="text" placeholder="12 Canary Wharf, London, E14 5AB" value={form.address}
                        onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:bg-white transition-all" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setModal({ open: false, branch: null })}
                      className="flex-grow py-4 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-grow py-4 rounded-2xl bg-[var(--brand-orange)] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : modal.branch ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
