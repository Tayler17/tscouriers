'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_QUOTES = [
  { id: 'QT-8801', customer: 'Sarah Johnson', origin: 'London, UK', destination: 'Santo Domingo, DR', weight: '450kg', service: 'Sea Freight', status: 'Pending', date: '28 Mar' },
  { id: 'QT-8802', customer: 'David Smith', origin: 'Madrid, ES', destination: 'Santiago, DR', weight: '120kg', service: 'Air Freight', status: 'Approved', date: '27 Mar' },
  { id: 'QT-8803', customer: 'Maria Rodriguez', origin: 'London, UK', destination: 'Puerto Plata, DR', weight: '2 Barrels', service: 'Sea Freight', status: 'Expired', date: '25 Mar' },
  { id: 'QT-8804', customer: 'John Doe', origin: 'Barcelona, ES', destination: 'Santo Domingo, DR', weight: '1500kg', service: 'Full Container', status: 'Approved', date: '24 Mar' },
  { id: 'QT-8805', customer: 'Elena Perez', origin: 'Manchester, UK', destination: 'Samana, DR', weight: '55kg', service: 'Air Freight', status: 'Pending', date: '23 Mar' },
];

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
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
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Quote <span className="text-[var(--brand-orange)] font-black">Center</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Pricing & Customer Inquiries</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search Quotes..." 
                   className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all shadow-inner"
                 />
              </div>
              <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Filter className="w-4 h-4" />
              </button>
           </div>
        </header>

        {/* Quotes list */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">System <span className="text-[var(--brand-orange)] font-black">Quotes</span></h3>
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Global Inbound</div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                       <th className="px-8 py-4">Quote ID</th>
                       <th className="px-8 py-4">Customer</th>
                       <th className="px-8 py-4">Route</th>
                       <th className="px-8 py-4">Weight / Type</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4">Date</th>
                       <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {MOCK_QUOTES.map((quote, i) => (
                       <tr key={quote.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-black text-slate-900">{quote.id}</td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm tracking-tight">{quote.customer}</span>
                                <div className="flex gap-2 mt-1">
                                   <Mail className="w-3 h-3 text-slate-300" />
                                   <Phone className="w-3 h-3 text-slate-300" />
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[var(--brand-blue)] font-bold italic uppercase tracking-tighter truncate max-w-[120px]">{quote.origin} ➔ {quote.destination}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 italic uppercase tracking-tighter">{quote.service}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quote.weight}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border italic ${getStatusColor(quote.status)}`}>
                                {quote.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-400">{quote.date}</td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                                   <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-blue)] transition-all group/btn">
                                   <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
