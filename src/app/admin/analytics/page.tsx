'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';

const STATUS_ORDER = ['Pending Pickup', 'Collected', 'In Warehouse', 'Ready to Ship', 'At Sea', 'In Custom', 'Out for Delivery', 'Delivered'];

export default function AnalyticsPage() {
  const { shipments, bookings, containers, quotes } = useData();
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('routes').select('name, origin, destination').then(({ data }) => {
      if (data) setRoutes(data);
    });
  }, []);

  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const active = shipments.filter(s => s.status !== 'Delivered').length;
  const pendingQuotes = quotes.filter(q => q.status === 'Pending').length;
  const totalBookings = bookings.length;

  const stats = [
    { label: 'Total Shipments', value: shipments.length.toLocaleString(), change: `${active} active`, color: 'text-blue-500', up: true },
    { label: 'Total Bookings', value: totalBookings.toLocaleString(), change: `${bookings.filter(b => b.status === 'Pending Pickup').length} pending`, color: 'text-emerald-500', up: true },
    { label: 'Delivered', value: delivered.toLocaleString(), change: shipments.length > 0 ? `${Math.round(delivered / shipments.length * 100)}% rate` : '0%', color: 'text-orange-500', up: true },
    { label: 'Open Quotes', value: pendingQuotes.toString(), change: `${quotes.length} total`, color: 'text-purple-500', up: pendingQuotes > 0 },
  ];

  // Status distribution for bar chart
  const statusCounts = STATUS_ORDER.map(s => ({
    label: s,
    count: shipments.filter(sh => sh.status === s).length
  }));
  const maxCount = Math.max(...statusCounts.map(s => s.count), 1);

  // Route breakdown — derive from bookings route field
  const routeCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const r = b.route || 'Unknown';
    routeCounts[r] = (routeCounts[r] || 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([route, count]) => ({
      route,
      count,
      pct: totalBookings > 0 ? Math.round(count / totalBookings * 100) : 0
    }));

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Shipments', shipments.length],
      ['Total Bookings', totalBookings],
      ['Delivered', delivered],
      ['Active', active],
      ['Open Quotes', pendingQuotes],
      ['Containers', containers.length],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_report.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Business <span className="text-[var(--brand-orange)] font-black">Intelligence</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Live KPIs from Database</p>
          </div>
          <button onClick={handleExport} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mb-4 italic tracking-tighter">{stat.value}</h3>
              <div className={`p-1.5 px-3 rounded-xl inline-flex items-center gap-1 text-[10px] font-black uppercase ${stat.up ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipment Status Distribution */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 italic uppercase">Shipment <span className="text-[var(--brand-orange)] font-black">Pipeline</span></h3>
              <BarChart3 className="w-6 h-6 text-slate-300" />
            </div>
            <div className="h-56 flex items-end justify-between gap-2">
              {statusCounts.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${maxCount > 0 ? Math.max((s.count / maxCount) * 100, s.count > 0 ? 8 : 0) : 0}%` }}
                    transition={{ delay: i * 0.05, duration: 0.8 }}
                    className={`w-full rounded-xl ${i === statusCounts.length - 1 ? 'bg-[var(--brand-orange)] shadow-lg shadow-orange-500/20' : 'bg-blue-500/20 hover:bg-blue-500/40'} transition-all min-h-[4px]`}
                  />
                  <span className="text-[8px] font-black text-slate-400 uppercase text-center leading-tight">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
              <span>Pending</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Route Popularity */}
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Route <span className="text-[var(--brand-orange)] font-black">Popularity</span></h3>
              <Globe className="w-6 h-6 text-white/20" />
            </div>
            {topRoutes.length === 0 ? (
              <div className="py-10 text-center text-white/30 font-bold uppercase text-xs tracking-widest">No bookings yet</div>
            ) : (
              <div className="space-y-6">
                {topRoutes.map((r, i) => (
                  <div key={r.route} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                      <span className="text-blue-200 truncate max-w-[200px]">{r.route}</span>
                      <span className="text-[var(--brand-orange)]">{r.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ delay: i * 0.1, duration: 0.8 }}
                        className="h-full bg-[var(--brand-orange)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-6 border-t border-white/5">
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">
                {totalBookings} total bookings · {containers.length} containers in system
              </p>
            </div>
          </div>
        </div>

        {/* Containers overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Loading', 'Ready to Ship', 'In Transit', 'Delivered'].map(status => (
            <div key={status} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <h3 className="text-3xl font-black text-slate-900">{containers.filter(c => c.status === status).length}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{status}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
