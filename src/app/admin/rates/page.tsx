'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Search, Plus, Edit3, Trash2, Anchor, Plane, Truck, Info,
  X, Save, MapPin, Globe, Tag, ArrowRight, AlertTriangle, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────────
interface Rate {
  id: string;
  item: string;
  type: string;
  origin: string;
  destination: string;
  rate: string;
  status: string;
  zone_id?: string;
  category?: string;
}

interface Zone {
  id: string;
  name: string;
  origin_country: string;
  origin_keywords: string;
  dest_country: string;
  dest_keywords: string;
}

interface RateForm {
  item: string;
  type: string;
  zone_ids: string[];
  rate: string;
  unit: string;
  status: string;
  category: string;
}

interface ZoneForm {
  name: string;
  origin_country: string;
  origin_keywords: string;
  dest_country: string;
  dest_keywords: string;
}

// ── Constants ────────────────────────────────────────────────────
const RATE_TYPES = ['Sea Freight', 'Air Freight', 'Road Freight', 'London Courier', 'Express'];
const RATE_UNITS = ['per kg', 'per barrel', 'per box', 'per CBM', 'per pallet', 'flat rate'];
const COUNTRIES  = ['United Kingdom', 'Dominican Republic', 'Spain', 'France', 'United States', 'Germany', 'Netherlands', 'Other'];
const ITEM_CATEGORIES = [
  { id: '', label: '— No category —' },
  { id: 'storage',      label: 'Barrels & Boxes (Shipping)' },
  { id: 'living-room',  label: 'Living Room Furniture' },
  { id: 'bedroom',      label: 'Bedroom Furniture' },
  { id: 'dining-room',  label: 'Dining Furniture' },
  { id: 'kitchen',      label: 'Kitchen Appliances' },
  { id: 'bathroom',     label: 'Bathroom Items' },
  { id: 'office',       label: 'Office Furniture' },
  { id: 'vehicle',      label: 'Vehicle Parts' },
];

const EMPTY_RATE: RateForm = { item: '', type: 'Sea Freight', zone_ids: [], rate: '', unit: 'per barrel', status: 'Active', category: '' };
const EMPTY_ZONE: ZoneForm = { name: '', origin_country: 'United Kingdom', origin_keywords: '', dest_country: 'Dominican Republic', dest_keywords: '' };

