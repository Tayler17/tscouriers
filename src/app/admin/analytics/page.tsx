'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Monthly Volume', value: '£124,500', change: '+14.2%', color: 'text-emerald-500' },
  { label: 'Active Shipments', value: '1,284', change: '+8.1%', color: 'text-blue-500' },
  { label: 'Avg Delivery Time', value: '12 Days', change: '-2.5%', color: 'text-orange-500' },
  { label: 'Customer Growth', value: '428', change: '+12.3%', color: 'text-purple-500' },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Business <span className="text-[var(--brand-orange)] font-black">Intelligence</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Growth & Operational KPIs</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                 <Download className="w-4 h-4" /> Export Report
              </button>
           </div>
        </header>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {STATS.map((stat, i) => (
             <motion.div 
               key={stat.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
             >
                <p className="text-[10px] font-black underline uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 mb-4 italic tracking-tighter">{stat.value}</h3>
                <div className={`p-1.5 px-3 rounded-xl inline-flex items-center gap-1 text-[10px] font-black uppercase ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                   {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                   {stat.change}
                </div>
             </motion.div>
           ))}
        </div>

        {/* Charts Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Growth Chart */}
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 italic uppercase">Market <span className="text-[var(--brand-orange)] font-black">Performance</span></h3>
                 <BarChart3 className="w-6 h-6 text-slate-300" />
              </div>
              <div className="h-64 flex items-end justify-between gap-4">
                 {[40, 70, 45, 90, 65, 80, 55, 95, 85, 60, 75, 100].map((h, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ height: 0 }} 
                     animate={{ height: `${h}%` }} 
                     transition={{ delay: i * 0.05, duration: 1 }}
                     className={`flex-grow rounded-xl ${i === 11 ? 'bg-[var(--brand-orange)] shadow-lg shadow-orange-500/20' : 'bg-blue-500/20 hover:bg-blue-500/40'} transition-all`}
                   />
                 ))}
              </div>
              <div className="flex justify-between px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                 <span>Jan</span>
                 <span>Dec</span>
              </div>
           </div>

           {/* Route Popularity */}
           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black italic uppercase tracking-tighter">Route <span className="text-[var(--brand-orange)] font-black">Popularity</span></h3>
                 <Globe className="w-6 h-6 text-white/20" />
              </div>
              <div className="space-y-6">
                 {[
                   { route: 'London ➔ SDQ', val: 85, vol: '42%' },
                   { route: 'Madrid ➔ Santiago', val: 65, vol: '28%' },
                   { route: 'Barcelona ➔ SDQ', val: 45, vol: '18%' },
                   { route: 'Local Courier UK', val: 30, vol: '12%' },
                 ].map((r, i) => (
                   <div key={r.route} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                         <span className="text-blue-200">{r.route}</span>
                         <span className="text-[var(--brand-orange)]">{r.vol}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${r.val}%` }} 
                           className="h-full bg-[var(--brand-orange)]"
                         />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-white/5">
                 <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-relaxed">International shipping to Dominican Republic remains the primary growth driver this quarter.</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
