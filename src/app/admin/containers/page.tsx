'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Plus, Search, Filter, MoreVertical, Anchor, Plane, Package,
  X, Save, Edit3, Calendar, Eye, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';

const STATUSES = ['Loading', 'Ready to Ship', 'In Transit', 'At Port', 'Delivered'];
const EMPTY = { vessel: '', flight: '-', destination: 'SDQ - Haina', type: '40ft', status: 'Loading', date: new Date().toISOString().split('T')[0] };

type ContainerForm = typeof EMPTY;

export default function ContainersPage() {
  const { containers, shipments, addContainer, deleteContainer, updateContainer } = useData();
  const [searchTerm, setSearchTerm]         = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [showModal, setShowModal]           = useState(false);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [form, setForm]                     = useState<ContainerForm>(EMPTY);
  const [saving, setSaving]                 = useState(false);
  const [viewContentsId, setViewContentsId] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (id: string) => {
    const c = containers.find(c => c.id === id);
    if (!c) return;
    setEditingId(id);
    setForm({ vessel: c.vessel, flight: c.flight, destination: c.destination, type: c.type, status: c.status, date: c.date });
    setShowModal(true);
    setActiveActionId(null);
  };

  const handleSave = async () => {
    if (!form.vessel && form.flight === '-') return;
    setSaving(true);
    if (editingId) {
      await updateContainer(editingId, form);
    } else {
      const id = `CONT-${Date.now().toString().slice(-4)}`;
      await addContainer({ id, ...form, count: 0 });
    }
    setForm(EMPTY);
    setShowModal(false);
    setEditingId(null);
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this container?')) { deleteContainer(id); setActiveActionId(null); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateContainer(id, { status });
    setActiveActionId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit':    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Loading':       return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Ready to Ship': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Delivered':     return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'At Port':       return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:              return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const filtered = containers.filter(c => {
    if (searchTerm && !c.id.toLowerCase().includes(searchTerm.toLowerCase()) && !c.vessel.toLowerCase().includes(searchTerm.toLowerCase()) && !c.flight.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (dateFrom && c.date < dateFrom) return false;
    if (dateTo && c.date > dateTo) return false;
    return true;
  });

  const viewingContainer = viewContentsId ? containers.find(c => c.id === viewContentsId) : null;
  const containerShipments = viewContentsId
    ? shipments.filter(s => s.metadata?.container_id === viewContentsId)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-8">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Container <span className="text-[var(--brand-orange)] font-black">Hold</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Consolidation & Manifest Control</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search ID, Vessel..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all" />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest ${showFilters || dateFrom || dateTo ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
            >
              <Filter className="w-4 h-4" /> Filter {(dateFrom || dateTo) && <span className="w-2 h-2 rounded-full bg-[var(--brand-orange)] -mr-1" />}
            </button>
            <button onClick={openAdd} className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 text-sm shadow-xl shadow-orange-500/10">
              <Plus className="w-4 h-4" /> New Container
            </button>
          </div>
        </header>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-end gap-4">
                  <Calendar className="w-4 h-4 text-slate-400 mb-3 flex-shrink-0" />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <span className="text-slate-300 font-bold mb-3">→</span>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="mb-3 text-[10px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors">Clear</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeWidth="2"/></svg>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Containers</p>
            <h3 className="text-2xl font-black text-slate-900">{containers.filter(c => c.status !== 'Delivered').length}</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4"><Anchor className="w-5 h-5" /></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Route (Sea)</p>
            <h3 className="text-2xl font-black text-slate-900">{containers.filter(c => c.status === 'In Transit' && c.vessel !== '-').length}</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4"><Plane className="w-5 h-5" /></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Route (Air)</p>
            <h3 className="text-2xl font-black text-slate-900">{containers.filter(c => c.status === 'In Transit' && c.flight !== '-').length}</h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4"><Package className="w-5 h-5" /></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Containers</p>
            <h3 className="text-2xl font-black text-slate-900">{containers.length}</h3>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-100 bg-white">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Manifest <span className="text-[var(--brand-orange)] font-black">Archive</span></h3>
              <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">{filtered.length} Containers</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">ID / Type</th>
                  <th className="px-8 py-4">Vessel / Flight</th>
                  <th className="px-8 py-4">Destination</th>
                  <th className="px-8 py-4">Items</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No containers found</td></tr>
                ) : filtered.map(container => (
                  <tr key={container.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{container.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{container.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {container.vessel !== '-' ? <Anchor className="w-3.5 h-3.5 text-blue-500" /> : <Plane className="w-3.5 h-3.5 text-purple-500" />}
                        <span className="text-xs font-black text-slate-700 uppercase italic tracking-tighter">{container.vessel !== '-' ? container.vessel : container.flight}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6"><span className="text-xs font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{container.destination}</span></td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => setViewContentsId(container.id)}
                        className="flex items-center gap-2 hover:text-[var(--brand-blue)] transition-colors group/btn"
                      >
                        <span className="text-sm font-black text-slate-900 group-hover/btn:text-[var(--brand-blue)]">{container.count}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Items</span>
                        <Eye className="w-3 h-3 text-slate-300 group-hover/btn:text-[var(--brand-blue)] ml-1" />
                      </button>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">{container.date}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(container.status)}`}>{container.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button onClick={() => setActiveActionId(activeActionId === container.id ? null : container.id)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {activeActionId === container.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveActionId(null)} />
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden text-left">
                                  <div className="p-2 space-y-1">
                                    <button
                                      onClick={() => { setViewContentsId(container.id); setActiveActionId(null); }}
                                      className="w-full text-left px-4 py-2 text-xs font-bold text-[var(--brand-blue)] hover:bg-blue-50 rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2"
                                    >
                                      <Eye className="w-3 h-3" /> View Contents
                                    </button>
                                    <button
                                      onClick={() => openEdit(container.id)}
                                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)] rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2"
                                    >
                                      <Edit3 className="w-3 h-3" /> Edit Container
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <p className="px-4 pt-1 pb-1 text-[9px] font-black text-slate-300 uppercase tracking-widest">Update Status</p>
                                    {STATUSES.map(s => (
                                      <button key={s} onClick={() => handleUpdateStatus(container.id, s)} className={`w-full text-left px-4 py-1.5 text-xs font-bold rounded-xl transition-all uppercase italic tracking-tighter ${container.status === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)]'}`}>{s}</button>
                                    ))}
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button onClick={() => handleDelete(container.id)} className="w-full text-left px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase italic tracking-tighter">Delete Container</button>
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
      </main>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">{editingId ? 'Edit' : 'New'} <span className="text-[var(--brand-orange)]">Container</span></h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Vessel Name *</label>
                  <input type="text" value={form.vessel} onChange={e => setForm(p => ({ ...p, vessel: e.target.value }))} placeholder="MSC FABIENNE" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Flight No. (leave "-" for sea)</label>
                  <input type="text" value={form.flight} onChange={e => setForm(p => ({ ...p, flight: e.target.value }))} placeholder="-" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Destination</label>
                  <input type="text" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="SDQ - Haina" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                      {['20ft', '40ft', '40ft HC', 'Air'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold" />
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving || !form.vessel} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Container')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Contents Modal */}
      <AnimatePresence>
        {viewContentsId && viewingContainer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewContentsId(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl z-10 p-10 relative max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-start mb-6 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-black italic uppercase">Container <span className="text-[var(--brand-orange)]">{viewingContainer.id}</span></h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{viewingContainer.vessel} · {viewingContainer.destination} · {viewingContainer.type}</p>
                </div>
                <button onClick={() => setViewContentsId(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>

              <div className="overflow-y-auto flex-grow">
                {containerShipments.length === 0 ? (
                  <div className="py-16 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No shipments linked to this container</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Consolidate shipments from the Shipments page</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{containerShipments.length} Shipments in this container</p>
                    {containerShipments.map(s => (
                      <div key={s.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-slate-900 text-sm">{s.id}</span>
                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              s.status === 'Delivered' ? 'bg-emerald-50 text-emerald-500 border-emerald-200' :
                              s.status === 'Ready to Ship' ? 'bg-orange-50 text-orange-500 border-orange-200' :
                              'bg-blue-50 text-blue-500 border-blue-200'
                            }`}>{s.status}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">{s.customer}</p>
                          <p className="text-[10px] font-bold text-slate-400">{s.type} · {s.destination}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-700">{s.weight}</p>
                          <p className="text-[10px] font-bold text-slate-400">{s.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
