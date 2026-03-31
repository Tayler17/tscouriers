'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  FileText,
  Users,
  Download
} from 'lucide-react';
import Link from 'next/link';

const MOCK_CUSTOMER_SHIPMENTS = [
  { id: 'TS-7821', origin: 'London Hub', destination: 'SDQ', status: 'In Warehouse', date: '28 Mar 2026', type: 'Barrel', payment: 'PAID' },
  { id: 'TS-7504', origin: 'London Hub', destination: 'Santiago', status: 'Delivered', date: '15 Mar 2026', type: 'Box x3', payment: 'PAID' },
];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') router.push('/login');
  }, [user]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 pt-32">
      <div className="container mx-auto max-w-5xl space-y-12">
        
        {/* Customer Header */}
        <header className="flex justify-between items-center bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-orange-100 text-[var(--brand-orange)] rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-lg shadow-orange-500/10">
                 {user.name.charAt(0)}
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">My <span className="text-[var(--brand-orange)] font-black">Shipments</span></h1>
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">Hello, {user.name} 👋</p>
              </div>
           </div>
           <button onClick={logout} className="p-5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-3xl transition-all">
              <LogOut className="w-6 h-6" />
           </button>
        </header>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Shipments List */}
           <section className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-6">
                 <h3 className="text-xl font-black text-slate-800 italic uppercase">Logistics <span className="text-[var(--brand-orange)]">History</span></h3>
                 <div className="flex items-center gap-4">
                    <button 
                       onClick={() => {
                           const headers = ['ID', 'Origin', 'Destination', 'Status', 'Date', 'Type', 'Payment'];
                           const csvContent = [
                               headers.join(','),
                               ...MOCK_CUSTOMER_SHIPMENTS.map(s => [s.id, s.origin, s.destination, s.status, s.date, s.type, s.payment].join(','))
                           ].join('\n');
                           const blob = new Blob([csvContent], { type: 'text/csv' });
                           const url = window.URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.setAttribute('hidden', '');
                           a.setAttribute('href', url);
                           a.setAttribute('download', 'my_shipments_history.csv');
                           document.body.appendChild(a);
                           a.click();
                           document.body.removeChild(a);
                       }}
                       className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                       <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search ID..." 
                         className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-100 outline-none w-48 text-xs font-bold shadow-sm"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 {MOCK_CUSTOMER_SHIPMENTS.map((shipment, i) => (
                   <motion.div 
                     key={shipment.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"
                   >
                      <div className="flex justify-between items-start mb-10">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tracking ID</p>
                            <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">{shipment.id}</h4>
                         </div>
                         <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border ${shipment.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                            {shipment.status}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 pb-10 border-b border-slate-50">
                         <div className="space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-blue)] transition-colors">
                                  <MapPin className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Route</p>
                                  <p className="font-black text-slate-800 italic uppercase italic tracking-tighter">{shipment.origin} ➔ {shipment.destination}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-orange)] transition-colors">
                                  <Package className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Type</p>
                                  <p className="font-bold text-slate-800">{shipment.type}</p>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-6 text-right">
                            <div className="flex flex-col items-end">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Payment Status</p>
                               <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm italic">
                                  <CheckCircle2 className="w-4 h-4" /> {shipment.payment}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Booked On</p>
                               <span className="font-bold text-slate-500">{shipment.date}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <Link href={`/track?id=${shipment.id}`} className="text-sm font-black text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors italic uppercase tracking-tighter flex items-center gap-2">
                               View Detailed Tracking <ArrowRight className="w-4 h-4" />
                            </Link>
                         </div>
                         <div className="flex items-center gap-2">
                            <Link 
                               href={`/shipments/${shipment.id}/label`}
                               className="p-4 bg-slate-50 text-slate-400 hover:bg-[var(--brand-orange)] hover:text-white rounded-2xl transition-all shadow-sm"
                               title="Print Shipping Label"
                            >
                               <QrCode className="w-5 h-5" />
                            </Link>
                            <Link 
                               href={`/shipments/${shipment.id}/invoice`}
                               className="p-4 bg-slate-50 text-slate-400 hover:bg-[var(--brand-blue)] hover:text-white rounded-2xl transition-all shadow-sm"
                               title="Download Commercial Invoice"
                            >
                               <FileText className="w-5 h-5" />
                            </Link>
                         </div>
                      </div>
                   </motion.div>
                 ))}
                 
                 <Link href="/booking" className="block w-full text-center py-10 rounded-[3.5rem] bg-white border-2 border-dashed border-slate-100 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all font-bold group">
                    <span className="flex items-center justify-center gap-3">
                       <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /> Need another shipping? Start Booking
                    </span>
                 </Link>
              </div>
           </section>

            {/* Sidebar: Loyalty / Promo */}
            <div className="lg:col-span-4 space-y-10">
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm text-center group hover:border-[var(--brand-orange)] transition-all">
                  <div className="w-16 h-16 bg-orange-50 text-[var(--brand-orange)] rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                     <Users className="w-8 h-8" />
                  </div>
                  <h5 className="font-black text-slate-800 mb-2 uppercase italic">Address Book</h5>
                  <p className="text-xs text-slate-400 leading-relaxed mb-8">Save your frequent recipients for faster booking.</p>
                  <Link href="/customer/address-book" className="btn-primary w-full py-4 rounded-2xl inline-block text-xs uppercase font-black tracking-widest italic">Open My Book</Link>
               </div>

               <div className="bg-[var(--brand-blue)] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -translate-y-12 translate-x-12 rounded-full" />
                  <ShieldCheck className="w-12 h-12 text-[var(--brand-orange)] mb-6" />
                  <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4">Proobia <br /> <span className="text-[var(--brand-orange)]">Care Plus</span></h4>
                  <p className="text-blue-100 text-sm leading-relaxed mb-10">You have 1 active shipment covered with premium insurance.</p>
               </div>

               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                     <Clock className="w-8 h-8" />
                  </div>
                  <h5 className="font-black text-slate-800 mb-2 uppercase italic">Need Help?</h5>
                  <p className="text-xs text-slate-400 leading-relaxed mb-8">Our bilingual support is available 24/7.</p>
                  <Link href="/contact" className="btn-primary w-full py-4 rounded-2xl inline-block text-xs">Chat with Support</Link>
               </div>
            </div>
        </div>
      </div>
    </main>
  );
}

function PlusIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