// ── Component ────────────────────────────────────────────────────
export default function RatesPage() {
  const [activeTab, setActiveTab]         = useState<'tariffs' | 'zones'>('tariffs');
  const [rates, setRates]                 = useState<Rate[]>([]);
  const [zones, setZones]                 = useState<Zone[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [typeFilter, setTypeFilter]       = useState('All');

  // Rate modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRate, setEditingRate]     = useState<Rate | null>(null);
  const [rateForm, setRateForm]           = useState<RateForm>(EMPTY_RATE);
  const [savingRate, setSavingRate]       = useState(false);

  // Zone modal
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone]     = useState<Zone | null>(null);
  const [zoneForm, setZoneForm]           = useState<ZoneForm>(EMPTY_ZONE);
  const [savingZone, setSavingZone]       = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [rRes, zRes] = await Promise.all([
      supabase.from('rates').select('*').order('id'),
      supabase.from('rate_zones').select('*').order('name'),
    ]);
    if (rRes.data) setRates(rRes.data as Rate[]);
    if (zRes.data) setZones(zRes.data as Zone[]);
    setLoading(false);
  };

  // ── Zone CRUD ──────────────────────────────────────────────────
  const openAddZone = () => { setEditingZone(null); setZoneForm(EMPTY_ZONE); setShowZoneModal(true); };
  const openEditZone = (z: Zone) => {
    setEditingZone(z);
    setZoneForm({ name: z.name, origin_country: z.origin_country, origin_keywords: z.origin_keywords, dest_country: z.dest_country, dest_keywords: z.dest_keywords });
    setShowZoneModal(true);
  };
  const [zoneError, setZoneError] = useState('');

  const handleSaveZone = async () => {
    if (!zoneForm.name) return;
    setSavingZone(true);
    setZoneError('');
    const newId = `ZONE-${Date.now().toString().slice(-5)}`;
    try {
      console.log('[Zone] Saving...', { editingZone, zoneForm, newId });

      // 10-second timeout wrapper
      const withTimeout = <T,>(p: Promise<T>): Promise<T> =>
        Promise.race([
          p,
          new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Request timed out after 10s — check Supabase connection')), 10000)),
        ]);

      if (editingZone) {
        const { error } = await withTimeout(supabase.from('rate_zones').update(zoneForm).eq('id', editingZone.id));
        console.log('[Zone] Update result error:', error);
        if (error) throw error;
        setZones(prev => prev.map(z => z.id === editingZone.id ? { ...z, ...zoneForm } : z));
      } else {
        const { error } = await withTimeout(supabase.from('rate_zones').insert({ id: newId, ...zoneForm }));
        console.log('[Zone] Insert result error:', error);
        if (error) throw error;
        setZones(prev => [...prev, { id: newId, ...zoneForm }]);
      }
      setShowZoneModal(false);
      setEditingZone(null);
    } catch (err: any) {
      console.error('[Zone] Caught error:', err);
      setZoneError(err?.message || 'Save failed. Check the rate_zones table exists in Supabase.');
    } finally {
      setSavingZone(false);
    }
  };
  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone? Existing tariffs will keep the zone name as text.')) return;
    await supabase.from('rate_zones').delete().eq('id', id);
    setZones(prev => prev.filter(z => z.id !== id));
  };

  // ── Rate CRUD ──────────────────────────────────────────────────
  const openAddRate = () => { setEditingRate(null); setRateForm(EMPTY_RATE); setShowRateModal(true); };
  const openEditRate = (r: Rate) => {
    const [rateVal, unitVal] = (r.rate || '').split(' / ');
    const existingIds: string[] = Array.isArray((r as any).zone_ids)
      ? (r as any).zone_ids
      : zones.filter(z => z.name === r.origin).map(z => z.id);
    setEditingRate(r);
    setRateForm({ item: r.item, type: r.type, zone_ids: existingIds, rate: rateVal || r.rate, unit: unitVal || 'per barrel', status: r.status, category: r.category || '' });
    setShowRateModal(true);
  };
  const [rateError, setRateError] = useState('');

  const handleSaveRate = async () => {
    if (!rateForm.item || !rateForm.rate || rateForm.zone_ids.length === 0) return;
    setSavingRate(true);
    setRateError('');
    try {
      const assignedZones = zones.filter(z => rateForm.zone_ids.includes(z.id));
      const payload = {
        item:        rateForm.item,
        type:        rateForm.type,
        origin:      assignedZones.map(z => z.name).join(', '),
        destination: [...new Set(assignedZones.map(z => z.dest_country))].join(', '),
        rate:        `${rateForm.rate} / ${rateForm.unit}`,
        status:      rateForm.status,
        zone_ids:    rateForm.zone_ids,
        category:    rateForm.category || null,
      };
      if (editingRate) {
        const { error } = await supabase.from('rates').update(payload).eq('id', editingRate.id);
        if (error) throw error;
        setRates(prev => prev.map(r => r.id === editingRate.id ? { ...r, ...payload } : r));
      } else {
        const id = `RT-${Date.now().toString().slice(-5)}`;
        const { error } = await supabase.from('rates').insert({ id, ...payload });
        if (error) throw error;
        setRates(prev => [...prev, { id, ...payload }]);
      }
      setShowRateModal(false);
      setEditingRate(null);
    } catch (err: any) {
      setRateError(err?.message || 'Save failed. Check the rates table schema.');
    } finally {
      setSavingRate(false);
    }
  };
  const deleteRate = async (id: string) => {
    if (!confirm('Delete this tariff?')) return;
    await supabase.from('rates').delete().eq('id', id);
    setRates(prev => prev.filter(r => r.id !== id));
  };

  // ── Helpers ────────────────────────────────────────────────────
  const filtered = rates.filter(r => {
    const q = searchTerm.toLowerCase();
    return (r.item.toLowerCase().includes(q) || r.origin.toLowerCase().includes(q))
      && (typeFilter === 'All' || r.type === typeFilter);
  });

  const typeIcon = (type: string) => {
    if (type === 'Sea Freight' || type === 'Road Freight') return <Anchor className="w-3.5 h-3.5 text-blue-500" />;
    if (type === 'Air Freight' || type === 'Express')      return <Plane  className="w-3.5 h-3.5 text-purple-500" />;
    return <Truck className="w-3.5 h-3.5 text-amber-500" />;
  };

  const inputCls = "w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all";
  const labelCls = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block";

  const selectedZones = zones.filter(z => rateForm.zone_ids.includes(z.id));
  const toggleZone = (id: string) =>
    setRateForm(p => ({
      ...p,
      zone_ids: p.zone_ids.includes(id) ? p.zone_ids.filter(z => z !== id) : [...p.zone_ids, id],
    }));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Freight <span className="text-[var(--brand-orange)] font-black">Rates</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{zones.length} route zones · {rates.length} tariffs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              <button onClick={() => setActiveTab('tariffs')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeTab === 'tariffs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Anchor className="w-3 h-3" /> Tariffs
              </button>
              <button onClick={() => setActiveTab('zones')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeTab === 'zones' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Globe className="w-3 h-3" /> Zones
              </button>
            </div>
            {activeTab === 'tariffs'
              ? <button onClick={openAddRate} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Tariff</button>
              : <button onClick={openAddZone} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Zone</button>
            }
          </div>
        </header>

        {/* Stats banner */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Route-Based <span className="text-[var(--brand-orange)]">Pricing</span></h2>
              <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">Zone = Origin cities + Destination cities → assign rates per item</p>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              {[
                { label: 'Zones',       count: zones.length, icon: <Globe  className="w-5 h-5 text-emerald-400 mx-auto mb-1" /> },
                { label: 'Sea / Road',  count: rates.filter(r => r.type === 'Sea Freight' || r.type === 'Road Freight').length, icon: <Anchor className="w-5 h-5 text-blue-400 mx-auto mb-1" /> },
                { label: 'Air / Exp',   count: rates.filter(r => r.type === 'Air Freight' || r.type === 'Express').length, icon: <Plane  className="w-5 h-5 text-purple-400 mx-auto mb-1" /> },
                { label: 'Courier',     count: rates.filter(r => r.type === 'London Courier').length, icon: <Truck  className="w-5 h-5 text-amber-400 mx-auto mb-1" /> },
              ].map(s => (
                <div key={s.label} className="bg-white/10 p-6 rounded-[2.5rem] border border-white/5 text-center min-w-[90px]">
                  {s.icon}
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                  <p className="text-xl font-black italic text-white">{s.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ZONES TAB ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'zones' && (
            <motion.div key="zones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 italic uppercase">Route <span className="text-[var(--brand-orange)]">Zones</span></h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Each zone defines a collection of origin cities/postcodes → destination cities. Assign tariffs to a zone.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                  {loading ? (
                    <div className="col-span-2 text-center py-12 text-slate-400 font-bold uppercase text-xs tracking-widest">Loading...</div>
                  ) : zones.length === 0 ? (
                    <div className="col-span-2 text-center py-16">
                      <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-6">No zones yet. Create your first route zone.</p>
                      <button onClick={openAddZone} className="btn-primary py-3 px-8 rounded-xl text-sm">Create First Zone</button>
                    </div>
                  ) : zones.map((zone, i) => {
                    const rateCount = rates.filter(r => (Array.isArray((r as any).zone_ids) ? (r as any).zone_ids.includes(zone.id) : r.origin === zone.name)).length;
                    return (
                      <motion.div key={zone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <p className="font-black text-slate-900 italic uppercase tracking-tighter text-lg">{zone.name}</p>
                            {rateCount > 0 && (
                              <span className="px-2.5 py-1 bg-orange-50 text-orange-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{rateCount} tariff{rateCount > 1 ? 's' : ''}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditZone(zone)} className="p-2 bg-white rounded-lg hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteZone(zone.id)} className="p-2 bg-white rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>

                        {/* Origin → Destination visual */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                          <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Origin</p>
                            <p className="text-[10px] font-black text-blue-900 uppercase">{zone.origin_country}</p>
                            {zone.origin_keywords && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {zone.origin_keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5).map(kw => (
                                  <span key={kw} className="px-1.5 py-0.5 bg-blue-100 rounded text-[8px] font-black text-blue-600 uppercase">{kw}</span>
                                ))}
                                {zone.origin_keywords.split(',').length > 5 && (
                                  <span className="px-1.5 py-0.5 bg-blue-200 rounded text-[8px] font-black text-blue-500">+{zone.origin_keywords.split(',').length - 5}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-center pt-6">
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                          </div>

                          <div className="bg-orange-50 rounded-xl p-3">
                            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Destination</p>
                            <p className="text-[10px] font-black text-orange-900 uppercase">{zone.dest_country}</p>
                            {zone.dest_keywords && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {zone.dest_keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5).map(kw => (
                                  <span key={kw} className="px-1.5 py-0.5 bg-orange-100 rounded text-[8px] font-black text-orange-600 uppercase">{kw}</span>
                                ))}
                                {zone.dest_keywords.split(',').length > 5 && (
                                  <span className="px-1.5 py-0.5 bg-orange-200 rounded text-[8px] font-black text-orange-500">+{zone.dest_keywords.split(',').length - 5}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{zone.id}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* How it works info box */}
              <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5" /></div>
                  <div>
                    <p className="font-black text-blue-900 uppercase italic tracking-tighter mb-3">How zone-based rates work</p>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      <div className="bg-blue-100 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-blue-500 uppercase">Zone</p>
                        <p className="font-black text-blue-900 italic">UK → Dominican Rep.</p>
                        <p className="text-[9px] text-blue-500">London, SE1, SE28... → SDQ, STI...</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                      <div className="bg-orange-100 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-orange-500 uppercase">Tariffs assigned</p>
                        <p className="font-black text-orange-900 italic">Barrel → £120</p>
                        <p className="font-black text-orange-900 italic">Box → £80</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-blue-600">One zone covers all origin/destination combinations within it — no individual city pairs needed.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TARIFFS TAB ───────────────────────────────────────── */}
        {activeTab === 'tariffs' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Master <span className="text-[var(--brand-orange)] font-black">Tariffs</span></h3>
                <div className="flex gap-2 flex-wrap">
                  {['All', ...RATE_TYPES].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${typeFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search tariffs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-48 text-xs font-bold" />
              </div>
            </div>

            {zones.length === 0 && (
              <div className="p-8 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm font-bold text-amber-700">Create at least one route zone before adding tariffs.</p>
                <button onClick={() => setActiveTab('zones')} className="ml-auto px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase whitespace-nowrap">Go to Zones</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <th className="px-8 py-4">Item / Service</th>
                    <th className="px-8 py-4">Mode</th>
                    <th className="px-8 py-4">Route Zone</th>
                    <th className="px-8 py-4">Rate</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 italic">
                  {loading ? (
                    <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-300 font-bold">No tariffs match filters.</td></tr>
                  ) : filtered.map((rate, i) => {
                    const rateZones = Array.isArray((rate as any).zone_ids)
                      ? zones.filter(z => (rate as any).zone_ids.includes(z.id))
                      : zones.filter(z => z.name === rate.origin);
                    return (
                      <motion.tr key={rate.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <span className="font-black text-slate-900 italic uppercase tracking-tighter">{rate.item}</span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{rate.id}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {typeIcon(rate.type)}
                            <span className="text-[10px] font-black text-slate-700 uppercase">{rate.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {rateZones.length > 0 ? (
                            <div className="space-y-1.5">
                              {rateZones.map(z => (
                                <div key={z.id} className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded">{z.origin_country}</span>
                                  <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                                  <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded">{z.dest_country}</span>
                                  <span className="text-[9px] font-bold text-slate-500 italic">{z.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-300" />
                              <span className="text-xs font-bold text-slate-400">{rate.origin}{rate.destination ? ` → ${rate.destination}` : ''}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900 text-base">{rate.rate}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border italic ${rate.status === 'Active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : rate.status === 'Review' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{rate.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditRate(rate)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all text-slate-400"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => deleteRate(rate.id)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-red-500 hover:text-white transition-all text-slate-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Info className="w-3 h-3" /> Rates subject to weekly review based on fuel surcharges and market conditions.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── Zone Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showZoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowZoneModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl z-10 p-10 relative max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">{editingZone ? 'Edit' : 'New'} Route <span className="text-[var(--brand-orange)]">Zone</span></h2>
                <button onClick={() => setShowZoneModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Zone Name *</label>
                  <input type="text" value={zoneForm.name} onChange={e => setZoneForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. UK → Dominican Republic" className={inputCls} />
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Use a descriptive name like "UK → DR Nationwide" or "London Express".</p>
                </div>

                {/* Origin + Destination side by side */}
                <div className="grid grid-cols-2 gap-6">
                  {/* ORIGIN */}
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Origin
                    </p>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input type="text" list="countries-list" value={zoneForm.origin_country} onChange={e => setZoneForm(p => ({ ...p, origin_country: e.target.value }))} placeholder="e.g. United Kingdom" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Cities / Postcodes</label>
                      <textarea value={zoneForm.origin_keywords} onChange={e => setZoneForm(p => ({ ...p, origin_keywords: e.target.value }))} placeholder="London, SE1, SE28, E1, SW1, Manchester, M1, Birmingham, B1..." rows={4} className={inputCls + ' resize-none text-xs'} />
                    </div>
                  </div>

                  {/* DESTINATION */}
                  <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-4">
                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Destination
                    </p>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input type="text" list="countries-list" value={zoneForm.dest_country} onChange={e => setZoneForm(p => ({ ...p, dest_country: e.target.value }))} placeholder="e.g. Dominican Republic" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Cities / Delivery Areas</label>
                      <textarea value={zoneForm.dest_keywords} onChange={e => setZoneForm(p => ({ ...p, dest_keywords: e.target.value }))} placeholder="Santo Domingo, SDQ, Santiago, STI, La Romana, Puerto Plata..." rows={4} className={inputCls + ' resize-none text-xs'} />
                    </div>
                  </div>
                </div>

                {zoneError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600">{zoneError}</p>
                  </div>
                )}
                <button onClick={handleSaveZone} disabled={savingZone || !zoneForm.name} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {savingZone ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
                </button>

                <datalist id="countries-list">
                  {['United Kingdom', 'Dominican Republic', 'Spain', 'France', 'United States', 'Germany', 'Netherlands', 'Italy', 'Portugal', 'Belgium', 'Canada', 'Mexico', 'Colombia', 'Venezuela', 'Puerto Rico', 'Haiti', 'Cuba', 'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Other'].map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Rate Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showRateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRateModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-10 relative max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">{editingRate ? 'Edit' : 'New'} <span className="text-[var(--brand-orange)]">Tariff</span></h2>
                <button onClick={() => setShowRateModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Item / Service *</label>
                  <input type="text" value={rateForm.item} onChange={e => setRateForm(p => ({ ...p, item: e.target.value }))} placeholder="e.g. Standard Barrel, 20kg Box, Suitcase..." className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Freight Type</label>
                  <select value={rateForm.type} onChange={e => setRateForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                    {RATE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Zone multi-selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls + ' mb-0'}>Route Zones * <span className="normal-case text-slate-300 font-bold">(select one or more)</span></label>
                    {rateForm.zone_ids.length > 0 && (
                      <span className="text-[9px] font-black text-[var(--brand-orange)] uppercase tracking-widest">{rateForm.zone_ids.length} selected</span>
                    )}
                  </div>
                  {zones.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs font-bold text-amber-700">No zones defined yet.</p>
                      </div>
                      <button type="button" onClick={() => { setShowRateModal(false); setActiveTab('zones'); openAddZone(); }}
                        className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all whitespace-nowrap">
                        Create Zone
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {zones.map(z => {
                        const checked = rateForm.zone_ids.includes(z.id);
                        return (
                          <div
                            key={z.id}
                            onClick={() => toggleZone(z.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${checked ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)]' : 'border-slate-300 bg-white'}`}>
                              {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className={`text-xs font-black italic uppercase tracking-tighter truncate ${checked ? 'text-white' : 'text-slate-800'}`}>{z.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${checked ? 'bg-white/10 text-white/60' : 'bg-blue-50 text-blue-500'}`}>{z.origin_country}</span>
                                <ArrowRight className={`w-2 h-2 ${checked ? 'text-white/30' : 'text-slate-300'}`} />
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${checked ? 'bg-white/10 text-white/60' : 'bg-orange-50 text-orange-500'}`}>{z.dest_country}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Preview of selected zones */}
                  {selectedZones.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {selectedZones.map(z => (
                        <span key={z.id} className="px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-lg text-[9px] font-black text-orange-600 uppercase flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" /> {z.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Item Category <span className="normal-case text-slate-300 font-bold">(visible to customers)</span></label>
                  <select value={rateForm.category} onChange={e => setRateForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                    {ITEM_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Rate Amount *</label>
                    <input type="text" value={rateForm.rate} onChange={e => setRateForm(p => ({ ...p, rate: e.target.value }))} placeholder="£120.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <select value={rateForm.unit} onChange={e => setRateForm(p => ({ ...p, unit: e.target.value }))} className={inputCls}>
                      {RATE_UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Status</label>
                    <select value={rateForm.status} onChange={e => setRateForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                      <option>Active</option><option>Review</option><option>Inactive</option>
                    </select>
                  </div>
                </div>

                {rateError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600">{rateError}</p>
                  </div>
                )}
                <button onClick={handleSaveRate} disabled={savingRate || !rateForm.item || !rateForm.rate || rateForm.zone_ids.length === 0}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {savingRate ? 'Saving…' : editingRate ? 'Update Tariff' : 'Add Tariff'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
