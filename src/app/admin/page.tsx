'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  Truck, 
  Users, 
  TrendingUp, 
  MoreVertical, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const MOCK_BOOKINGS = [
  { id: 'TS-7821', customer: 'Ricardo Peña', route: 'London ➔ SDQ', date: '28 Mar 2026', status: 'In Warehouse', type: 'Barrel' },
  { id: 'TS-7822', customer: 'Sarah Johnson', route: 'Madrid ➔ Santiago', date: '27 Mar 2026', status: 'At Sea', type: 'Box x3' },
  { id: 'TS-7823', customer: 'Juan Perez', route: 'London ➔ Puerto Plata', date: '26 Mar 2026', status: 'Delivered', type: 'Furniture' },
  { id: 'TS-7824', customer: 'Maria Rodriguez', route: 'London ➔ SDQ', date: '25 Mar 2026', status: 'Pending Pickup', type: 'Barrel x2' },
  { id: 'TS-7825', customer: 'David Smith', route: 'Barcelona ➔ SDQ', date: '24 Mar 2026', status: 'In Custom', type: 'Electronics' },
];

const STATS = [
  { title: 'Total Shipments', value: '1,284', change: '+12.5%', icon: Truck, color: 'bg-blue-500' },
  { title: 'Active Quotes', value: '42', change: '+8.2%', icon: BarChart3, color: 'bg-orange-500' },
  { title: 'Inventory Levels', value: '94%', change: '-2.1%', icon: Package, color: 'bg-purple-500' },
  { title: 'Monthly Revenue', value: '£42,500', change: '+14.3%', icon: TrendingUp, color: 'bg-emerald-500' },
];

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'At Sea': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Warehouse': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'In Custom': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Top Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Logistics <span className="text-[var(--brand-orange)] font-black">Control</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                 Welcome back, {user?.name || 'Admin'}
              </p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search ID, Customer..." 
                   className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all"
                 />
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center relative">
                 <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-3 right-3 border-2 border-white shadow-sm" />
                 <Users className="w-5 h-5 text-slate-600" />
              </div>
           </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {STATS.map((stat, i) => (
             <motion.div 
               key={stat.title} 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all"
             >
                <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/10`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                   <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                </div>
                <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                   {stat.change}
                </div>
             </motion.div>
           ))}
        </div>

        {/* Management Portals - Quick Access - Filtered by Permissions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {user?.permissions.canAccessAccounting && (
              <Link href="/admin/accounting" className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 opacity-50 -translate-y-12 translate-x-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                       <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Accounting <span className="text-emerald-500">& Finance</span></h4>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage revenue, invoices & payouts</p>
                    </div>
                    <ArrowUpRight className="ml-auto w-6 h-6 text-slate-200 group-hover:text-emerald-500" />
                 </div>
              </Link>
           )}
           {user?.permissions.canAccessHR && (
              <Link href="/admin/hr" className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 opacity-50 -translate-y-12 translate-x-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all">
                       <Users className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Human <span className="text-blue-500">Resources</span></h4>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel directory & payroll management</p>
                    </div>
                    <ArrowUpRight className="ml-auto w-6 h-6 text-slate-200 group-hover:text-blue-500" />
                 </div>
              </Link>
           )}
        </div>

        {/* Recent Bookings Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Recent <span className="text-[var(--brand-orange)] font-black">Bookings</span></h3>
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">48 New Today</div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
                    <Filter className="w-4 h-4" />
                 </button>
                 <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" /> New Booking
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                       <th className="px-8 py-4">Shipment ID</th>
                       <th className="px-8 py-4">Customer</th>
                       <th className="px-8 py-4">Route</th>
                       <th className="px-8 py-4">Type</th>
                       <th className="px-8 py-4">Date</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {MOCK_BOOKINGS.map((order) => (
                       <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-black text-slate-900">{order.id}</td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                                   {order.customer.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{order.customer}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-xs font-black text-[var(--brand-blue)] uppercase tracking-tighter italic whitespace-nowrap">{order.route}</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{order.type}</span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-400 whitespace-nowrap">{order.date}</td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${getStatusColor(order.status)}`}>
                                {order.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 group-hover:text-slate-900 transition-all">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
              <button className="text-sm font-black text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors uppercase italic tracking-tighter">View all system shipments ➔</button>
           </div>
        </div>
      </main>
    </div>
  );
}
