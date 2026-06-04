'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt,
  ArrowUpRight, PieChart, Activity, ArrowRight, MoreVertical,
  Download, Plus, ShieldCheck, History, X, Save, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: string;
  date: string;
  due: string;
  reference?: string;
  description?: string;
}

interface Expense {
  id: string;
  category: string;
  vendor: string;
  amount: string;
  date: string;
}

export default function AccountingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BILLING' | 'EXPENSES'>('BILLING');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ client: '', amount: '', due: 'In 30 Days', status: 'Pending', date: new Date().toISOString().split('T')[0], reference: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'Fuel / Fleet', vendor: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [invRes, expRes] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    ]);
    if (invRes.data) setInvoices(invRes.data);
    if (expRes.data) setExpenses(expRes.data);
    setLoading(false);
  };

  const saveInvoice = async () => {
    if (!invoiceForm.client || !invoiceForm.amount) return;
    setSaving(true);
    const id = `INV-${Date.now().toString().slice(-4)}`;
    const dateStr = invoiceForm.date
      ? new Date(invoiceForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const amount = invoiceForm.amount.startsWith('£') ? invoiceForm.amount : `£${invoiceForm.amount}`;
    const record: Invoice = { id, client: invoiceForm.client, amount, status: invoiceForm.status, date: dateStr, due: invoiceForm.due, reference: invoiceForm.reference || undefined, description: invoiceForm.description || undefined };
    await supabase.from('invoices').insert(record);
    setInvoices(prev => [record, ...prev]);
    setInvoiceForm({ client: '', amount: '', due: 'In 30 Days', status: 'Pending', date: new Date().toISOString().split('T')[0], reference: '', description: '' });
    setShowInvoiceModal(false);
    setSaving(false);
  };

  const saveExpense = async () => {
    if (!expenseForm.vendor || !expenseForm.amount) return;
    setSaving(true);
    const id = `EXP-${Date.now().toString().slice(-4)}`;
    const dateStr = expenseForm.date
      ? new Date(expenseForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const record = { id, category: expenseForm.category, vendor: expenseForm.vendor, amount: expenseForm.amount.startsWith('£') ? expenseForm.amount : `£${expenseForm.amount}`, date: dateStr };
    await supabase.from('expenses').insert(record);
    setExpenses(prev => [record, ...prev]);
    setExpenseForm({ category: 'Fuel / Fleet', vendor: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowExpenseModal(false);
    setSaving(false);
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    const update: Record<string, string> = { status };
    if (status === 'Paid') update.due = 'Completed';
    await supabase.from('invoices').update(update).eq('id', id);
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...update } : inv));
  };

  const statusCls = (s: string) => {
    if (s === 'Paid')       return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'Overdue')    return 'bg-red-50 text-red-500 border-red-100';
    if (s === 'Partial')    return 'bg-blue-50 text-blue-500 border-blue-100';
    if (s === 'Draft')      return 'bg-slate-50 text-slate-400 border-slate-200';
    if (s === 'Void')       return 'bg-slate-100 text-slate-500 border-slate-200';
    if (s === 'Cancelled')  return 'bg-slate-100 text-slate-400 border-slate-200';
    return 'bg-orange-50 text-orange-500 border-orange-100';
  };

  const invoiceRelated = (inv: Invoice) => {
    if (inv.reference) return { text: inv.reference, cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
    if (inv.id.startsWith('INV-SH')) return { text: 'Shipment', cls: 'bg-blue-50 text-blue-600 border-blue-100' };
    if (inv.id.startsWith('INV-BK')) return { text: 'Booking', cls: 'bg-purple-50 text-purple-600 border-purple-100' };
    if (inv.id.startsWith('INV-MO')) return { text: 'Mat. Order', cls: 'bg-amber-50 text-amber-600 border-amber-100' };
    return null;
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const parseAmount = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + parseAmount(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + parseAmount(i.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + parseAmount(e.amount), 0);
  const profit = totalRevenue - totalExpenses;

  const handleExportCSV = () => {
    const rows = [
      ['Invoice ID', 'Client', 'Amount', 'Status', 'Date'],
      ...invoices.map(i => [i.id, i.client, i.amount, i.status, i.date])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Financial <span className="text-[var(--brand-orange)] font-black">Control</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue tracking & P&L Analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleExportCSV} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={() => setShowInvoiceModal(true)} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Revenue (Paid)</h4>
            <p className="text-2xl font-black text-slate-900">£{totalRevenue.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending</h4>
            <p className="text-2xl font-black text-slate-900">£{totalPending.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Expenses</h4>
            <p className="text-2xl font-black text-slate-900">£{totalExpenses.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden ${profit >= 0 ? 'bg-slate-900' : 'bg-red-900'}`}>
            <DollarSign className="w-20 h-20 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 italic">Net Profit</h4>
            <p className="text-2xl font-black italic tracking-tighter">{profit >= 0 ? '+' : ''}£{profit.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-2 border border-slate-100">
              <button onClick={() => setActiveTab('BILLING')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'BILLING' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Billing</button>
              <button onClick={() => setActiveTab('EXPENSES')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'EXPENSES' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Expenses</button>
            </div>
            {activeTab === 'EXPENSES' && (
              <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Plus className="w-3.5 h-3.5" /> Add Expense
              </button>
            )}
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'BILLING' ? (
                <motion.table key="billing" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full text-left italic">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                      <th className="px-8 py-4">Invoice #</th>
                      <th className="px-8 py-4">Client</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Related</th>
                      <th className="px-8 py-4">Due</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={7} className="px-8 py-12 text-center text-slate-400 font-bold">Loading invoices...</td></tr>
                    ) : invoices.map(inv => {
                      const related = invoiceRelated(inv);
                      return (
                        <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-black text-slate-900 uppercase tracking-tighter">{inv.id}</td>
                          <td className="px-8 py-6 font-black text-slate-900 italic uppercase tracking-tighter text-sm">{inv.client}</td>
                          <td className="px-8 py-6 font-black text-[var(--brand-blue)] text-lg">{inv.amount}</td>
                          <td className="px-8 py-6">
                            <select
                              value={inv.status}
                              onChange={e => updateInvoiceStatus(inv.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border italic cursor-pointer outline-none ${statusCls(inv.status)}`}
                            >
                              {['Draft', 'Pending', 'Partial', 'Paid', 'Overdue', 'Void', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            {related
                              ? <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest ${related.cls}`}>{related.text}</span>
                              : <span className="text-slate-300 text-xs font-bold">—</span>
                            }
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-400">{inv.due}</td>
                          <td className="px-8 py-6 text-right">
                            <button onClick={() => deleteInvoice(inv.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </motion.table>
              ) : (
                <motion.table key="expenses" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full text-left italic">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                      <th className="px-8 py-4">Expense ID</th>
                      <th className="px-8 py-4">Vendor / Category</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Loading expenses...</td></tr>
                    ) : expenses.map(exp => (
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
                          <button onClick={() => deleteExpense(exp.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvoiceModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">New <span className="text-[var(--brand-orange)]">Invoice</span></h2>
                <button onClick={() => setShowInvoiceModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Client Name *</label>
                    <input type="text" value={invoiceForm.client} onChange={e => setInvoiceForm(p => ({ ...p, client: e.target.value }))} placeholder="John Doe / Company Ltd" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Shipment / Booking Ref</label>
                    <input type="text" value={invoiceForm.reference} onChange={e => setInvoiceForm(p => ({ ...p, reference: e.target.value }))} placeholder="TS-1234 (optional)" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Amount (£) *</label>
                    <input type="text" value={invoiceForm.amount} onChange={e => setInvoiceForm(p => ({ ...p, amount: e.target.value }))} placeholder="1,250.00" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Status</label>
                    <select value={invoiceForm.status} onChange={e => setInvoiceForm(p => ({ ...p, status: e.target.value }))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all">
                      {['Draft', 'Pending', 'Partial', 'Paid', 'Overdue', 'Void', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Invoice Date</label>
                    <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm(p => ({ ...p, date: e.target.value }))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Payment Terms</label>
                    <select value={invoiceForm.due} onChange={e => setInvoiceForm(p => ({ ...p, due: e.target.value }))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all">
                      {['On Collection', 'On Pickup', 'On Delivery', 'Immediate', 'In 7 Days', 'In 14 Days', 'In 30 Days', 'In 60 Days'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Description / Notes</label>
                  <textarea value={invoiceForm.description} onChange={e => setInvoiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Sea freight — Barrel (1x) London → SDQ..." rows={2} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all resize-none" />
                </div>
                <button onClick={saveInvoice} disabled={saving || !invoiceForm.client || !invoiceForm.amount} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Generate Invoice'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExpenseModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Add <span className="text-red-500">Expense</span></h2>
                <button onClick={() => setShowExpenseModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Vendor / Supplier *</label>
                    <input type="text" value={expenseForm.vendor} onChange={e => setExpenseForm(p => ({ ...p, vendor: e.target.value }))} placeholder="Shell Global, DHL, HMRC..." className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Category</label>
                    <select value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all">
                      {['Fuel / Fleet', 'Customs / Port Fees', 'Rent / Office', 'Staff / Wages', 'Insurance', 'Marketing', 'Maintenance / Repairs', 'Supplies', 'Tax / HMRC', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Amount (£) *</label>
                    <input type="text" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} placeholder="1,240.00" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Date</label>
                    <input type="date" value={expenseForm.date} onChange={e => setExpenseForm(p => ({ ...p, date: e.target.value }))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Notes</label>
                    <textarea value={expenseForm.notes} onChange={e => setExpenseForm(p => ({ ...p, notes: e.target.value }))} placeholder="Receipt number, additional details..." rows={2} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all resize-none" />
                  </div>
                </div>
                <button onClick={saveExpense} disabled={saving || !expenseForm.vendor || !expenseForm.amount} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
