'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Package, Truck, Users, TrendingUp, MoreVertical,
  Search, Filter, ArrowUpRight, Clock, CheckCircle2, Inbox,
  UserCheck, X
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';

interface Driver { id: string; name: string; phone: string; email?: string; vehicle: string; zone: string; status: string; }

export default function AdminPage() {
  const { user } = useAuth();
  const { bookings, shipments, quotes, containers, deleteBooking, updateBooking } = useData();
  const [searchTerm, setSearchTerm]           = useState('');
  const [activeActionId, setActiveActionId]   = useState<string | null>(null);
  const [drivers, setDrivers]                 = useState<Driver[]>([]);
  const [assignBookingId, setAssignBookingId] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver]   = useState('');
  const [assigning, setAssigning]             = useState(false);

  useEffect(() => {
    // Load from profiles WHERE role='DRIVER' — auth UUID is already their id
    supabase.from('profiles').select('id,name,email').eq('role', 'DRIVER').order('name')
      .then(({ data }) => {
        if (data) setDrivers(data.map(p => ({
          id: p.id, name: p.name || p.email || p.id, email: p.email,
          phone: '', vehicle: '', zone: '', status: 'Active',
        })) as Driver[]);
      });
  }, []);

  const stats = [
    { title: 'Total Shipments', value: shipments.length.toLocaleString(), change: `${shipments.filter(s => s.status !== 'Delivered').length} active`, icon: Truck, color: 'bg-blue-500' },
    { title: 'Active Quotes', value: quotes.filter(q => q.status === 'Pending').length.toString(), change: `${quotes.length} total`, icon: BarChart3, color: 'bg-orange-500' },
    { title: 'Containers', value: containers.length.toString(), change: `${containers.filter(c => c.status === 'In Transit').length} in transit`, icon: Package, color: 'bg-purple-500' },
    { title: 'Total Bookings', value: bookings.length.toLocaleString(), change: `${bookings.filter(b => b.status === 'Pending Pickup').length} pending`, icon: TrendingUp, color: 'bg-emerald-500' },
  ];

  const handleCancelOrder = (id: string) => {
    if (confirm('Are you sure you want to cancel and delete this order?')) {
      deleteBooking(id);
      setActiveActionId(null);
    }
  };

  const handleAssignDriver = async () => {
    if (!assignBookingId || !selectedDriver) return;
    setAssigning(true);
    const driver = drivers.find(d => d.id === selectedDriver);
    if (!driver) { setAssigning(false); return; }

    // driver.id is already the auth UUID (loaded from profiles)
    await updateBooking(assignBookingId, { driver_id: selectedDriver, driver_name: driver.name });

    const booking = bookings.find(b => b.id === assignBookingId);
    await supabase.from('notifications').insert({
      user_id: selectedDriver,
      type: 'assignment',
      title: 'New Booking Assigned',
      message: `You have been assigned booking ${assignBookingId} — ${booking?.route || ''}`,
      data: { booking_id: assignBookingId },
    });

    setAssigning(false);
    setAssignBookingId(null);
    setSelectedDriver('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':     return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'At Sea':        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Warehouse':  return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'In Custom':     return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:              return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Assign Driver Modal */}
      <AnimatePresence>
        {assignBookingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-tight">Assign Driver</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Booking: {assignBookingId}</p>
                  </div>
                  <button onClick={() => { setAssignBookingId(null); setSelectedDriver(''); }}
                    className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-400 text-slate-400 rounded-xl flex items-center justify-center transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Driver</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {drivers.map(d => (
                      <button key={d.id} onClick={() => setSelectedDriver(d.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border-2 text-left transition-all ${selectedDriver === d.id ? 'border-[var(--brand-orange)] bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                        <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                          {d.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 text-sm">{d.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{d.email || 'Driver'}</p>
                        </div>
                        {selectedDriver === d.id && <CheckCircle2 className="w-5 h-5 text-[var(--brand-orange)] flex-shrink-0" />}
                      </button>
                    ))}
                    {drivers.length === 0 && (
                      <p className="text-center py-6 text-slate-400 font-bold text-sm">No drivers found — create drivers in User Management</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setAssignBookingId(null); setSelectedDriver(''); }}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleAssignDriver} disabled={!selectedDriver || assigning}
                    className="flex-1 py-4 rounded-2xl bg-[var(--brand-orange)] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    {assigning ? 'Assigning...' : 'Assign Driver'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow ml-72 p-10 space-y-10">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Logistics <span className="text-[var(--brand-orange)] font-black">Control</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search ID, Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all" />
            </div>
            <Link href="/admin/users" className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center relative hover:bg-slate-200 transition-all group">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-3 right-3 border-2 border-white shadow-sm" />
              <Users className="w-5 h-5 text-slate-600 group-hover:text-[var(--brand-blue)] transition-colors" />
            </Link>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
              <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user?.permissions.canAccessAccounting && (
            <Link href="/admin/accounting" className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 opacity-50 -translate-y-12 translate-x-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Accounting <span className="text-emerald-500">& Finance</span></h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage revenue, invoices & payouts</p>
                </div>
                <ArrowUpRight className="ml-auto w-6 h-6 text-slate-200 group-hover:text-emerald-500" />
              </div>
            </Link>
          )}
          {user?.permissions.canAccessHR && (
            <Link href="/admin/hr" className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 opacity-50 -translate-y-12 translate-x-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Human <span className="text-blue-500">Resources</span></h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel directory & payroll management</p>
                </div>
                <ArrowUpRight className="ml-auto w-6 h-6 text-slate-200 group-hover:text-blue-500" />
              </div>
            </Link>
          )}
          {user?.permissions.canAccessSettings && (
            <Link href="/admin/messages" className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-violet-50 opacity-50 -translate-y-12 translate-x-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-violet-500 group-hover:text-white transition-all">
                  <Inbox className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Contact <span className="text-violet-500">Inbox</span></h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Messages from the contact form</p>
                </div>
                <ArrowUpRight className="ml-auto w-6 h-6 text-slate-200 group-hover:text-violet-500" />
              </div>
            </Link>
          )}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Recent <span className="text-[var(--brand-orange)] font-black">Bookings</span></h3>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{bookings.length} Total</div>
            </div>
            <Link href="/booking" className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Package className="w-4 h-4" /> New Booking
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Route</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Driver</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.filter(b =>
                  b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  b.customer.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 text-sm">{order.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                          {order.customer.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-[var(--brand-blue)] uppercase tracking-tighter italic whitespace-nowrap">{order.route}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{order.type}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-400 whitespace-nowrap">{order.date}</td>
                    <td className="px-8 py-5">
                      {order.driver_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[9px]">
                            {order.driver_name.charAt(0)}
                          </div>
                          <span className="text-xs font-black text-slate-700">{order.driver_name}</span>
                        </div>
                      ) : (
                        <button onClick={() => { setAssignBookingId(order.id); setSelectedDriver(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[var(--brand-orange)] hover:bg-[var(--brand-orange)] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          <UserCheck className="w-3 h-3" /> Assign
                        </button>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === order.id ? null : order.id); }}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 group-hover:text-slate-900 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {activeActionId === order.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveActionId(null)} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute right-16 top-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden text-left">
                              <div className="p-2 space-y-1">
                                <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-300 uppercase tracking-widest">Update Status</p>
                                {['Pending Pickup', 'In Warehouse', 'At Sea', 'In Custom', 'Delivered'].map(s => (
                                  <button key={s} onClick={() => { updateBooking(order.id, { status: s }); setActiveActionId(null); }}
                                    className={`w-full text-left px-4 py-1.5 text-xs font-bold rounded-xl transition-all uppercase italic tracking-tighter ${order.status === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)]'}`}>
                                    {s}
                                  </button>
                                ))}
                                <div className="h-px bg-slate-100 my-1" />
                                <button onClick={() => { setAssignBookingId(order.id); setSelectedDriver(''); setActiveActionId(null); }}
                                  className="w-full text-left px-4 py-2 text-xs font-black text-[var(--brand-orange)] hover:bg-orange-50 rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2">
                                  <UserCheck className="w-3.5 h-3.5" /> Assign Driver
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button onClick={() => handleCancelOrder(order.id)}
                                  className="w-full text-left px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase italic tracking-tighter">
                                  Cancel Order
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
            <Link href="/admin/shipments" className="text-sm font-black text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors uppercase italic tracking-tighter">
              View all system shipments ➔
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
