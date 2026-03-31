'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Container, 
  Printer, 
  MoreVertical, 
  Calendar,
  Anchor,
  Plane,
  Truck,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MOCK_CONTAINERS = [
  { id: 'CONT-4091', vessel: 'MSC VALENCIA', flight: '-', destination: 'SDQ - Haina', status: 'In Transit', count: 142, date: '25 Mar', type: '40ft' },
  { id: 'CONT-4092', vessel: 'SEA PROMISE', flight: '-', destination: 'SDQ - Haina', status: 'Loading', count: 85, date: '28 Mar', type: '40ft' },
  { id: 'CONT-4093', vessel: '-', flight: 'AM621', destination: 'Puj - Punta Cana', status: 'Ready to Ship', count: 12, date: '29 Mar', type: 'Air Cargo' },
  { id: 'CONT-4094', vessel: 'MAERSK ALABAMA', flight: '-', destination: 'SDQ - Caucedo', status: 'Delivered', count: 156, date: '10 Mar', type: '20ft' },
];

export default function ContainersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Loading': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Ready to Ship': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Container <span className="text-[var(--brand-orange)] font-black">Hold</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Consolidation & Manifest Control</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search ID, Vessel..." 
                   className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all shadow-inner"
                 />
              </div>
              <button className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 text-sm shadow-xl shadow-orange-500/10">
                 <Plus className="w-4 h-4" /> New Container
              </button>
           </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                 <Container className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Containers</p>
              <h3 className="text-2xl font-black text-slate-900">12</h3>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                 <Anchor className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Route (Sea)</p>
              <h3 className="text-2xl font-black text-slate-900">8</h3>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                 <Plane className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Route (Air)</p>
              <h3 className="text-2xl font-black text-slate-900">4</h3>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                 <Package className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Consignments</p>
              <h3 className="text-2xl font-black text-slate-900">428</h3>
           </div>
        </div>

        {/* Containers List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Manifest <span className="text-[var(--brand-orange)] font-black">Archive</span></h3>
                 <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">Live Global Feed</div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                 <Filter className="w-4 h-4" />
              </button>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                       <th className="px-8 py-4">ID / Type</th>
                       <th className="px-8 py-4">Vessel / Flight</th>
                       <th className="px-8 py-4">Destination</th>
                       <th className="px-8 py-4">Item Count</th>
                       <th className="px-8 py-4">Date</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {MOCK_CONTAINERS.map((container) => (
                       <tr key={container.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="font-black text-slate-900">{container.id}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{container.type}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                {container.vessel !== '-' ? (
                                   <Anchor className="w-3.5 h-3.5 text-blue-500" />
                                ) : (
                                   <Plane className="w-3.5 h-3.5 text-purple-500" />
                                )}
                                <span className="text-xs font-black text-slate-700 uppercase italic tracking-tighter">{container.vessel !== '-' ? container.vessel : container.flight}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-xs font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{container.destination}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900">{container.count}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Bookings</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-400">{container.date}</td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(container.status)}`}>
                                {container.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Link 
                                  href={`/admin/containers/manifest?id=${container.id}`}
                                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-blue)] transition-all group/btn"
                                  title="Print Manifest"
                                >
                                   <Printer className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                </Link>
                                <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
                                   <MoreVertical className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}
