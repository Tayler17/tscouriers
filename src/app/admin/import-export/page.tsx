'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Layers, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  ChevronsRight, 
  ChevronsLeft,
  Calendar,
  Filter,
  FileDown,
  FileUp,
  Table as TableIcon,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_FIELDS = [
  'ShipmentID', 'Shipment Category ID', 'Assigned Client ID', 'Shipper Email', 
  'Receiver Phone Number', 'Receiver Address', 'Receiver Email', 'Courier', 
  'Mode', 'Payment Mode', 'Carrier', 'Carrier Reference No.', 'Departure Time'
];

const INITIAL_SELECTED = [
  'Shipper Name', 'Shipper Phone Number', 'Shipper Address', 
  'Total Freight', 'Shipment Title', 'Parcel Contents'
];

export default function ImportExportPage() {
  const [mode, setMode] = useState<'EXPORT' | 'IMPORT'>('EXPORT');
  const [availableFields, setAvailableFields] = useState(ALL_FIELDS);
  const [selectedFields, setSelectedFields] = useState(INITIAL_SELECTED);
  const [excludeMeta, setExcludeMeta] = useState(false);

  // Field Movement Logic
  const moveToSelected = (field: string) => {
    setAvailableFields(prev => prev.filter(f => f !== field));
    setSelectedFields(prev => [...prev, field]);
  };

  const moveToAvailable = (field: string) => {
    setSelectedFields(prev => prev.filter(f => f !== field));
    setAvailableFields(prev => [...prev, field]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-8">
        
        {/* Header/Mode Toggles */}
        <div className="flex bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 items-center justify-between">
           <div className="flex gap-4">
              <button 
                onClick={() => setMode('EXPORT')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'EXPORT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <FileDown className="w-4 h-4" /> EXPORT
              </button>
              <button 
                onClick={() => setMode('IMPORT')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'IMPORT' ? 'bg-slate-400 text-white shadow-lg shadow-slate-400/20' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <FileUp className="w-4 h-4" /> IMPORT
              </button>
           </div>
           <div className="flex items-center gap-3 pr-4">
              <TableIcon className="w-5 h-5 text-slate-300" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Management v2.0</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Section 1: Filters */}
           <div className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Shipper Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" placeholder="Enter name..." />
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Registered Shipper</label>
                    <select className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all appearance-none cursor-pointer">
                       <option>-- Registered Shipper --</option>
                       <option>All Clients</option>
                       <option>Verified Only</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Status</label>
                    <select className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all appearance-none cursor-pointer">
                       <option>-- Status --</option>
                       <option>In Warehouse</option>
                       <option>Prepared</option>
                       <option>Shipped</option>
                       <option>Delivered</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Category</label>
                    <select className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all appearance-none cursor-pointer">
                       <option>-- Category --</option>
                       <option>Air Freight</option>
                       <option>Maritime</option>
                       <option>Local Hub</option>
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Start</label>
                       <div className="relative">
                          <input type="text" placeholder="YYYY-MM-DD" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold" />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">End</label>
                       <div className="relative">
                          <input type="text" placeholder="YYYY-MM-DD" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold" />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50 space-y-6">
                 <label className="flex items-center gap-4 cursor-pointer group">
                    <div 
                       onClick={() => setExcludeMeta(!excludeMeta)}
                       className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${excludeMeta ? 'bg-[var(--brand-blue)] border-[var(--brand-blue)]' : 'border-slate-200'}`}
                    >
                       {excludeMeta && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-tight">Exclude meta keys on template header</span>
                 </label>

                 <button 
                   onClick={() => alert('Processing export for the selected fields...')}
                   className="w-full py-5 bg-[var(--brand-blue)] text-white rounded-2xl font-black italic uppercase tracking-tighter hover:bg-[var(--brand-orange)] transition-all shadow-xl shadow-blue-500/20"
                 >
                    EXPORT SHIPMENT
                 </button>
              </div>
           </div>

           {/* Section 2: Field Selection */}
           <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center h-full">
                 
                 {/* Available Fields */}
                 <div className="md:col-span-5 h-[500px] flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center justify-between px-2">
                       Available Fields <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px]">{availableFields.length}</span>
                    </label>
                    <div className="flex-grow p-4 bg-slate-50 rounded-[2rem] border border-slate-100 overflow-y-auto custom-scrollbar space-y-2">
                       {availableFields.map(field => (
                          <div 
                            key={field} 
                            onClick={() => moveToSelected(field)}
                            className="bg-white p-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 cursor-pointer hover:border-emerald-500 hover:translate-x-2 transition-all flex justify-between items-center group shadow-sm"
                          >
                             {field} <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-500" />
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Controls */}
                 <div className="md:col-span-1 flex md:flex-col gap-3 items-center justify-center py-4">
                    <button className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform">
                       <ChevronsRight className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-slate-400 text-white rounded-xl shadow-lg shadow-slate-400/20 hover:scale-110 transition-transform">
                       <ChevronsLeft className="w-5 h-5" />
                    </button>
                 </div>

                 {/* Selected Fields */}
                 <div className="md:col-span-5 h-[500px] flex flex-col">
                    <label className="text-[10px] font-black uppercase text-[var(--brand-orange)] tracking-widest mb-4 flex items-center justify-between px-2">
                       Selected Fields <span className="px-2 py-0.5 bg-orange-50 rounded text-[9px]">{selectedFields.length}</span>
                    </label>
                    <div className="flex-grow p-4 bg-orange-50/30 rounded-[2rem] border border-orange-100 overflow-y-auto custom-scrollbar space-y-2">
                       {selectedFields.map(field => (
                          <div 
                            key={field} 
                            onClick={() => moveToAvailable(field)}
                            className="bg-white p-4 rounded-xl border border-orange-100 text-xs font-bold text-slate-800 cursor-pointer hover:border-orange-500 hover:-translate-x-2 transition-all flex justify-between items-center group shadow-sm"
                          >
                             <ArrowLeft className="w-3.5 h-3.5 text-slate-200 group-hover:text-orange-500" /> {field}
                          </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
