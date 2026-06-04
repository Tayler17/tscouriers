'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Plus, Search, X, Save, Edit3, Trash2, Handshake,
  Phone, Mail, MapPin, Globe, ChevronRight, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Partner {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  contact_name: string;
  phone: string;
  email: string;
  specialties: string;
  commission: number;
  status: string;
  notes: string;
}

const TYPES = ['Freight Agent', 'Customs Broker', 'Local Courier', 'Air Cargo', 'Ocean Carrier', 'Warehouse', 'Last-Mile Delivery'];
const EMPTY: Omit<Partner, 'id'> = {
  name: '', type: 'Freight Agent', country: '', city: '',
  contact_name: '', phone: '', email: '',
  specialties: '', commission: 0, status: 'Active', notes: '',
};

const labelCls = 'text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block';
const inputCls = 'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all';

function statusBadge(s: string) {
  if (s === 'Active')   return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (s === 'Inactive') return 'bg-slate-100 text-slate-400 border-slate-200';
  return 'bg-orange-50 text-orange-500 border-orange-100';
}

export default function PartnersPage() {
  const [partners, setPartners]           = useState<Partner[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Add modal
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState(EMPTY);
  const [savingAdd, setSavingAdd] = useState(false);

  // Edit modal
  const [showEdit, setShowEdit]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState(EMPTY);
  const [savingEdit, setSavingEdit] = useState(false);

  // Detail panel
  const [selected, setSelected] = useState<Partner | null>(null);

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    setLoading(true);
    const { data } = await supabase.from('partners').select('*').order('name');
    if (data) setPartners(data as Partner[]);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!addForm.name) return;
    setSavingAdd(true);
    const id = `PRT-${Date.now().toString().slice(-5)}`;
    const row = { id, ...addForm };
    await supabase.from('partners').insert(row);
    setPartners(prev => [...prev, row].sort((a, b) => a.name.localeCompare(b.name)));
    setAddForm(EMPTY);
    setShowAdd(false);
    setSavingAdd(false);
  };

  const openEdit = (p: Partner) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, type: p.type, country: p.country, city: p.city, contact_name: p.contact_name, phone: p.phone, email: p.email, specialties: p.specialties, commission: p.commission, status: p.status, notes: p.notes });
    setShowEdit(true);
    setActiveActionId(null);
  };

  const handleEdit = async () => {
    if (!editingId || !editForm.name) return;
    setSavingEdit(true);
    await supabase.from('partners').update(editForm).eq('id', editingId);
    setPartners(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } : p));
    if (selected?.id === editingId) setSelected(prev => prev ? { ...prev, ...editForm } : null);
    setShowEdit(false);
    setEditingId(null);
    setSavingEdit(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner?')) return;
    await supabase.from('partners').delete().eq('id', id);
    setPartners(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
    setActiveActionId(null);
  };

  const filtered = partners.filter(p => {
    const q = searchTerm.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.country.toLowerCase().includes(q) && !p.contact_name.toLowerCase().includes(q)) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    return true;
  });

  const FormFields = ({ form, setForm }: { form: typeof EMPTY; setForm: (f: typeof EMPTY) => void }) => (
    <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Company Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Partner Logistics SL" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
            {['Active', 'Inactive', 'Preferred'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Dominican Republic" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Santo Domingo" className={inputCls} />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Contact Name</label>
          <input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder="Juan Pérez" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 809 000 0000" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="partner@company.com" className={inputCls} />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Specialties / Services</label>
          <input value={form.specialties} onChange={e => setForm({ ...form, specialties: e.target.value })} placeholder="Customs clearance, Last-mile delivery, Cold chain" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Commission (%)</label>
          <input type="number" min={0} max={100} value={form.commission} onChange={e => setForm({ ...form, commission: parseFloat(e.target.value) || 0 })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Internal Notes</label>
          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Reliable for last-mile in SDQ" className={inputCls} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-6">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Partner <span className="text-[var(--brand-orange)]">Network</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Agents & Subcontractors</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search partners..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-56 font-bold text-sm focus:bg-white transition-all" />
            </div>
            <button onClick={() => { setAddForm(EMPTY); setShowAdd(true); }} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Partner
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Partners', value: partners.length, color: 'text-slate-900' },
            { label: 'Active', value: partners.filter(p => p.status === 'Active').length, color: 'text-emerald-600' },
            { label: 'Preferred', value: partners.filter(p => p.status === 'Preferred').length, color: 'text-[var(--brand-orange)]' },
            { label: 'Inactive', value: partners.filter(p => p.status === 'Inactive').length, color: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Type filter chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTypeFilter('')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${!typeFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}>All</button>
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${typeFilter === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}>{t}</button>
          ))}
        </div>

        {/* Partners grid + detail */}
        <div className={`grid gap-6 ${selected ? 'grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>

          {/* Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <th className="px-8 py-4">Partner</th>
                    <th className="px-8 py-4">Location</th>
                    <th className="px-8 py-4">Contact</th>
                    <th className="px-8 py-4">Commission</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-300 font-bold text-sm uppercase tracking-widest">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-300 font-bold text-sm uppercase tracking-widest">No partners found</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)} className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${selected?.id === p.id ? 'bg-orange-50/30' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">{p.name.charAt(0)}</div>
                          <div>
                            <p className="font-black text-slate-900 text-sm uppercase italic">{p.name}</p>
                            <p className="text-[10px] font-bold text-[var(--brand-orange)] uppercase tracking-widest">{p.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <span className="text-xs font-bold">{[p.city, p.country].filter(Boolean).join(', ') || '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{p.contact_name || '—'}</p>
                          {p.phone && <p className="text-[10px] font-bold text-slate-400">{p.phone}</p>}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-slate-900">{p.commission > 0 ? `${p.commission}%` : '—'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${statusBadge(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEdit(p)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-[var(--brand-blue)] transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button onClick={() => setActiveActionId(activeActionId === p.id ? null : p.id)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {activeActionId === p.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveActionId(null)} />
                                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden text-left">
                                    <div className="p-2 space-y-1">
                                      <button onClick={() => openEdit(p)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2"><Edit3 className="w-3 h-3" />Edit</button>
                                      {(['Active', 'Inactive', 'Preferred'] as const).filter(s => s !== p.status).map(s => (
                                        <button key={s} onClick={async () => { await supabase.from('partners').update({ status: s }).eq('id', p.id); setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: s } : x)); setActiveActionId(null); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase italic tracking-tighter">Set {s}</button>
                                      ))}
                                      <div className="h-px bg-slate-100 my-1" />
                                      <button onClick={() => handleDelete(p.id)} className="w-full text-left px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase italic tracking-tighter">Delete</button>
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 self-start sticky top-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--brand-orange)]/10 flex items-center justify-center font-black text-[var(--brand-orange)] text-2xl">{selected.name.charAt(0)}</div>
                  <button onClick={() => setSelected(null)} className="p-2 text-slate-300 hover:text-slate-500 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{selected.name}</h3>
                <p className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-widest mt-1">{selected.type}</p>

                <span className={`mt-3 inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase border ${statusBadge(selected.status)}`}>{selected.status}</span>

                <div className="mt-6 space-y-3">
                  {selected.city || selected.country ? (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="font-bold">{[selected.city, selected.country].filter(Boolean).join(', ')}</span>
                    </div>
                  ) : null}
                  {selected.contact_name && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Globe className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="font-bold">{selected.contact_name}</span>
                    </div>
                  )}
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-[var(--brand-blue)] transition-colors">
                      <Phone className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="font-bold">{selected.phone}</span>
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-[var(--brand-blue)] transition-colors">
                      <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="font-bold">{selected.email}</span>
                    </a>
                  )}
                </div>

                {selected.specialties && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Specialties</p>
                    <p className="text-xs font-bold text-slate-700">{selected.specialties}</p>
                  </div>
                )}

                {selected.commission > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-2xl">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Commission Rate</p>
                    <p className="text-2xl font-black text-[var(--brand-orange)] mt-1">{selected.commission}%</p>
                  </div>
                )}

                {selected.notes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-xs font-bold text-blue-700">{selected.notes}</p>
                  </div>
                )}

                <button onClick={() => openEdit(selected)} className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-2">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Partner
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">New <span className="text-[var(--brand-orange)]">Partner</span></h2>
                <button onClick={() => setShowAdd(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <FormFields form={addForm} setForm={setAddForm} />
              <button onClick={handleAdd} disabled={savingAdd || !addForm.name} className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <Save className="w-4 h-4" /> {savingAdd ? 'Saving...' : 'Add Partner'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEdit(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Edit <span className="text-[var(--brand-orange)]">Partner</span></h2>
                <button onClick={() => setShowEdit(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <FormFields form={editForm} setForm={setEditForm} />
              <button onClick={handleEdit} disabled={savingEdit || !editForm.name} className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <Save className="w-4 h-4" /> {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
