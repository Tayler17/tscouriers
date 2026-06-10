'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, MapPin, ArrowRight, ShieldCheck, LogOut,
  Clock, CheckCircle2, FileText, Users, Download, Plus,
  Truck, Globe, Phone, MessageCircle, ChevronDown, ChevronRight,
  AlertCircle, Star, ArrowUpRight, Navigation, Bell
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  customer: string;
  customer_email?: string;
  route: string;
  date: string;
  status: string;
  type: string;
  total_amount?: number;
  payment_status?: string;
  status_note?: string;
  collection_address?: string;
  delivery_address?: string;
  metadata?: { status_history?: { status: string; note: string; date: string }[] };
}

type FilterTab = 'all' | 'active' | 'delivered' | 'unpaid';

const STATUS_STEPS = [
  { key: 'Pending Pickup',    label: 'Booked',     step: 0 },
  { key: 'Picked Up',         label: 'Collected',  step: 1 },
  { key: 'In Warehouse',      label: 'Warehouse',  step: 1 },
  { key: 'Ready to Ship',     label: 'Warehouse',  step: 1 },
  { key: 'At Port',           label: 'At Port',    step: 2 },
  { key: 'At Sea',            label: 'In Transit', step: 2 },
  { key: 'In Transit',        label: 'In Transit', step: 2 },
  { key: 'Pending Customs',   label: 'Customs',    step: 3 },
  { key: 'In Custom',         label: 'Customs',    step: 3 },
  { key: 'Out for Delivery',  label: 'Out for Delivery', step: 4 },
  { key: 'Delivered',         label: 'Delivered',  step: 5 },
];

const STEPS_LABELS = ['Booked', 'Collected', 'In Transit', 'Customs', 'Out for Delivery', 'Delivered'];

function getStep(status: string): number {
  return STATUS_STEPS.find(s => s.key === status)?.step ?? 0;
}

function statusColor(status: string) {
  if (status === 'Delivered')       return 'bg-emerald-500 text-white';
  if (status === 'Out for Delivery') return 'bg-purple-500 text-white';
  if (status === 'In Transit' || status === 'At Sea') return 'bg-blue-500 text-white';
  if (status === 'Pending Customs' || status === 'In Custom') return 'bg-amber-500 text-white';
  if (status === 'Failed Delivery') return 'bg-red-500 text-white';
  return 'bg-slate-200 text-slate-600';
}

