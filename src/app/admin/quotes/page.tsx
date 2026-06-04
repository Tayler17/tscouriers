'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Search, CheckCircle2, MoreVertical, Edit3, X, Save, UserCheck, Truck, ArrowRight, PackagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData, Quote } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';

interface DriverProfile { id: string; name: string; phone: string; vehicle: string; zone: string; status: string; email?: string; }

const EMPTY: Omit<Quote, 'id' | 'date' | 'driver_id' | 'driver_name'> = {
  customer: '', origin: 'London', destination: 'Santo Domingo',
  weight: '', service: 'Sea Freight', status: 'Pending'
};

export default function QuotesPage() {
  const { quotes, deleteQuote, updateQuote } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Assign driver
  const [showAssign, setShowAssign]         = useState(false);
  const [assignQuoteId, setAssignQuoteId]   = useState<string | null>(null);
  const [drivers, setDrivers]               = useState<DriverProfile[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assignType, setAssignType]         = useState<'pickup' | 'delivery' | 'both'>('pickup');
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [assignSaving, setAssignSaving]     = useState(false);

  const openEdit = (q: Quote) => {
    setEditingId(q.id);
    setEditForm({ customer: q.customer, origin: q.origin, destination: q.destination, weight: q.weight, service: q.service, status: q.status });
    setShowEdit(true);
    setActiveActionId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.customer) return;
    setSaving(true);
    await updateQuote(editingId, editForm);
    setShowEdit(false);
    setEditingId(null);
    setSaving(false);
  };

  const handleApprove = async (id: string) => {
    await updateQuote(id, { status: 'Approved' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this quote?')) { deleteQuote(id); setActiveActionId(null); }
  };

  const openAssignDriver = async (quoteId: string) => {
    setAssignQuoteId(quoteId);
    setSelectedDriver('');
    setAssignType('pickup');
    setShowAssign(true);
    setActiveActionId(null);
    setLoadingDrivers(true);
    const { data } = await supabase
      .from('drivers')
      .select('id, name, phone, vehicle, zone, status, email')
      .neq('status', 'Off Duty')
      .order('name');
    setDrivers((data || []) as DriverProfile[]);
    setLoadingDrivers(false);
  };

  const handleAssignDriver = async () => {
    if (!assignQuoteId || !selectedDriver) return;
    setAssignSaving(true);
    const driver = drivers.find(d => d.id === selectedDriver);
    const quote  = quotes.find(q => q.id === assignQuoteId);

    // Resolve auth UUID so notifications land correctly
    let profileId: string | null = null;
    if (driver?.email) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', driver.email).single();
      if (profile) profileId = profile.id;
    }
    const driverId = profileId || selectedDriver;

    await updateQuote(assignQuoteId, {
      driver_id:   driverId,
      driver_name: driver?.name || '',
      status: quote?.status === 'Pending' ? 'Approved' : quote?.status,
    });

    if (profileId) {
      const typeLabel = assignType === 'both' ? 'Pickup & Delivery' : assignType === 'pickup' ? 'Pickup' : 'Delivery';
      await supabase.from('notifications').insert({
        user_id: profileId,
        type:    'assignment',
        title:   `Quote ${typeLabel} Assigned`,
        message: `Quote ${assignQuoteId} — ${quote?.customer} · ${quote?.origin} ➔ ${quote?.destination} has been added to your route.`,
        data:    { quote_id: assignQuoteId, assign_type: assignType },
      });
    }

    setAssignSaving(false);
    setShowAssign(false);
    setAssignQuoteId(null);
  };

  const [converting, setConverting] = useState<string | null>(null);

  const handleConvertToBooking = async (quote: Quote) => {
    if (!confirm(`Convert quote ${quote.id} into a live booking?`)) return;
    setConverting(quote.id);
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const bookingId = `TS-${Date.now().toString().slice(-6)}`;

    await supabase.from('bookings').insert({
      id: bookingId,
      customer: quote.customer,
      route: `${quote.origin} → ${quote.destination}`,
      date: today,
      status: 'Pending Pickup',
      type: quote.service,
      collection_address: quote.origin,
      delivery_address: quote.destination,
      total_amount: null,
      source_quote_id: quote.id,
    });

    await updateQuote(quote.id, { status: 'Converted' });
    setConverting(null);
    setActiveActionId(null);
    alert(`✅ Booking ${bookingId} created from quote ${quote.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':   return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Pending':    return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Expired':    return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Converted':  return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:           return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const filtered = quotes.filter(q =>
    q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Quote <span className="text-[var(--brand-orange)] font-black">Center</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Pricing & Customer Inquiries</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search Quotes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all" />
          </div>
        </header>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-slate-900">{quotes.length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Total Quotes</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-orange-500">{quotes.filter(q => q.status === 'Pending').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Pending Review</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-emerald-500">{quotes.filter(q => q.status === 'Approved').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Approved</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-[var(--brand-blue)]">{quotes.filter(q => q.status === 'Converted').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Converted</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">System <span className="text-[var(--brand-orange)] font-black">Quotes</span></h3>
              <div className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest">{quotes.filter(q => q.status === 'Pending').length} Pending</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">Quote ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Route</th>
                  <th className="px-8 py-4">Weight / Service</th>
                  <th className="px-8 py-4">Driver</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(quote => (
                  <tr key={quote.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-900">{quote.id}</td>
                    <td className="px-8 py-6 font-bold text-slate-700 text-sm">{quote.customer}</td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-[var(--brand-blue)] italic uppercase tracking-tighter">{quote.origin} ➔ {quote.destination}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 italic uppercase tracking-tighter">{quote.service}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quote.weight}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {quote.driver_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center"><Truck className="w-3 h-3 text-blue-500" /></div>
                          <span className="text-[10px] font-black text-slate-700 uppercase italic tracking-tighter">{quote.driver_name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border italic ${getStatusColor(quote.status)}`}>{quote.status}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">{quote.date}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quote.status === 'Pending' && (
                          <button onClick={() => handleApprove(quote.id)} title="Approve Quote" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {(quote.status === 'Approved') && (
                          <button
                            onClick={() => handleConvertToBooking(quote)}
                            disabled={converting === quote.id}
                            title="Convert to Booking"
                            className="p-2.5 bg-blue-50 text-[var(--brand-blue)] rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all disabled:opacity-50"
                          >
                            {converting === quote.id ? <ArrowRight className="w-4 h-4 animate-pulse" /> : <PackagePlus className="w-4 h-4" />}
                          </button>
                        )}
                        <button onClick={() => openAssignDriver(quote.id)} title="Assign Driver" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-[var(--brand-blue)] transition-all">
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(quote)} title="Edit Quote" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-orange-50 hover:text-[var(--brand-orange)] transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button onClick={() => setActiveActionId(activeActionId === quote.id ? null : quote.id)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {activeActionId === quote.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveActionId(null)} />
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden text-left">
                                  <div className="p-2 space-y-1">
                                    {quote.status === 'Pending' && (
                                      <button onClick={() => { handleApprove(quote.id); setActiveActionId(null); }} className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all uppercase italic tracking-tighter">Approve</button>
                                    )}
                                    {quote.status === 'Approved' && (
                                      <button onClick={() => handleConvertToBooking(quote)} className="w-full text-left px-4 py-2 text-xs font-bold text-[var(--brand-blue)] hover:bg-blue-50 rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2"><PackagePlus className="w-3 h-3" /> Convert to Booking</button>
                                    )}
                                    <button onClick={() => { openAssignDriver(quote.id); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)] rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2"><UserCheck className="w-3 h-3" /> Assign Driver</button>
                                    <button onClick={() => { updateQuote(quote.id, { status: 'Expired' }); setActiveActionId(null); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase italic tracking-tighter">Mark Expired</button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button onClick={() => handleDelete(quote.id)} className="w-full text-left px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase italic tracking-tighter">Delete Quote</button>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEdit(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Edit <span className="text-[var(--brand-orange)]">Quote</span></h2>
                <button onClick={() => setShowEdit(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {([
                  { key: 'customer', label: 'Customer Name *', ph: 'John Doe' },
                  { key: 'origin', label: 'Origin', ph: 'London' },
                  { key: 'destination', label: 'Destination', ph: 'Santo Domingo' },
                  { key: 'weight', label: 'Weight / Volume', ph: '50kg / 2 barrels' },
                ] as { key: keyof typeof editForm; label: string; ph: string }[]).map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{f.label}</label>
                    <input type="text" value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Service</label>
                    <select value={editForm.service} onChange={e => setEditForm(p => ({ ...p, service: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                      {['Sea Freight', 'Air Freight', 'Land Freight', 'Express'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                      {['Pending', 'Approved', 'Expired'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleSaveEdit} disabled={saving || !editForm.customer} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Driver Modal */}
      <AnimatePresence>
        {showAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssign(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black italic uppercase">Assign <span className="text-[var(--brand-orange)]">Driver</span></h2>
                <button onClick={() => setShowAssign(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>

              {/* Type toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                {(['pickup', 'delivery', 'both'] as const).map(t => (
                  <button key={t} onClick={() => setAssignType(t)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all capitalize ${assignType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {t === 'both' ? 'Both' : t}
                  </button>
                ))}
              </div>

              {/* Quote info */}
              {assignQuoteId && (() => { const q = quotes.find(x => x.id === assignQuoteId); return q ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-2xl">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{q.id} · {q.customer}</p>
                  <p className="text-[10px] font-bold text-blue-400 mt-1">{q.origin} ➔ {q.destination} · {q.service}</p>
                </div>
              ) : null; })()}

              {/* Driver list */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-6">
                {loadingDrivers ? (
                  <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-widest">Loading drivers...</div>
                ) : drivers.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 font-bold text-xs uppercase tracking-widest">No drivers available</div>
                ) : drivers.map(d => (
                  <button key={d.id} onClick={() => setSelectedDriver(d.id)} className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${selectedDriver === d.id ? 'border-[var(--brand-orange)] bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm">{d.name.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-sm uppercase italic">{d.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{d.vehicle || 'No vehicle'} · {d.zone}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${d.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>{d.status}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleAssignDriver} disabled={assignSaving || !selectedDriver} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <UserCheck className="w-4 h-4" /> {assignSaving ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
