'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Zap,
  Users,
  ArrowRight,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_BRANCHES = [
  { id: 'BR-L01', name: 'London - Canary Wharf', type: 'Main Hub', address: '12 Canary Wharf, London, E14 5AB', country: 'United Kingdom', contact: '+44 20 7123 4567', staff: 24, status: 'Active' },
  { id: 'BR-S01', name: 'Santo Domingo - Haina', type: 'Distribution Port', address: 'Av. Circunvalación, Haina', country: 'Dominican Republic', contact: '+1 809 555 0123', staff: 18, status: 'Active' },
  { id: 'BR-M01', name: 'Madrid - Barajas', type: 'Warehouse', address: 'C. de la Alcarria, 28042 Madrid', country: 'Spain', contact: '+34 91 123 4567', staff: 12, status: 'Active' },
  { id: 'BR-C01', name: 'Santiago - North Hub', type: 'Regional Center', address: 'Autopista Duarte Km 9', country: 'Dominican Republic', contact: '+1 829 555 0987', staff: 10, status: 'Operational' },
];

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Branch <span className="text-[var(--brand-orange)] font-black">Control</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Global Network & Logistics Hubs</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add Branch
              </button>
           </div>
        </header>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                 <Globe className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Global Reach</p>
              <h3 className="text-2xl font-black text-slate-900">4 Countries</h3>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
                 <Building2 className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Operations</p>
              <h3 className="text-2xl font-black text-slate-900">8 Hubs</h3>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                 <Users className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Personnel</p>
              <h3 className="text-2xl font-black text-slate-900">64 Staff</h3>
           </div>
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <Zap className="w-20 h-20 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 italic">Network Health</p>
              <h3 className="text-2xl font-black italic tracking-tighter">Excellent</h3>
           </div>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {MOCK_BRANCHES.map((branch, i) => (
             <motion.div 
               key={branch.id} 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
             >
                <div className="flex justify-between items-start mb-10">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-xl border-2 border-slate-100 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-all">
                         <Building2 className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 italic uppercase underline decoration-[var(--brand-orange)] decoration-4 underline-offset-4">{branch.name}</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{branch.type} - {branch.id}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 text-[10px] font-black uppercase italic tracking-widest">
                         {branch.status}
                      </span>
                      <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 group-hover:text-slate-900">
                         <MoreVertical className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <div className="space-y-6 mb-10">
                   <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-slate-300 mt-1" />
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Physical Location</p>
                         <p className="text-sm font-black text-slate-800 italic uppercase tracking-tighter">{branch.address}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{branch.country}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Phone className="w-5 h-5 text-slate-300" />
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Line</p>
                         <p className="font-black text-slate-800 italic uppercase tracking-tighter text-sm">{branch.contact}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase italic">
                      <Users className="w-4 h-4" />
                      <span>{branch.staff} Management Personnel</span>
                   </div>
                   <button className="flex items-center gap-2 text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors font-black uppercase text-xs italic tracking-tighter group">
                      Manage Operations <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  );
}
