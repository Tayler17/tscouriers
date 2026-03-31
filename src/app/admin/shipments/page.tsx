'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  CheckSquare, 
  Square,
  PackageCheck,
  MoreVertical,
  Layers,
  Container,
  QrCode,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const MOCK_SHIPMENTS = [
  { id: 'TS-9011', customer: 'Carlos Ruiz', destination: 'Santo Domingo', type: 'Barrel', weight: '45kg', status: 'In Warehouse', date: '28 Mar' },
  { id: 'TS-9012', customer: 'Elena Gomez', destination: 'Santiago', type: 'Box x3', weight: '22kg', status: 'In Warehouse', date: '28 Mar' },
  { id: 'TS-9013', customer: 'Juan Valdez', destination: 'Puerto Plata', type: 'Furniture', weight: '120kg', status: 'In Warehouse', date: '27 Mar' },
  { id: 'TS-9014', customer: 'Sofia Loren', destination: 'Santo Domingo', type: 'Electronics', weight: '15kg', status: 'Ready to Ship', date: '27 Mar' },
  { id: 'TS-9015', customer: 'Miguel Angel', destination: 'La Vega', type: 'Barrel x2', weight: '90kg', status: 'In Warehouse', date: '26 Mar' },
  { id: 'TS-9016', customer: 'Rosa Parks', destination: 'Santo Domingo', type: 'Box', weight: '10kg', status: 'In Warehouse', date: '26 Mar' },
];

export default function ShipmentsPage() {
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSelection = (id: string) => {
    setSelectedShipments(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConsolidate = () => {
    if (selectedShipments.length === 0) return;
    // In a real app, this would redirect to a container creation flow or just create it
    alert(`Consolidating ${selectedShipments.length} shipments into a new Container.`);
    setSelectedShipments([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Shipment <span className="text-[var(--brand-orange)] font-black">Management</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">International Logistics Pool</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search Shipments..." 
                   className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all shadow-inner"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Filter className="w-4 h-4" />
              </button>
           </div>
        </header>

        {/* Action Bar */}
        <AnimatePresence>
          {selectedShipments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-8 z-50 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--brand-orange)] rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Selection</p>
                  <p className="text-sm font-black italic">{selectedShipments.length} <span className="text-slate-500 font-bold tracking-normal italic not-italic text-xs">Shipments selected</span></p>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <button 
                onClick={handleConsolidate}
                className="btn-primary py-3 px-8 rounded-xl flex items-center gap-3 text-sm font-black uppercase tracking-tight italic shadow-lg shadow-orange-500/20"
              >
                Consolidate into Container <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shipments List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Warehouse <span className="text-[var(--brand-orange)] font-black">Stock</span></h3>
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Awaiting Consolidation</div>
              </div>
              <div className="flex items-center gap-3">
                 <Link 
                   href="/admin/import-export"
                   className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                 >
                    <Layers className="w-3.5 h-3.5" /> Manage Import/Export
                 </Link>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                       <th className="px-8 py-4 w-10"></th>
                       <th className="px-8 py-4">Shipment ID</th>
                       <th className="px-8 py-4">Customer</th>
                       <th className="px-8 py-4">Destination</th>
                       <th className="px-8 py-4">Type/Weight</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {MOCK_SHIPMENTS.map((item) => (
                       <tr 
                         key={item.id} 
                         className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${selectedShipments.includes(item.id) ? 'bg-blue-50/30' : ''}`}
                         onClick={() => toggleSelection(item.id)}
                       >
                          <td className="px-8 py-6">
                             {selectedShipments.includes(item.id) ? (
                               <div className="w-6 h-6 bg-[var(--brand-blue)] text-white rounded-lg flex items-center justify-center">
                                  <PackageCheck className="w-3.5 h-3.5" />
                               </div>
                             ) : (
                               <div className="w-6 h-6 bg-slate-100 rounded-lg border-2 border-slate-200" />
                             )}
                          </td>
                          <td className="px-8 py-6 font-black text-slate-900">{item.id}</td>
                          <td className="px-8 py-6">
                             <span className="font-bold text-slate-700 text-sm">{item.customer}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 rounded-md">
                                   <Truck className="w-3 h-3 text-blue-500" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{item.destination}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700 uppercase tracking-tighter italic">{item.type}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.weight}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${item.status === 'Ready to Ship' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                {item.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Link 
                                  href={`/admin/shipments/label?id=${item.id}`}
                                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[var(--brand-orange)] hover:text-white transition-all shadow-sm group/btn"
                                  title="Print 4x6 Label"
                                >
                                   <QrCode className="w-4 h-4" />
                                </Link>
                                <Link 
                                  href={`/admin/shipments/invoice?id=${item.id}`}
                                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all shadow-sm group/btn"
                                  title="Generate Invoice"
                                >
                                   <FileText className="w-4 h-4" />
                                </Link>
                                <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 group-hover:text-slate-900 transition-all">
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