export default function CustomerDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filter, setFilter]             = useState<FilterTab>('all');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [trackInput, setTrackInput]     = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'CUSTOMER') { router.push('/login'); return; }

    const tryLoad = async () => {
      try {
        // Try email + name filter first
        if (user.email) {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .or(`customer_email.eq.${user.email},customer.eq.${user.name}`)
            .order('date', { ascending: false });

          if (!error && data) {
            setBookings(data as Booking[]);
            setLoading(false);
            return;
          }
        }
        // Fallback: filter by customer name only
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer', user.name)
          .order('date', { ascending: false });

        if (data) setBookings(data as Booking[]);
      } catch {
        // Silent fail — still hide spinner
      } finally {
        setLoading(false);
      }
    };
    tryLoad();
  }, [user, authLoading]);

  if (authLoading || !user) return null;

  const active    = bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled');
  const delivered = bookings.filter(b => b.status === 'Delivered');
  const unpaid    = bookings.filter(b => b.payment_status === 'UNPAID' || b.payment_status === 'Pending');

  const filtered = bookings.filter(b => {
    const matchSearch = !searchTerm || b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.route?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' ? true : filter === 'active' ? active.includes(b) : filter === 'delivered' ? b.status === 'Delivered' : unpaid.includes(b);
    return matchSearch && matchFilter;
  });

  const handleTrack = () => {
    const id = trackInput.trim().toUpperCase();
    if (id) router.push(`/track?id=${id}`);
  };

  const handleExport = () => {
    const headers = ['ID', 'Route', 'Type', 'Date', 'Status', 'Payment', 'Amount'];
    const rows = bookings.map(b => [b.id, b.route, b.type, b.date, b.status, b.payment_status || 'PAID', b.total_amount ? `£${b.total_amount}` : '—'].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'my_shipments.csv', hidden: true });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">

      {/* ── Top Header ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center font-black text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm uppercase italic tracking-tight leading-none">My Portal</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email || user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/booking"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-orange)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
              <Plus className="w-3.5 h-3.5" /> New Booking
            </Link>
            <button onClick={() => { router.push('/'); logout().catch(() => {}); }}
              className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* ── Hero Welcome + Stats ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-orange)] opacity-10 rounded-full translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-500 opacity-5 rounded-full translate-y-10" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Welcome back</p>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                  Hello, <span className="text-[var(--brand-orange)]">{user.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-bold">Here's your shipping overview</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total',     val: bookings.length,   color: 'text-white' },
                  { label: 'Active',    val: active.length,     color: 'text-blue-400' },
                  { label: 'Delivered', val: delivered.length,  color: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
                    <p className={`text-2xl font-black italic ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { icon: <Plus className="w-4 h-4" />,      label: 'New Booking',  href: '/booking',  bg: 'bg-[var(--brand-orange)] hover:bg-orange-600' },
                { icon: <Search className="w-4 h-4" />,    label: 'Get Quote',    href: '/quote',    bg: 'bg-white/10 hover:bg-white/20' },
                { icon: <Globe className="w-4 h-4" />,     label: 'Services',     href: '/services', bg: 'bg-white/10 hover:bg-white/20' },
                { icon: <Phone className="w-4 h-4" />,     label: 'Support',      href: '/contact',  bg: 'bg-white/10 hover:bg-white/20' },
              ].map(btn => (
                <Link key={btn.label} href={btn.href}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all ${btn.bg}`}>
                  {btn.icon} {btn.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Bookings list ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Filter + Search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm p-1 gap-1 flex-wrap">
                {([
                  { key: 'all',       label: `All (${bookings.length})` },
                  { key: 'active',    label: `Active (${active.length})` },
                  { key: 'delivered', label: `Delivered (${delivered.length})` },
                  ...(unpaid.length > 0 ? [{ key: 'unpaid', label: `Unpaid (${unpaid.length})` }] : []),
                ] as { key: FilterTab; label: string }[]).map(tab => (
                  <button key={tab.key} onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab.key ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by ID or route..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm" />
              </div>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>

            {/* Booking cards */}
            {loading ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Loading your shipments…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase italic tracking-tighter text-lg">No shipments found</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {searchTerm ? 'Try a different search term' : 'Book your first shipment below'}
                  </p>
                </div>
                <Link href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-orange)] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                  <Plus className="w-4 h-4" /> Book a Shipment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((booking, i) => {
                  const isExpanded = expandedId === booking.id;
                  const step = getStep(booking.status);
                  const isDelivered = booking.status === 'Delivered';
                  const isPending   = booking.payment_status === 'UNPAID' || booking.payment_status === 'Pending';

                  return (
                    <motion.div key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`bg-white rounded-[2rem] border shadow-sm transition-all overflow-hidden ${isExpanded ? 'border-[var(--brand-orange)] shadow-xl shadow-orange-500/10' : 'border-slate-100 hover:shadow-md'}`}>

                      {/* Card header — always visible */}
                      <div className="p-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDelivered ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-[var(--brand-orange)]'}`}>
                              {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{booking.type}</p>
                              <h4 className="text-lg font-black text-slate-900 italic tracking-tight uppercase mt-0.5">{booking.id}</h4>
                              <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {booking.route}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase ${statusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100">
                                Unpaid
                              </span>
                            )}
                            <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Progress bar */}
                        {!isDelivered && (
                          <div className="mt-3">
                            <div className="flex justify-between mb-1.5">
                              {STEPS_LABELS.map((label, idx) => (
                                <span key={label} className={`text-[8px] font-black uppercase tracking-wider hidden sm:block ${idx <= step ? 'text-[var(--brand-orange)]' : 'text-slate-300'}`}>
                                  {label}
                                </span>
                              ))}
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(step / 5) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-orange-400 to-[var(--brand-orange)] rounded-full" />
                            </div>
                          </div>
                        )}
                        {isDelivered && (
                          <div className="mt-3 h-1.5 bg-emerald-500 rounded-full" />
                        )}

                        {/* Quick info row */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400">{booking.date}</span>
                            {booking.total_amount && (
                              <span className="text-[10px] font-black text-slate-700">£{booking.total_amount.toFixed(2)}</span>
                            )}
                          </div>
                          <Link href={`/track?id=${booking.id}`} onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-[10px] font-black text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors uppercase tracking-widest">
                            Track <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="px-6 pb-6 space-y-4 border-t border-slate-50 pt-5">

                              {/* Detail grid */}
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: 'Route',   val: booking.route },
                                  { label: 'Type',    val: booking.type },
                                  { label: 'Date',    val: booking.date },
                                  { label: 'Payment', val: booking.payment_status || 'PAID' },
                                  ...(booking.collection_address ? [{ label: 'Collection', val: booking.collection_address }] : []),
                                  ...(booking.delivery_address   ? [{ label: 'Delivery',   val: booking.delivery_address   }] : []),
                                  ...(booking.total_amount       ? [{ label: 'Amount',      val: `£${booking.total_amount.toFixed(2)}` }] : []),
                                ].map(d => (
                                  <div key={d.label} className="bg-slate-50 rounded-2xl px-4 py-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</p>
                                    <p className="text-xs font-black text-slate-800 italic uppercase tracking-tight mt-0.5 truncate">{d.val || '—'}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Status note */}
                              {booking.status_note && (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex gap-3">
                                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs font-bold text-blue-700">{booking.status_note}</p>
                                </div>
                              )}

                              {/* Status history */}
                              {(booking.metadata?.status_history?.length ?? 0) > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status History</p>
                                  <div className="space-y-1.5 pl-4 border-l-2 border-slate-100">
                                    {[...(booking.metadata!.status_history!)].reverse().map((h, idx) => (
                                      <div key={idx} className="relative">
                                        <div className="absolute -left-[1.15rem] top-1.5 w-2 h-2 rounded-full bg-slate-300" />
                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                          {h.status} <span className="text-slate-400 normal-case font-bold">· {new Date(h.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                                        </p>
                                        {h.note && <p className="text-[11px] text-slate-500 font-medium">{h.note}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3">
                                <Link href={`/track?id=${booking.id}`}
                                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] transition-all">
                                  <Navigation className="w-3.5 h-3.5" /> Track Shipment
                                </Link>
                                {isPending && (
                                  <Link href="/contact"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
                                    <AlertCircle className="w-3.5 h-3.5" /> Pay Now
                                  </Link>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Book more CTA */}
                <Link href="/booking"
                  className="flex items-center justify-center gap-3 py-8 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange)] transition-all font-black text-xs uppercase tracking-widest group">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Book Another Shipment
                </Link>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">

            {/* Track a shipment */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 text-[var(--brand-orange)] rounded-xl flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-xs uppercase italic tracking-tight">Track a Shipment</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enter your tracking ID</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="TS-0000…"
                  value={trackInput} onChange={e => setTrackInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all uppercase tracking-wider" />
                <button onClick={handleTrack}
                  className="px-4 py-3 bg-[var(--brand-orange)] text-white rounded-2xl font-black text-xs uppercase hover:bg-orange-600 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Summary stats */}
            {bookings.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Summary</p>
                {[
                  { label: 'Total Bookings',   val: bookings.length,    icon: <Package className="w-3.5 h-3.5" />,     color: 'text-slate-700', bg: 'bg-slate-50' },
                  { label: 'Active',           val: active.length,      icon: <Truck className="w-3.5 h-3.5" />,       color: 'text-blue-600',  bg: 'bg-blue-50' },
                  { label: 'Delivered',        val: delivered.length,   icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ...(unpaid.length > 0 ? [{ label: 'Pending Payment', val: unpaid.length, icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-amber-600', bg: 'bg-amber-50' }] : []),
                ].map(s => (
                  <div key={s.label} className={`flex items-center justify-between px-4 py-3 ${s.bg} rounded-2xl`}>
                    <div className={`flex items-center gap-2 ${s.color}`}>
                      {s.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                    </div>
                    <span className={`text-sm font-black italic ${s.color}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Address Book */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4 group hover:border-[var(--brand-orange)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-xs uppercase italic tracking-tight">Address Book</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saved recipients</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-bold">Save your frequent recipients for faster booking and quote requests.</p>
              <Link href="/customer/address-book"
                className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-blue)] transition-all">
                Open My Book <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Services */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-orange)] opacity-10 rounded-full translate-x-8 -translate-y-8" />
              <div className="relative z-10 space-y-4">
                <ShieldCheck className="w-8 h-8 text-[var(--brand-orange)]" />
                <div>
                  <h5 className="font-black italic uppercase tracking-tighter text-base">TS Couriers <br /><span className="text-[var(--brand-orange)]">Secure Cover</span></h5>
                  <p className="text-slate-400 text-xs leading-relaxed mt-2">Cargo insurance available on all routes. Your goods, protected.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/contact"
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-[var(--brand-orange)] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    <MessageCircle className="w-3 h-3" /> Chat
                  </Link>
                  <Link href="/services"
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-[var(--brand-blue)] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    <Globe className="w-3 h-3" /> Services
                  </Link>
                </div>
              </div>
            </div>

            {/* Get a Quote */}
            <Link href="/quote"
              className="flex items-center gap-4 bg-gradient-to-br from-[var(--brand-orange)] to-orange-600 rounded-[2rem] p-6 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all group">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm uppercase italic tracking-tight">Get a Quote</p>
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">Instant price estimate</p>
              </div>
              <ArrowUpRight className="w-5 h-5 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
