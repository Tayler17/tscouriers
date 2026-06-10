'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, MapPin, Package, LogOut, CheckCircle, Navigation,
  ExternalLink, Layers, Bell, X, AlertCircle, Route,
  Phone, MessageCircle, ScanLine, Flag, ChevronDown,
  CheckCircle2, XCircle, Clock, Fuel, Star, TriangleAlert,
  ListOrdered, LayoutGrid, Camera, Loader2, ImageOff
} from 'lucide-react';
import Link from 'next/link';
import QRScannerModal from '@/components/QRScannerModal';

interface Notification {
  id: string; type: string; title: string; message: string;
  read: boolean; data: Record<string, any>; created_at: string;
}

interface IssueReport { shipmentId: string; reason: string; note: string; }

const ACTIVE_STATUSES = ['In Warehouse', 'Ready to Ship', 'In Transit', 'Pending Pickup', 'Pending Customs', 'At Port', 'Picked Up', 'Out for Delivery'];

const STATUS_FLOW = [
  { key: 'Picked Up',       label: 'Picked Up',     icon: '📦', color: 'bg-amber-500',  textColor: 'text-amber-600',   bg: 'bg-amber-50' },
  { key: 'In Transit',      label: 'In Transit',    icon: '🚚', color: 'bg-blue-500',   textColor: 'text-blue-600',    bg: 'bg-blue-50' },
  { key: 'Out for Delivery',label: 'Out Delivery',  icon: '🏃', color: 'bg-purple-500', textColor: 'text-purple-600',  bg: 'bg-purple-50' },
  { key: 'Delivered',       label: 'Delivered',     icon: '✅', color: 'bg-emerald-500',textColor: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const ISSUE_REASONS = [
  'No one home', 'Wrong address', 'Access denied', 'Refused delivery',
  'Damaged package', 'Missing item', 'Vehicle issue', 'Other',
];

export default function DriverDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { shipments, bookings, updateShipment, updateShipmentStatus, updateBooking, isLoading } = useData();
  const router = useRouter();

  const [notifications, setNotifications]     = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner]         = useState(false);
  const [issueReport, setIssueReport]         = useState<IssueReport | null>(null);
  const [expandedId, setExpandedId]           = useState<string | null>(null);
  const [viewMode, setViewMode]               = useState<'cards' | 'list'>('cards');
  const [scanResult, setScanResult]           = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [mapAddress, setMapAddress]           = useState<string | null>(null);
  const [showRouteChoice, setShowRouteChoice] = useState(false);
  const [photoTarget, setPhotoTarget]         = useState<{ id: string; type: 'shipment' | 'booking' } | null>(null);
  const [uploadingPhoto, setUploadingPhoto]   = useState(false);
  const [scanNotFound, setScanNotFound]       = useState(false);
  const [photoCache, setPhotoCache]           = useState<Record<string, string[]>>({});
  const photoInputRef                         = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;                              // wait for session restore
    if (!user || (user.role !== 'DRIVER' && user.role !== 'ADMIN')) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const channel = supabase.channel(`notifs-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchNotifications)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Load photos from Supabase Storage when a card is expanded
  useEffect(() => {
    const id = expandedId || expandedBookingId;
    if (!id) return;
    if (photoCache[id] !== undefined) return; // already loaded
    supabase.storage.from('driver-photos').list(id)
      .then(({ data }) => {
        const urls = (data ?? []).map(f =>
          supabase.storage.from('driver-photos').getPublicUrl(`${id}/${f.name}`).data.publicUrl
        );
        setPhotoCache(prev => ({ ...prev, [id]: urls }));
      });
  }, [expandedId, expandedBookingId]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    if (data) setNotifications(data as Notification[]);
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (authLoading || !user) return null;

  const myShipments = user.role === 'ADMIN'
    ? shipments.filter(s => ACTIVE_STATUSES.includes(s.status))
    : shipments.filter(s => s.metadata?.pickup_driver_id === user.id || s.metadata?.delivery_driver_id === user.id);

  const myBookings = user.role === 'ADMIN'
    ? bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled')
    : bookings.filter(b => b.driver_id === user.id);

  const activeShipments  = myShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Failed Delivery');
  const activeBookings   = myBookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled');
  const completedBookings = myBookings.filter(b => b.status === 'Delivered');
  const delivered = myShipments.filter(s => s.status === 'Delivered');
  const failed    = myShipments.filter(s => s.status === 'Failed Delivery');

  const totalActive = activeShipments.length + activeBookings.length;
  const totalDone   = delivered.length + completedBookings.length;
  const totalAll    = myShipments.length + myBookings.length;
  const progress    = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
  const unreadCount = notifications.filter(n => !n.read).length;

  const getAllRouteAddresses = () => {
    const shipmentAddrs = activeShipments.map(s => s.metadata?.delivery_address || s.destination).filter(Boolean) as string[];
    const bookingAddrs  = activeBookings.map(b => b.delivery_address || b.collection_address || b.route).filter(Boolean) as string[];
    return [...shipmentAddrs, ...bookingAddrs];
  };

  const WAREHOUSE_ADDR = '67-69 Nathan Way, London SE28 0BQ';

  const openRouteInGoogle = () => {
    const addrs = getAllRouteAddresses();
    if (!addrs.length) return;
    // Current location → all stops → back to warehouse
    const wp = addrs.map(a => encodeURIComponent(a)).join('/');
    window.open(`https://www.google.com/maps/dir/Current+Location/${wp}/${encodeURIComponent(WAREHOUSE_ADDR)}`, '_blank');
    setShowRouteChoice(false);
  };

  const openRouteInWaze = () => {
    const addrs = getAllRouteAddresses();
    if (!addrs.length) return;
    // Waze deep link: navigate to next stop (multi-stop not supported in Waze URL)
    window.open(`https://waze.com/ul?q=${encodeURIComponent(addrs[0])}&navigate=yes`, '_blank');
    setShowRouteChoice(false);
  };

  const handleScanResult = (id: string) => {
    setScanResult(id);
    setScanNotFound(false);
    setShowScanner(false);
    const foundShipment = myShipments.find(s => s.id === id);
    const foundBooking  = myBookings.find(b => b.id === id);
    if (foundShipment) {
      setExpandedId(id);
      setViewMode('cards');
      setTimeout(() => document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
      return;
    }
    if (foundBooking) {
      setExpandedBookingId(id);
      setTimeout(() => document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
      return;
    }
    setScanNotFound(true); // ID not in this driver's assignments
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoTarget) return;
    setUploadingPhoto(true);
    e.target.value = ''; // reset so same file can be re-selected

    const ext  = file.name.split('.').pop() || 'jpg';
    const path = `${photoTarget.id}/${Date.now()}.${ext}`;

    const { data: uploaded, error } = await supabase.storage
      .from('driver-photos')
      .upload(path, file, { contentType: file.type, upsert: false });

    setUploadingPhoto(false);

    if (error) {
      alert('Photo upload failed: ' + error.message + '\n\nMake sure the "driver-photos" bucket exists in Supabase Storage → Buckets, and is set to Public.');
      setPhotoTarget(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('driver-photos').getPublicUrl(uploaded.path);
    // Update local cache so photo appears immediately — no DB schema change needed
    setPhotoCache(prev => ({
      ...prev,
      [photoTarget.id]: [...(prev[photoTarget.id] ?? []), publicUrl],
    }));
    setPhotoTarget(null);
  };

  const submitIssue = async () => {
    if (!issueReport || !user) return;
    await updateShipmentStatus(issueReport.shipmentId, 'Failed Delivery', `${issueReport.reason}: ${issueReport.note}`);
    setIssueReport(null);
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Modals */}
      <AnimatePresence>
        {showScanner && (
          <QRScannerModal title="Scan Shipment Label" onClose={() => setShowScanner(false)} onResult={handleScanResult} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {issueReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                      <TriangleAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">Report Issue</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{issueReport.shipmentId}</p>
                    </div>
                  </div>
                  <button onClick={() => setIssueReport(null)} className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-400 text-slate-400 rounded-xl flex items-center justify-center transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ISSUE_REASONS.map(r => (
                      <button key={r} onClick={() => setIssueReport(p => p ? { ...p, reason: r } : p)}
                        className={`py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 text-left ${issueReport.reason === r ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-red-200'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional notes</p>
                  <textarea
                    rows={2}
                    placeholder="Optional details..."
                    value={issueReport.note}
                    onChange={e => setIssueReport(p => p ? { ...p, note: e.target.value } : p)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none resize-none focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setIssueReport(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={submitIssue} disabled={!issueReport.reason}
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-red-600 transition-all">
                    Submit Issue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map Modal ── */}
      <AnimatePresence>
        {mapAddress && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setMapAddress(null); }}>
            <motion.div initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="flex items-start justify-between px-6 pt-6 pb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm uppercase italic tracking-tight">Map View</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{mapAddress}</p>
                </div>
                <button onClick={() => setMapAddress(null)}
                  className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-400 text-slate-400 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ml-3">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Embedded map */}
              <div className="mx-4 rounded-[1.5rem] overflow-hidden bg-slate-100" style={{ height: 260 }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed&z=15`}
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Map"
                />
              </div>

              {/* Navigation buttons */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}&travelmode=driving`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setMapAddress(null)}
                  className="flex items-center justify-center gap-2 py-4 bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                  <Navigation className="w-4 h-4" /> Google Maps
                </a>
                <a href={`https://waze.com/ul?q=${encodeURIComponent(mapAddress)}&navigate=yes`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setMapAddress(null)}
                  className="flex items-center justify-center gap-2 py-4 bg-sky-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 transition-all">
                  <Navigation className="w-4 h-4" /> Waze
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Route Choice Modal ── */}
      <AnimatePresence>
        {showRouteChoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowRouteChoice(false); }}>
            <motion.div initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">Open Route In</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{getAllRouteAddresses().length} stops</p>
                </div>
                <button onClick={() => setShowRouteChoice(false)}
                  className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button onClick={openRouteInGoogle}
                className="w-full flex items-center gap-4 p-5 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 rounded-2xl transition-all group">
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase italic tracking-tight">Google Maps</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Full multi-stop route</p>
                </div>
              </button>
              <button onClick={openRouteInWaze}
                className="w-full flex items-center gap-4 p-5 bg-sky-50 hover:bg-sky-400 hover:text-white text-sky-600 rounded-2xl transition-all group">
                <div className="w-10 h-10 bg-sky-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase italic tracking-tight">Waze</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Navigate to next stop</p>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan result banner */}
      <AnimatePresence>
        {scanResult && (
          <motion.div initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-xs w-auto text-white ${scanNotFound ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {scanNotFound
              ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
              : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span className="font-black text-sm uppercase tracking-tight">
              {scanNotFound ? `Not in your assignments: ${scanResult}` : `Found: ${scanResult}`}
            </span>
            <button onClick={() => { setScanResult(''); setScanNotFound(false); }}
              className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 md:px-8 pt-28 max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center font-black text-xl shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight italic uppercase leading-none">
                  Fleet <span className="text-[var(--brand-orange)]">Operator</span>
                </h1>
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest">{user.role}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${totalActive > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {totalActive > 0 ? `${totalActive} active` : 'No assignments'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => { setShowNotifications(v => !v); if (unreadCount > 0) markAllRead(); }}
                  className="relative p-3 bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-500 rounded-2xl transition-all">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-orange)] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                          <h3 className="font-black text-slate-900 text-sm uppercase italic tracking-tight">Notifications</h3>
                          <button onClick={() => setShowNotifications(false)} className="w-7 h-7 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><X className="w-3 h-3" /></button>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">No notifications yet</div>
                          ) : notifications.map(n => (
                            <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'assignment' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {n.type === 'assignment' ? <Route className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{n.title}</p>
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">{timeAgo(n.created_at)}</p>
                                </div>
                                {!n.read && <div className="w-2 h-2 bg-[var(--brand-orange)] rounded-full mt-1 flex-shrink-0" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => { router.push('/'); logout().catch(() => {}); }}
                className="p-3 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <ScanLine className="w-5 h-5" />, label: 'Scan', color: 'bg-orange-50 text-[var(--brand-orange)] hover:bg-[var(--brand-orange)] hover:text-white', action: () => setShowScanner(true) },
            { icon: <Navigation className="w-5 h-5" />, label: 'Route', color: 'bg-blue-50 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white', action: () => setShowRouteChoice(true) },
            { icon: <ListOrdered className="w-5 h-5" />, label: viewMode === 'list' ? 'Cards' : 'List', color: 'bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white', action: () => setViewMode(v => v === 'cards' ? 'list' : 'cards') },
            { icon: <Phone className="w-5 h-5" />, label: 'Office', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white', action: () => window.open('tel:+447000000000') },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className={`flex flex-col items-center gap-2 py-4 rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest border border-transparent ${btn.color}`}>
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {/* ── Route Progress ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Today's Manifest</span>
            <span className="text-[10px] font-black text-[var(--brand-orange)] italic">{progress}% Complete</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-orange-400 to-[var(--brand-orange)] rounded-full" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', val: totalAll, color: 'text-slate-700' },
              { label: 'Active', val: totalActive, color: 'text-blue-500' },
              { label: 'Done', val: totalDone, color: 'text-emerald-500' },
              { label: 'Issues', val: failed.length, color: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="text-center bg-slate-50 rounded-2xl py-3">
                <p className={`text-xl font-black italic ${s.color}`}>{s.val}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Route stop timeline */}
          {(activeShipments.length > 0 || activeBookings.length > 0) && (
            <div className="pt-2 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stop Order</p>
              <div className="space-y-1.5">
                {activeShipments.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                    <span className="w-5 h-5 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 truncate">{s.customer}</p>
                      <p className="text-[9px] text-slate-400 font-bold truncate">{s.metadata?.delivery_address || s.destination}</p>
                    </div>
                    <button onClick={() => setMapAddress(s.metadata?.delivery_address || s.destination)}
                      className="w-7 h-7 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all flex-shrink-0">
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {activeBookings.map((b, i) => {
                  const addr = b.delivery_address || b.collection_address || b.route;
                  return (
                    <div key={b.id} className="flex items-center gap-3 bg-orange-50 rounded-2xl px-4 py-3">
                      <span className="w-5 h-5 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0">{activeShipments.length + i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 truncate">{b.customer} <span className="text-[9px] font-bold text-orange-500 normal-case">(Booking)</span></p>
                        <p className="text-[9px] text-slate-400 font-bold truncate">{addr}</p>
                      </div>
                      <button onClick={() => setMapAddress(addr || '')}
                        className="w-7 h-7 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all flex-shrink-0">
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowRouteChoice(true)}
                className="w-full py-3 rounded-2xl bg-[var(--brand-blue)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" /> Optimise Full Route — Google / Waze
              </button>
            </div>
          )}
        </div>

        {/* ── Shipments ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              {user.role === 'ADMIN' ? 'All Active' : 'My Assignments'} — {totalActive}
            </h4>
          </div>

          {isLoading ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading...</div>
          ) : activeShipments.length === 0 && activeBookings.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase italic tracking-tighter text-lg">No Shipments Assigned</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Waiting for admin assignment</p>
              </div>
              <button onClick={() => setShowScanner(true)}
                className="px-6 py-3 bg-orange-50 text-[var(--brand-orange)] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] hover:text-white transition-all inline-flex items-center gap-2">
                <ScanLine className="w-4 h-4" /> Scan a Label
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* ── Compact list view ── */
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {activeShipments.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-all">
                  <span className="w-5 h-5 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{s.id} · {s.customer}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{s.metadata?.delivery_address || s.destination}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase flex-shrink-0 ${s.status === 'In Transit' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>{s.status}</span>
                  <div className="flex gap-1">
                    {s.metadata?.sender_phone && (
                      <a href={`tel:${s.metadata.sender_phone}`} className="w-7 h-7 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                        <Phone className="w-3 h-3" />
                      </a>
                    )}
                    <button onClick={() => setMapAddress(s.metadata?.delivery_address || s.destination)}
                      className="w-7 h-7 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                      <Navigation className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Card view ── */
            <div className="space-y-4">
              {activeShipments.map((shipment, i) => {
                const isPickup   = shipment.metadata?.pickup_driver_id === user.id;
                const isDelivery = shipment.metadata?.delivery_driver_id === user.id;
                const assignLabel = isPickup && isDelivery ? 'Pickup & Delivery' : isPickup ? 'Pickup' : isDelivery ? 'Delivery' : 'Active';
                const isExpanded  = expandedId === shipment.id;
                const phone = shipment.metadata?.sender_phone || shipment.metadata?.receiver_phone || '';
                const address = shipment.metadata?.delivery_address || shipment.destination;

                return (
                  <motion.div key={shipment.id} id={`card-${shipment.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`bg-white rounded-[2.5rem] border shadow-sm transition-all overflow-hidden ${isExpanded ? 'border-[var(--brand-orange)] shadow-xl shadow-orange-500/10' : 'border-slate-100 hover:shadow-lg'}`}>

                    {/* Card header — always visible */}
                    <div className="p-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : shipment.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${shipment.status === 'In Transit' || shipment.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">#{i + 1} · {shipment.id}</p>
                            <h5 className="text-base font-black text-slate-900 italic tracking-tight uppercase mt-0.5">{shipment.customer}</h5>
                            <p className="text-xs text-slate-500 font-bold mt-0.5 leading-tight line-clamp-1">{address}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {user.role === 'DRIVER' && (
                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase whitespace-nowrap ${isPickup && isDelivery ? 'bg-purple-50 text-purple-500' : isPickup ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                              {assignLabel}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase whitespace-nowrap ${shipment.status === 'In Transit' ? 'bg-blue-500 text-white' : shipment.status === 'Out for Delivery' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {shipment.status}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Quick action row */}
                      <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                        {phone && (
                          <a href={`tel:${phone}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        )}
                        {phone && (
                          <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        <button onClick={() => setMapAddress(address)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                          <Navigation className="w-3.5 h-3.5" /> Map
                        </button>
                        <Link href={`/track?id=${shipment.id}`}
                          className="py-2.5 px-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="px-6 pb-6 space-y-5 border-t border-slate-50 pt-5">

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Type', val: shipment.type },
                                { label: 'Weight', val: shipment.weight },
                                { label: 'Origin', val: shipment.origin || 'London Warehouse' },
                                { label: 'Destination', val: shipment.destination },
                                ...(shipment.metadata?.pieces ? [{ label: 'Pieces', val: `${shipment.metadata.pieces} pcs` }] : []),
                                ...(shipment.metadata?.declared_value ? [{ label: 'Value', val: `£${shipment.metadata.declared_value}` }] : []),
                              ].map(d => (
                                <div key={d.label} className="bg-slate-50 rounded-2xl px-4 py-3">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</p>
                                  <p className="text-sm font-black text-slate-800 italic uppercase tracking-tight mt-0.5">{d.val || '—'}</p>
                                </div>
                              ))}
                            </div>

                            {/* Notes */}
                            {shipment.notes && (
                              <div className="bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">⚠ Instructions</p>
                                <p className="text-xs font-bold text-amber-700">{shipment.notes}</p>
                              </div>
                            )}

                            {/* Status flow buttons */}
                            <div className="space-y-2" onClick={e => e.stopPropagation()}>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</p>
                              <div className="grid grid-cols-2 gap-2">
                                {STATUS_FLOW.map(s => (
                                  <button key={s.key}
                                    onClick={e => { e.stopPropagation(); updateShipmentStatus(shipment.id, s.key); }}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${shipment.status === s.key ? `${s.color} text-white shadow-lg` : `${s.bg} ${s.textColor} hover:opacity-80`}`}>
                                    <span>{s.icon}</span> {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Report Issue */}
                            <button onClick={e => { e.stopPropagation(); setIssueReport({ shipmentId: shipment.id, reason: '', note: '' }); }}
                              className="w-full py-3 rounded-2xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100">
                              <TriangleAlert className="w-3.5 h-3.5" /> Report Delivery Issue
                            </button>

                            {/* Photo capture */}
                            <div className="space-y-3" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photos</p>
                                <button
                                  onClick={e => { e.stopPropagation(); setPhotoTarget({ id: shipment.id, type: 'shipment' }); setTimeout(() => photoInputRef.current?.click(), 50); }}
                                  disabled={uploadingPhoto && photoTarget?.id === shipment.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-40">
                                  {uploadingPhoto && photoTarget?.id === shipment.id
                                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                                    : <><Camera className="w-3 h-3" /> Take Photo</>}
                                </button>
                              </div>
                              {(photoCache[shipment.id] ?? []).length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {(photoCache[shipment.id]).map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                                      className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 hover:opacity-80 transition-all">
                                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              ) : photoCache[shipment.id] !== undefined ? (
                                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                  <ImageOff className="w-3.5 h-3.5" /> No photos yet
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Assigned Bookings ── */}
        {activeBookings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Assigned Pickups — {activeBookings.length}
              </h4>
            </div>
            <div className="space-y-4">
              {activeBookings.map((booking, i) => {
                const isExpanded = expandedBookingId === booking.id;
                const collectAddr = booking.collection_address || booking.route;
                const deliverAddr = booking.delivery_address  || booking.route;
                return (
                  <motion.div key={booking.id} id={`card-${booking.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`bg-white rounded-[2.5rem] border shadow-sm transition-all overflow-hidden ${isExpanded ? 'border-[var(--brand-orange)] shadow-xl shadow-orange-500/10' : 'border-slate-100 hover:shadow-lg'}`}>

                    {/* Card header */}
                    <div className="p-6 cursor-pointer" onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-500">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">#{i + 1} · {booking.id}</p>
                            <h5 className="text-base font-black text-slate-900 italic tracking-tight uppercase mt-0.5">{booking.customer}</h5>
                            <p className="text-xs text-slate-500 font-bold mt-0.5 leading-tight line-clamp-1">{collectAddr}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase bg-orange-50 text-orange-500 whitespace-nowrap">Booking</span>
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase whitespace-nowrap ${booking.status === 'In Transit' ? 'bg-blue-500 text-white' : booking.status === 'Picked Up' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {booking.status}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                        {collectAddr && (
                          <button onClick={() => setMapAddress(collectAddr)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
                            <MapPin className="w-3.5 h-3.5" /> Collect
                          </button>
                        )}
                        {deliverAddr && (
                          <button onClick={() => setMapAddress(deliverAddr)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                            <Navigation className="w-3.5 h-3.5" /> Deliver
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="px-6 pb-6 space-y-5 border-t border-slate-50 pt-5">
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Type', val: booking.type },
                                { label: 'Date', val: booking.date },
                                { label: 'Collection', val: collectAddr },
                                { label: 'Delivery', val: deliverAddr },
                                ...(booking.total_amount ? [{ label: 'Amount', val: `£${booking.total_amount}` }] : []),
                                ...(booking.payment_status ? [{ label: 'Payment', val: booking.payment_status }] : []),
                              ].map(d => (
                                <div key={d.label} className="bg-slate-50 rounded-2xl px-4 py-3">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</p>
                                  <p className="text-xs font-black text-slate-800 italic uppercase tracking-tight mt-0.5 truncate">{d.val || '—'}</p>
                                </div>
                              ))}
                            </div>

                            {/* Status flow buttons */}
                            <div className="space-y-2" onClick={e => e.stopPropagation()}>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</p>
                              <div className="grid grid-cols-2 gap-2">
                                {STATUS_FLOW.map(s => (
                                  <button key={s.key}
                                    onClick={e => { e.stopPropagation(); updateBooking(booking.id, { status: s.key }); }}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${booking.status === s.key ? `${s.color} text-white shadow-lg` : `${s.bg} ${s.textColor} hover:opacity-80`}`}>
                                    <span>{s.icon}</span> {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Photo capture */}
                            <div className="space-y-3" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photos</p>
                                <button
                                  onClick={e => { e.stopPropagation(); setPhotoTarget({ id: booking.id, type: 'booking' }); setTimeout(() => photoInputRef.current?.click(), 50); }}
                                  disabled={uploadingPhoto && photoTarget?.id === booking.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-40">
                                  {uploadingPhoto && photoTarget?.id === booking.id
                                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                                    : <><Camera className="w-3 h-3" /> Take Photo</>}
                                </button>
                              </div>
                              {(photoCache[booking.id] ?? []).length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {(photoCache[booking.id]).map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                                      className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 hover:opacity-80 transition-all">
                                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              ) : photoCache[booking.id] !== undefined ? (
                                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                  <ImageOff className="w-3.5 h-3.5" /> No photos yet
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Completed today ── */}
        {delivered.length > 0 && (
          <section className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Completed — {delivered.length}</h4>
            <div className="space-y-2">
              {delivered.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{s.id} · {s.customer}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{s.metadata?.delivery_address || s.destination}</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[8px] font-black uppercase">Done</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Issues ── */}
        {failed.length > 0 && (
          <section className="space-y-3">
            <h4 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] px-1">Failed — {failed.length}</h4>
            <div className="space-y-2">
              {failed.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-red-100 px-5 py-4 flex items-center gap-4">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{s.id} · {s.customer}</p>
                    <p className="text-[10px] text-red-400 font-bold truncate">{s.status_note || 'Failed delivery'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Completed Bookings ── */}
        {completedBookings.length > 0 && (
          <section className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Completed Pickups — {completedBookings.length}</h4>
            <div className="space-y-2">
              {completedBookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{b.id} · {b.customer}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{b.delivery_address || b.route}</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[8px] font-black uppercase">Done</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Route Map ── */}
        {(activeShipments.length > 0 || activeBookings.length > 0) && (() => {
          const allAddrs = getAllRouteAddresses();
          const nextStop = allAddrs[0];
          if (!nextStop) return null;
          const googleRouteUrl = `https://www.google.com/maps/dir/Current+Location/${allAddrs.map(a => encodeURIComponent(a)).join('/')}/${encodeURIComponent(WAREHOUSE_ADDR)}`;
          return (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Route Map</h4>
                <button onClick={() => setShowRouteChoice(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                  <Navigation className="w-3 h-3" /> Open Navigation
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Embedded map — shows next stop (Google blocks /dir/ in iframes) */}
                <div style={{ height: 220 }} className="relative">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(nextStop)}&output=embed&z=15`}
                    width="100%" height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Route map"
                  />
                  {/* Stop counter badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase backdrop-blur-sm">
                    {allAddrs.length} stop{allAddrs.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Next stop info + navigation */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Next Stop</p>
                      <p className="text-sm font-black text-slate-900 leading-tight line-clamp-2">{nextStop}</p>
                    </div>
                    <button onClick={() => setMapAddress(nextStop)}
                      className="px-4 py-2.5 bg-orange-50 text-[var(--brand-orange)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] hover:text-white transition-all flex-shrink-0 flex items-center gap-1.5">
                      <Navigation className="w-3 h-3" /> Navigate
                    </button>
                  </div>

                  {/* Destination info */}
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-6 h-6 bg-[var(--brand-blue)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Return to Warehouse</p>
                      <p className="text-[10px] font-bold text-slate-600 truncate">{WAREHOUSE_ADDR}</p>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <a href={googleRouteUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                      <Navigation className="w-3.5 h-3.5" /> Google Maps
                    </a>
                    <a href={`https://waze.com/ul?q=${encodeURIComponent(nextStop)}&navigate=yes`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 bg-sky-400 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-sky-500 transition-all">
                      <Navigation className="w-3.5 h-3.5" /> Waze
                    </a>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── Scoreboard ── */}
        <section className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--brand-orange)] opacity-10 rounded-full translate-x-16 -translate-y-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Fleet <span className="text-[var(--brand-orange)]">Score</span></h2>
                <p className="text-blue-200 text-xs mt-1 font-bold opacity-60">{user.name} · Today's session</p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.ceil(progress / 20) ? 'text-[var(--brand-orange)] fill-[var(--brand-orange)]' : 'text-slate-700'}`} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Delivered', val: `${totalDone}/${totalAll}`, icon: '📦' },
                { label: 'Active', val: totalActive, icon: '🚚' },
                { label: 'Progress', val: `${progress}%`, icon: '⚡' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-4 bg-white/5 rounded-[1.5rem] border border-white/5">
                  <p className="text-lg">{stat.icon}</p>
                  <p className="text-lg font-black text-white italic tracking-tighter uppercase">{stat.val}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Hidden file input for photo capture */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
      />
    </main>
  );
}
