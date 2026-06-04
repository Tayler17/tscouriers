'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { MapPin, Clock, Truck, Search, Package, Plus, ArrowRight, Navigation, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  type: string;
  duration: string;
  frequency: string;
  status: string;
}

const EMPTY: Omit<Route, 'id'> = { name: '', origin: '', destination: '', type: 'Sea', duration: '', frequency: 'Monthly', status: 'Active' };

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    const { data } = await supabase.from('routes').select('*').order('id');
    if (data) setRoutes(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.origin || !form.destination) return;
    setSaving(true);
    const id = `RTE-${Date.now().toString().slice(-3)}`;
    await supabase.from('routes').insert({ id, ...form });
    setRoutes(prev => [...prev, { id, ...form }]);
    setForm(EMPTY);
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    await supabase.from('routes').delete().eq('id', id);
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === 'Active') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'Seasonal') return 'bg-orange-50 text-orange-600 border-orange-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Fleet <span className="text-[var(--brand-orange)] font-black">Routing</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Shipping Route Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search Route..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm" />
            </div>
            <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Route
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-slate-900">{routes.length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Total Routes</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-emerald-500">{routes.filter(r => r.status === 'Active').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-blue-500">{routes.filter(r => r.type === 'Sea').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Sea Routes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center text-slate-400 font-bold border border-slate-100">Loading routes...</div>
          ) : filtered.map((route, i) => (
            <motion.div key={route.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Route ID: {route.id}</p>
                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">{route.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border ${statusColor(route.status)}`}>{route.status}</span>
                  <button onClick={() => handleDelete(route.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">From</p>
                  <p className="font-black text-slate-900 text-sm">{route.origin}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">To</p>
                  <p className="font-black text-slate-900 text-sm">{route.destination}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                  <p className="font-black text-slate-900 text-sm">{route.duration || '—'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                  <p className="font-black text-slate-900 text-sm">{route.frequency}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">New <span className="text-[var(--brand-orange)]">Route</span></h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {([
                  { key: 'name', label: 'Route Name *', ph: 'London → Santo Domingo' },
                  { key: 'origin', label: 'Origin *', ph: 'London, UK' },
                  { key: 'destination', label: 'Destination *', ph: 'Santo Domingo, DR' },
                  { key: 'duration', label: 'Duration', ph: '18-22 days' },
                ] as { key: keyof typeof EMPTY; label: string; ph: string }[]).map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{f.label}</label>
                    <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4">
                  {([
                    { key: 'type', label: 'Type', opts: ['Sea', 'Air', 'Land'] },
                    { key: 'frequency', label: 'Frequency', opts: ['Weekly', 'Bi-weekly', 'Monthly'] },
                    { key: 'status', label: 'Status', opts: ['Active', 'Seasonal', 'Inactive'] },
                  ] as { key: keyof typeof EMPTY; label: string; opts: string[] }[]).map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{f.label}</label>
                      <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button onClick={handleSave} disabled={saving || !form.name || !form.origin || !form.destination} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Create Route'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
