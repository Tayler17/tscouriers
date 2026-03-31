'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  ArrowUpRight, 
  Calendar, 
  PieChart, 
  Activity,
  ArrowRight,
  MoreVertical,
  Download,
  Plus,
  ShieldCheck,
  CreditCard,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INVOICES = [
  { id: 'INV-7721', client: 'Retail Global Ltd', amount: '£4,250.00', status: 'Paid', date: '29 Mar 2026', due: 'Completed' },
  { id: 'INV-7722', client: 'Export-DR Group', amount: '£1,890.50', status: 'Pending', date: '28 Mar 2026', due: 'In 5 Days' },
  { id: 'INV-7723', client: 'Madrid Distribution', amount: '£850.00', status: 'Overdue', date: '15 Mar 2026', due: '14 Days Late' },
  { id: 'INV-7724', client: 'Private Client (Shipment #90)', amount: '£245.00', status: 'Paid', date: '27 Mar 2026', due: 'Completed' },
];

const MOCK_EXPENSES = [
  { id: 'EXP-90', category: 'Fuel / Fleet', vendor: 'Shell Global', amount: '£1,240.00', date: '28 Mar' },
  { id: 'EXP-91', category: 'Maintenance', vendor: 'DR Truck Repair', amount: '£450.00', date: '27 Mar' },
  { id: 'EXP-92', category: 'Port Fees', vendor: 'London Gateway', amount: '£2,800.00', date: '26 Mar' },
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<'BILLING' | 'EXPENSES'>('BILLING');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Financial <span className="text-[var(--brand-orange)] font-black">Control</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue tracking & P&L Analysis</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                 <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowInvoiceModal(true)}
                className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2"
              >
                 <Plus className="w-4 h-4" /> New Invoice
              </button>
           </div>
        </header>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Monthly Revenue</h4>
              <p className="text-2xl font-black text-slate-900">£124,580.00</p>
              <p className="text-[9px] font-bold text-emerald-500 mt-2">+12.5% vs last month</p>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Wallet className="w-6 h-6" />
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Operating Profit</h4>
              <p className="text-2xl font-black text-slate-900">£42,120.00</p>
              <p className="text-[9px] font-bold text-blue-400 mt-2">Target reached</p>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Payouts</h4>
              <p className="text-2xl font-black text-slate-900">£8,940.25</p>
              <p className="text-[9px] font-bold text-orange-400 mt-2">12 Invoices pending</p>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <DollarSign className="w-20 h-20 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 italic">Total Volume</h4>
              <p className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">£1.2M YTD</p>
           </motion.div>
        </div>

        {/* Chart & Expense Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Section Left: Chart & Stats */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 italic uppercase">Revenue <span className="text-[var(--brand-orange)] font-black">Performance</span></h3>
                       <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase">Proyected Forecast: +5% Growth</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       {['1W', '1M', '3M', '1Y'].map(t => (
                         <button key={t} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${t === '1M' ? 'bg-[var(--brand-blue)] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>
                       ))}
                    </div>
                 </div>
                 <div className="h-64 w-full bg-slate-50 rounded-[2.5rem] flex items-end justify-between p-10 gap-2 border border-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                       <Activity className="w-32 h-32 opacity-20" />
                    </div>
                    {[40, 65, 30, 85, 45, 90, 60, 75, 55, 100, 80, 95].map((h, i) => (
                      <div key={i} className={`w-full rounded-t-xl transition-all duration-500 relative z-10 ${i === 9 ? 'bg-[var(--brand-orange)] animate-pulse' : 'bg-[var(--brand-blue)]/20 hover:bg-[var(--brand-blue)]'}`} style={{ height: `${h}%` }}>
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">£{h}k</div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Toggle Area: Invoices vs Expenses */}
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-2 border border-slate-100">
                       <button onClick={() => setActiveTab('BILLING')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'BILLING' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Billing summary</button>
                       <button onClick={() => setActiveTab('EXPENSES')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'EXPENSES' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Operating costs</button>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase">
                       <PieChart className="w-3.5 h-3.5" /> Full report
                    </button>
                 </div>

                 <div className="overflow-x-auto min-h-[400px]">
                    <AnimatePresence mode="wait">
                       {activeTab === 'BILLING' ? (
                         <motion.table key="billing" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full text-left italic">
                            <thead>
                               <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                  <th className="px-8 py-4">Invoice #</th>
                                  <th className="px-8 py-4">Client Entity</th>
                                  <th className="px-8 py-4">Amount</th>
                                  <th className="px-8 py-4">Status</th>
                                  <th className="px-8 py-4 text-right">Actions</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {MOCK_INVOICES.map(inv => (
                                  <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                     <td className="px-8 py-6"><span className="font-black text-slate-900 uppercase tracking-tighter">{inv.id}</span></td>
                                     <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                           <span className="font-black text-slate-900 italic uppercase tracking-tighter text-sm">{inv.client}</span>
                                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VAT Registered</span>
                                        </div>
                                     </td>
                                     <td className="px-8 py-6"><span className="font-black text-[var(--brand-blue)] text-lg">{inv.amount}</span></td>
                                     <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border italic ${
                                           inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                                           inv.status === 'Overdue' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-orange-50 text-orange-500 border-orange-100'
                                        }`}>
                                           {inv.status}
                                        </span>
                                     </td>
                                     <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </motion.table>
                       ) : (
                         <motion.table key="expenses" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full text-left italic">
                            <thead>
                               <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                  <th className="px-8 py-4">Expense ID</th>
                                  <th className="px-8 py-4">Category & Vendor</th>
                                  <th className="px-8 py-4">Date</th>
                                  <th className="px-8 py-4">Value</th>
                                  <th className="px-8 py-4 text-right">Audit</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {MOCK_EXPENSES.map(exp => (
                                  <tr key={exp.id} className="group hover:bg-red-50/20 transition-colors">
                                     <td className="px-8 py-6 font-black text-slate-900 tracking-tighter uppercase">{exp.id}</td>
                                     <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                           <span className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">{exp.vendor}</span>
                                           <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{exp.category}</span>
                                        </div>
                                     </td>
                                     <td className="px-8 py-6 font-bold text-slate-400">{exp.date}</td>
                                     <td className="px-8 py-6 font-black text-red-600 text-lg">-{exp.amount}</td>
                                     <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /></button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </motion.table>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </div>

           {/* Section Right: Payroll Simulation */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 italic uppercase">Payroll <span className="text-[var(--brand-orange)] font-black">Pulse</span></h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">March 2026 Simulation</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <History className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black uppercase text-slate-500">Fixed Salaries</span>
                       </div>
                       <span className="text-xs font-black text-slate-900">£18,240.00</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black uppercase text-slate-500">Drivers Bonuses</span>
                       </div>
                       <span className="text-xs font-black text-emerald-500">+£1,420.00</span>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Estimated Total Payroll</p>
                    <p className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">£19,660.00</p>
                    <button className="w-full mt-8 py-5 bg-[var(--brand-blue)] text-white rounded-[2rem] font-black uppercase italic tracking-tighter text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
                       Process Monthly Payout <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="bg-[var(--brand-orange)] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <ShieldCheck className="w-24 h-24 absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                 <h4 className="text-lg font-black italic uppercase tracking-tighter leading-tight mb-4">Financial Audit <br /> Compliance Ready</h4>
                 <p className="text-white/80 text-xs font-bold leading-relaxed mb-10 italic">All March invoices match with current HMRC / Customs regulations.</p>
                 <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 px-6 py-3 rounded-xl hover:bg-white/40 transition-all">
                    View Certifications <ArrowUpRight className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>

        </div>
      </main>

      {/* New Invoice Modal Simulation */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvoiceModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 p-12"
             >
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Generate <span className="text-[var(--brand-orange)]">Invoice</span></h2>
                   <button onClick={() => setShowInvoiceModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all">✕</button>
                </div>
                
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Client Entity</label>
                      <input type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all shadow-inner" placeholder="Search client..." />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Amount (£)</label>
                        <input type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all shadow-inner" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Tax / VAT (%)</label>
                        <input type="text" className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all shadow-inner" placeholder="20" />
                      </div>
                   </div>
                   <button onClick={() => { alert('Invoice generated and sent to client!'); setShowInvoiceModal(false); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase italic italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3">
                      Generate and Send <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
