'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  TrendingUp, 
  AlertTriangle,
  ShoppingBag,
  Box,
  Layers,
  Archive
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_MATERIALS = [
  { id: 'MAT-01', name: 'Standard Barrel', stock: 142, minRequired: 50, price: '£25.00', category: 'Containers' },
  { id: 'MAT-02', name: 'Large Shipping Box', stock: 320, minRequired: 100, price: '£8.50', category: 'Boxes' },
  { id: 'MAT-03', name: 'Heavy Duty Tape', stock: 45, minRequired: 60, price: '£4.20', category: 'Supplies' },
  { id: 'MAT-04', name: 'Bubble Wrap (Roll)', stock: 28, minRequired: 15, price: '£12.00', category: 'Packing' },
  { id: 'MAT-05', name: 'Pallet Wrap', stock: 12, minRequired: 20, price: '£15.50', category: 'Packing' },
];

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Warehouse <span className="text-[var(--brand-orange)] font-black">Stock</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Shipping Materials & Supplies</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 text-sm shadow-xl shadow-orange-500/10">
                 <Plus className="w-4 h-4" /> Add Item
              </button>
           </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-14 h-14 bg-orange-50 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center mb-6">
                 <AlertTriangle className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900 italic uppercase italic mb-2 tracking-tighter">Low <span className="text-red-500">Stock</span></h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">3 items are below the minimum required threshold.</p>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-14 h-14 bg-blue-50 text-[var(--brand-blue)] rounded-2xl flex items-center justify-center mb-6">
                 <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900 italic uppercase italic mb-2 tracking-tighter">Recent <span className="text-[var(--brand-blue)]">Orders</span></h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">No active supply orders this week.</p>
           </div>
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
              <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6">
                 <Archive className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black italic uppercase italic mb-2 tracking-tighter">Total <span className="text-[var(--brand-orange)]">Inventory</span></h4>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest leading-relaxed">Valued at approximately <span className="text-white font-black italic">£4,850.00</span></p>
           </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Stock <span className="text-[var(--brand-orange)] font-black">Control</span></h3>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                       <th className="px-8 py-4">Item Name / ID</th>
                       <th className="px-8 py-4">Category</th>
                       <th className="px-8 py-4">Current Stock</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4">Unit Price</th>
                       <th className="px-8 py-4 text-right">Adjust Stock</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 italic">
                    {MOCK_MATERIALS.map((item, i) => (
                       <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors font-bold">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="font-black text-slate-900 tracking-tight">{item.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 uppercase italic tracking-tighter">{item.category}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`text-lg font-black ${item.stock < item.minRequired ? 'text-red-500' : 'text-slate-900'}`}>{item.stock}</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${item.stock < item.minRequired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {item.stock < item.minRequired ? 'Reorder Soon' : 'Optimal'}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-sm text-[var(--brand-blue)] font-black italic">{item.price}</td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all">
                                   <Plus className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                   <Minus className="w-4 h-4" />
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
