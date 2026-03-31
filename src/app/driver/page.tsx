'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Package, 
  Phone, 
  ChevronRight, 
  LogOut, 
  CheckCircle2, 
  Clock,
  Navigation,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  Layers
} from 'lucide-react';
import Link from 'next/link';

const MOCK_DRIVER_ROUTE = {
  id: 'RT-101',
  origin: 'London Hub',
  destination: 'Kent / Sussex Area',
  status: 'In Transit',
  progress: 65,
  shipments: [
    { id: 'TS-9011', customer: 'Carlos Ruiz', weight: '45kg', type: 'Barrel', status: 'In Transit', address: '123 High St, Bromley BR1 1AA' },
    { id: 'TS-9012', customer: 'Elena Gomez', weight: '22kg', type: 'Box x3', status: 'Delivered', address: '45 Park Ln, Croydon CR0 1JA' },
    { id: 'TS-9015', customer: 'Miguel Angel', weight: '90kg', type: 'Barrel x2', status: 'Pending Pickup', address: '88 Station Rd, Dartford DA1 1DR' },
    { id: 'TS-7821', customer: 'Ricardo Peña', weight: '45kg', type: 'Electronics', status: 'Pending Pickup', address: '10 The Mall, Bromley BR1 1TT' },
  ]
};

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [shipments, setShipments] = useState(MOCK_DRIVER_ROUTE.shipments);

  useEffect(() => {
    if (!user || (user.role !== 'DRIVER' && user.role !== 'ADMIN')) router.push('/login');
  }, [user]);

  const updateStatus = (id: string, newStatus: string) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 pt-32">
      <div className="container mx-auto max-w-4xl space-y-12">
        
        {/* Driver Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20">
                 {user.name.charAt(0)}
              </div>
              <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Fleet <span className="text-[var(--brand-orange)] font-black">Operator</span></h1>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Personnel ID: <span className="text-blue-500">OP-342</span></p>
              </div>
           </div>
           <button onClick={logout} className="p-4 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
              <LogOut className="w-6 h-6" />
           </button>
        </header>

        {/* Active Route Section */}
        <section className="space-y-8">
           <div className="flex items-center justify-between px-6">
              <h3 className="text-xl font-black text-slate-800 italic uppercase underline decoration-[var(--brand-orange)] decoration-4 underline-offset-8">Active <span className="text-[var(--brand-orange)]">Route</span></h3>
              <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg italic">
                 {MOCK_DRIVER_ROUTE.id} - {MOCK_DRIVER_ROUTE.destination}
              </div>
           </div>

           {/* Route Progress Bar */}
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-slate-400 italic">Origin: {MOCK_DRIVER_ROUTE.origin}</span>
                 <span className="text-[var(--brand-orange)] italic">Route Progress: {MOCK_DRIVER_ROUTE.progress}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${MOCK_DRIVER_ROUTE.progress}%` }}
                   className="absolute left-0 top-0 h-full bg-[var(--brand-orange)] rounded-full"
                 />
              </div>
           </div>

           {/* Shipments Checklist */}
           <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-6">Assigned Manifest ({shipments.length} Items)</h4>
              
              <div className="grid grid-cols-1 gap-6">
                 {shipments.map((shipment, i) => (
                   <motion.div 
                     key={shipment.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
                   >
                      <div className="flex justify-between items-start mb-8">
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                               shipment.status === 'Delivered' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                               {shipment.status === 'Delivered' ? <CheckCircle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Parcel ID</p>
                               <h5 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">{shipment.id}</h5>
                            </div>
                         </div>
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            shipment.status === 'Delivered' ? 'bg-emerald-500 text-white' : 
                            shipment.status === 'In Transit' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 font-bold'
                         }`}>
                            {shipment.status}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                         <div className="space-y-4">
                            <div className="flex items-center gap-4">
                               <MapPin className="w-4 h-4 text-slate-300" />
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer & Address</p>
                                  <p className="text-sm font-black text-slate-800 italic uppercase tracking-tighter">{shipment.customer}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{shipment.address}</p>
                               </div>
                            </div>
                            <div className="flex gap-4 items-center">
                               <Layers className="w-4 h-4 text-slate-300" />
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Specs</p>
                                  <p className="text-[10px] font-bold text-slate-900 uppercase">{shipment.type} | <span className="text-[var(--brand-orange)]">{shipment.weight}</span></p>
                               </div>
                            </div>
                         </div>
                         <div className="flex justify-end items-end gap-2">
                            <Link href={`/track?id=${shipment.id}`} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-[var(--brand-blue)] transition-all">
                               <ExternalLink className="w-5 h-5" />
                            </Link>
                            <button className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-all">
                               <Phone className="w-5 h-5" />
                            </button>
                            <button className="p-4 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-100 transition-all">
                               <Navigation className="w-5 h-5" />
                            </button>
                         </div>
                      </div>

                      {shipment.status !== 'Delivered' && (
                        <div className="pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => updateStatus(shipment.id, 'In Transit')}
                              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                shipment.status === 'In Transit' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 font-bold'
                              }`}
                            >
                               Start Transit
                            </button>
                            <button 
                              onClick={() => updateStatus(shipment.id, 'Delivered')}
                              className="py-4 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                            >
                               Confirm Delivery
                            </button>
                        </div>
                      )}
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Performance Overview */}
        <section className="bg-slate-900 p-10 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-orange)] opacity-10 rounded-full translate-x-20 -translate-y-20" />
           <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="space-y-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Fleet <span className="text-[var(--brand-orange)]">Scoreboard</span></h2>
                    <p className="text-blue-200 text-sm max-w-sm">Active session performance and real-time operational metrics for Fleet ID: <span className="text-white font-black italic">VAN-72</span></p>
                 </div>
                 <div className="flex items-center gap-6">
                    {[
                       { label: 'Deliveries', val: '4/12' },
                       { label: 'Rating', val: '4.9 ★' },
                       { label: 'Status', val: 'Active' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center p-6 bg-white/5 rounded-[2.5rem] border border-white/5 min-w-[120px]">
                         <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest">{stat.label}</p>
                         <p className="text-xl font-black text-white italic tracking-tighter uppercase">{stat.val}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </div>
    </main>
  );
}
