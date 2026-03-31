'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { 
  UserCheck, 
  Truck, 
  MapPin, 
  Phone, 
  Calendar, 
  Star,
  MoreVertical,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_DRIVERS = [
  { id: 'DRV-01', name: 'Marco Antonio', vehicle: 'Van Custom XL', status: 'Online', rating: 4.9, activeRoute: 'RT-101', lastActive: 'Now' },
  { id: 'DRV-02', name: 'Luis Vasquez', vehicle: 'Truck 3.5T', status: 'Online', rating: 4.8, activeRoute: 'RT-102', lastActive: 'Now' },
  { id: 'DRV-03', name: 'Franklin Jose', vehicle: 'Small Van', status: 'Offline', rating: 4.7, activeRoute: 'None', lastActive: '2h ago' },
  { id: 'DRV-04', name: 'Miguel Angel', vehicle: 'Box Truck', status: 'On Route', rating: 4.9, activeRoute: 'RT-104', lastActive: 'Now' },
  { id: 'DRV-05', name: 'Jose Ramon', vehicle: 'Moto Courier', status: 'Pending', rating: 4.5, activeRoute: 'None', lastActive: 'Today' },
];

export default function DriversPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Driver <span className="text-[var(--brand-orange)] font-black">Fleet</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel & Vehicle Logistics</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input type="text" placeholder="Search Driver..." className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm" />
              </div>
              <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add Driver
              </button>
           </div>
        </header>

        {/* Fleet Monitor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {MOCK_DRIVERS.map((driver, i) => (
             <motion.div 
               key={driver.id} 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all"
             >
                <div className="flex justify-between items-start mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                         {driver.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 text-lg">{driver.name}</h3>
                         <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                            driver.status === 'Online' ? 'text-emerald-500' : 
                            driver.status === 'On Route' ? 'text-blue-500' :
                            'text-slate-400'
                         }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                               driver.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 
                               driver.status === 'On Route' ? 'bg-blue-500 animate-pulse' :
                               'bg-slate-400'
                            }`} />
                            {driver.status}
                         </div>
                      </div>
                   </div>
                   <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                         <Truck className="w-4 h-4 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-500 uppercase">Vehicle</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase">{driver.vehicle}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                         <Calendar className="w-4 h-4 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-500 uppercase">Last Active</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase">{driver.lastActive}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                         <Star className="w-4 h-4 text-orange-400" />
                         <span className="text-[10px] font-black text-slate-500 uppercase">Rating</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase">{driver.rating} / 5</span>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                   <div className="text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Route</p>
                      <p className="font-black text-[var(--brand-blue)] italic">{driver.activeRoute}</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                         <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
                         <MapPin className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  );
}
