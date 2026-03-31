'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  DollarSign, 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Globe, 
  TrendingUp,
  Box,
  Anchor,
  Plane,
  ChevronRight,
  Info,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_RATES = [
  { id: 'RT-001', item: 'Standard Barrel', type: 'Sea Freight', origin: 'London', destination: 'DR', rate: '£120.00', status: 'Active' },
  { id: 'RT-002', item: 'Large Box', type: 'Sea Freight', origin: 'London', destination: 'DR', rate: '£45.00', status: 'Active' },
  { id: 'RT-003', item: 'Medium Box', type: 'Sea Freight', origin: 'London', destination: 'DR', rate: '£30.00', status: 'Active' },
  { id: 'RT-004', item: 'Electronics (Box)', type: 'Air Freight', origin: 'London', destination: 'DR', rate: '£6.50/kg', status: 'Review' },
  { id: 'RT-005', item: 'Appliances (Large)', type: 'Sea Freight', origin: 'Madrid', destination: 'DR', rate: '£180.00', status: 'Active' },
  { id: 'RT-006', item: 'Pallet (Commercial)', type: 'Sea Freight', origin: 'London', destination: 'Spain', rate: '£450.00', status: 'Active' },
];

export default function RatesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Freight <span className="text-[var(--brand-orange)] font-black">Rates</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Tariff Management by Bulto Type</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                 <Plus className="w-4 h-4" /> New Tariff
              </button>
           </div>
        </header>

        {/* Pricing Strategy Summary */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">Current <span className="text-[var(--brand-orange)]">Pricing</span> Engine</h2>
                 <p className="text-blue-200 text-sm max-w-lg leading-relaxed font-bold uppercase tracking-widest italic opacity-60">Tariffs are calculated per item type (bulto) for Sea Freight and by volumetric weight for Air Freight.</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white/10 p-6 rounded-[2.5rem] border border-white/5 text-center min-w-[140px]">
                    <Anchor className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest">Sea Routes</p>
                    <p className="text-xl font-black italic tracking-tighter uppercase text-white">Flat Fee</p>
                 </div>
                 <div className="bg-white/10 p-6 rounded-[2.5rem] border border-white/5 text-center min-w-[140px]">
                    <Plane className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase text-blue-200 tracking-widest">Air Routes</p>
                    <p className="text-xl font-black italic tracking-tighter uppercase text-white">/KG Rate</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Rates Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Master <span className="text-[var(--brand-orange)] font-black">Tariffs</span></h3>
                 <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 italic">Effective: Q1 2026</div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search Items..." className="pl-12 pr-6 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-48 text-xs font-bold shadow-inner" />
                 </div>
                 <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                    <Filter className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                       <th className="px-8 py-4">Item Type / Description</th>
                       <th className="px-8 py-4">Freight Mode</th>
                       <th className="px-8 py-4">Route Corridor</th>
                       <th className="px-8 py-4">Base Rate</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 italic">
                    {MOCK_RATES.map((rate, i) => (
                       <tr key={rate.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="font-black text-slate-900 italic uppercase tracking-tighter">{rate.item}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code: {rate.id}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                {rate.type === 'Sea Freight' ? (
                                   <Anchor className="w-3.5 h-3.5 text-blue-500" />
                                ) : (
                                   <Plane className="w-3.5 h-3.5 text-purple-500" />
                                )}
                                <span className="text-[10px] font-black text-slate-700 uppercase italic tracking-tighter">{rate.type}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[10px] font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{rate.origin} ➔ {rate.destination}</span>
                          </td>
                          <td className="px-8 py-6 font-black text-slate-900 text-lg">{rate.rate}</td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border italic ${
                                rate.status === 'Active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100'
                             }`}>
                                {rate.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2 text-slate-400">
                                <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all">
                                   <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all">
                                   <MoreVertical className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed flex items-center justify-center gap-2">
                 <Info className="w-3 h-3" /> Rates are subject to weekly verification based on international fuel surcharges.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
