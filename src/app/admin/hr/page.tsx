'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Users, UserCheck, Award, Zap, Search, Plus, MoreVertical,
  Mail, Phone, DollarSign, Heart, TrendingUp, UserPlus, Trash2, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  salary: string;
  joined_at: string;
}

const EMPTY: Omit<Employee, 'id'> = { name: '', role: '', department: 'Operations', email: '', phone: '', location: 'London', status: 'Active', salary: '', joined_at: new Date().toISOString().split('T')[0] };

export default function HRPage() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'PAYROLL' | 'HIRING'>('DIRECTORY');
  const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase.from('employees').select('*').order('id');
    if (data) setStaff(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.role) return;
    setSaving(true);
    const id = `EMP-${Date.now().toString().slice(-4)}`;
    const record = { id, ...form };
    await supabase.from('employees').insert(record);
    setStaff(prev => [...prev, record]);
    setForm(EMPTY);
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this employee?')) return;
    await supabase.from('employees').delete().eq('id', id);
    setStaff(prev => prev.filter(m => m.id !== id));
    setSelectedStaff(null);
  };

  const filtered = staff.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Human <span className="text-[var(--brand-orange)] font-black">Resources</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-2 border border-slate-100">
              {(['DIRECTORY', 'PAYROLL', 'HIRING'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'DIRECTORY' ? 'Directory' : tab === 'PAYROLL' ? 'Salaries' : 'Recruitment'}
                </button>
              ))}
            </div>
            <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><Users className="w-6 h-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Workforce</p>
            <h3 className="text-2xl font-black text-slate-900">{staff.length} Staff</h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4"><UserCheck className="w-6 h-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
            <h3 className="text-2xl font-black text-slate-900">{staff.filter(m => m.status === 'Active').length}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center mb-4"><Award className="w-6 h-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departments</p>
            <h3 className="text-2xl font-black text-slate-900">{[...new Set(staff.map(s => s.department))].length}</h3>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <Zap className="w-20 h-20 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Locations</p>
            <h3 className="text-2xl font-black italic">{[...new Set(staff.map(s => s.location))].length} Hubs</h3>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'DIRECTORY' && (
            <motion.div key="dir" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 italic uppercase">Staff <span className="text-[var(--brand-orange)]">Directory</span></h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-48 text-xs font-bold" />
                </div>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left italic">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                      <th className="px-8 py-4 w-10"></th>
                      <th className="px-8 py-4">Employee</th>
                      <th className="px-8 py-4">Role & Status</th>
                      <th className="px-8 py-4">Department</th>
                      <th className="px-8 py-4">Location</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">Loading...</td></tr>
                    ) : filtered.map(member => (
                      <tr key={member.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => setSelectedStaff(member)}>
                        <td className="px-8 py-6">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-all">
                            {member.name.charAt(0)}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 uppercase tracking-tighter text-sm italic">{member.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{member.id}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{member.role}</span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border w-fit ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>{member.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-500 text-xs">{member.department}</td>
                        <td className="px-8 py-6 font-bold text-slate-500 text-xs">{member.location}</td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={e => { e.stopPropagation(); handleDelete(member.id); }} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'PAYROLL' && (
            <motion.div key="pay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900 italic uppercase">Base <span className="text-[var(--brand-orange)]">Salaries</span></h3>
                <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: </span>
                  <span className="text-sm font-black text-slate-900">
                    {staff.filter(s => s.salary).length} with salary set
                  </span>
                </div>
              </div>
              {staff.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">No employees yet</div>
              ) : (
                <div className="space-y-4">
                  {staff.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-[var(--brand-blue)] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[var(--brand-blue)] shadow-inner">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role}</p>
                          <h5 className="font-black text-slate-900 italic uppercase tracking-tighter">{member.name}</h5>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly</p>
                        <span className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">{member.salary || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'HIRING' && (
            <motion.div key="hire" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black text-slate-900 italic uppercase mb-8">Applicant <span className="text-blue-500">Queue</span></h4>
                <div className="py-20 text-center text-slate-300">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-black uppercase text-xs tracking-widest">No active applicants</p>
                  <p className="text-xs text-slate-400 mt-2">Use "Add Staff" to onboard directly</p>
                </div>
              </div>
              <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-between overflow-hidden relative">
                <UserPlus className="w-32 h-32 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                <div>
                  <Heart className="w-10 h-10 text-[var(--brand-orange)] mb-8" />
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Expand the <br /> <span className="text-[var(--brand-orange)]">TS Couriers</span> Family</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-10">Currently {staff.length} team members across {[...new Set(staff.map(s => s.location))].length} locations.</p>
                </div>
                <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-3">
                  Add New Member <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff Detail Drawer */}
        <AnimatePresence>
          {selectedStaff && (
            <div className="fixed inset-0 z-[60] flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white w-full max-w-xl h-full shadow-2xl p-12 overflow-y-auto">
                <button onClick={() => setSelectedStaff(null)} className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 font-bold text-xs">✕ Close</button>
                <div className="flex flex-col items-center text-center mt-12 mb-12">
                  <div className="w-24 h-24 bg-blue-50 text-[var(--brand-blue)] rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-xl mb-6">
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">{selectedStaff.name}</h2>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 underline decoration-[var(--brand-orange)] decoration-2">{selectedStaff.role}</p>
                  <p className="text-xs text-slate-400 mt-2">{selectedStaff.department} · {selectedStaff.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-slate-50 p-6 rounded-[2rem] text-center">
                    <p className="text-lg font-black text-slate-900">{selectedStaff.salary || '—'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Monthly</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center">
                    <p className="text-lg font-black text-slate-900">{selectedStaff.joined_at}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Joined</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedStaff.email && (
                    <a href={`mailto:${selectedStaff.email}`} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[var(--brand-blue)] transition-all">
                      <Mail className="w-5 h-5 text-slate-400 group-hover:text-[var(--brand-blue)]" />
                      <span className="text-xs font-bold text-slate-600">{selectedStaff.email}</span>
                    </a>
                  )}
                  {selectedStaff.phone && (
                    <a href={`tel:${selectedStaff.phone}`} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[var(--brand-blue)] transition-all">
                      <Phone className="w-5 h-5 text-slate-400 group-hover:text-[var(--brand-blue)]" />
                      <span className="text-xs font-bold text-slate-600">{selectedStaff.phone}</span>
                    </a>
                  )}
                </div>
                <div className="mt-10">
                  <button onClick={() => handleDelete(selectedStaff.id)} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3">
                    <Trash2 className="w-4 h-4" /> Remove Employee
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-10 relative overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Add <span className="text-[var(--brand-orange)]">Staff</span></h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {([
                  { key: 'name', label: 'Full Name *', ph: 'Carlos Reyes' },
                  { key: 'role', label: 'Job Title *', ph: 'Warehouse Manager' },
                  { key: 'department', label: 'Department', ph: 'Operations' },
                  { key: 'email', label: 'Email', ph: 'staff@tscouriers.com' },
                  { key: 'phone', label: 'Phone', ph: '+44 7700 000000' },
                  { key: 'location', label: 'Location', ph: 'London' },
                  { key: 'salary', label: 'Monthly Salary', ph: '£2,500/mo' },
                ] as { key: keyof typeof EMPTY; label: string; ph: string }[]).map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{f.label}</label>
                    <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                    {['Active', 'On Leave', 'Inactive'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={handleSave} disabled={saving || !form.name || !form.role} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Add Employee'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
