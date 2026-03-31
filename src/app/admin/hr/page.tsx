'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Star, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Award,
  Zap,
  DollarSign,
  Heart,
  TrendingUp,
  FileText,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_STAFF = [
  { id: 'ST-001', name: 'Ricardo Sanchez', role: 'Main Driver', department: 'Logistics', status: 'On Route', rating: 4.9, joinDate: 'Jan 2024', salary: '£2,850' },
  { id: 'ST-002', name: 'Ana Martinez', role: 'Branch Manager', department: 'Operations (DR)', status: 'Active', rating: 5.0, joinDate: 'Mar 2023', salary: '£3,400' },
  { id: 'ST-003', name: 'David Smith', role: 'Warehouse Lead', department: 'Storage (London)', status: 'Active', rating: 4.7, joinDate: 'Jun 2024', salary: '£2,200' },
  { id: 'ST-004', name: 'Carlos Gomez', role: 'Driver', department: 'Distribution', status: 'In Transit', rating: 4.5, joinDate: 'Feb 2025', salary: '£2,650' },
  { id: 'ST-005', name: 'Elena White', role: 'Admin Assistant', department: 'Customer Service', status: 'Active', rating: 4.8, joinDate: 'Nov 2024', salary: '£2,100' },
];

const MOCK_APPLICANTS = [
  { id: 'APP-99', name: 'James Wilson', position: 'Driver', match: 92, status: 'Interview' },
  { id: 'APP-100', name: 'Lucia Ferreyra', position: 'Logistics Analyst', match: 88, status: 'Screening' },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'PAYROLL' | 'HIRING'>('DIRECTORY');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Human <span className="text-[var(--brand-orange)] font-black">Resources</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel management & Performance</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-2 border border-slate-100 mr-4">
                 <button onClick={() => setActiveTab('DIRECTORY')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DIRECTORY' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Directory</button>
                 <button onClick={() => setActiveTab('PAYROLL')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PAYROLL' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Salaries</button>
                 <button onClick={() => setActiveTab('HIRING')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HIRING' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Recruitment</button>
              </div>
              <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add Staff
              </button>
           </div>
        </header>

        {/* Personnel Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                 <Users className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Workforce</p>
              <h3 className="text-2xl font-black text-slate-900">84 Staff</h3>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                 <UserCheck className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Now</p>
              <h3 className="text-2xl font-black text-slate-900">32 Online</h3>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center mb-4">
                 <Award className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Performance Index</p>
              <h3 className="text-2xl font-black text-slate-900">4.8 / 5.0</h3>
           </div>
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <Zap className="w-20 h-20 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1 italic">Vibe & Health</p>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">Excellent</h3>
           </div>
        </div>

        {/* Dynamic Content Feed */}
        <AnimatePresence mode="wait">
           {activeTab === 'DIRECTORY' && (
             <motion.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Staff <span className="text-[var(--brand-orange)] font-black">Directory</span></h3>
                   <div className="flex items-center gap-3">
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input type="text" placeholder="Search staff..." className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-48 text-xs font-bold" />
                      </div>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100"><Filter className="w-4 h-4" /></button>
                   </div>
                </div>
                <div className="overflow-x-auto min-h-[500px]">
                   <table className="w-full text-left italic">
                      <thead>
                         <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                            <th className="px-8 py-4 w-10"></th>
                            <th className="px-8 py-4">Employee / ID</th>
                            <th className="px-8 py-4">Role & Status</th>
                            <th className="px-8 py-4">Join Date</th>
                            <th className="px-8 py-4 text-right">View Details</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {MOCK_STAFF.map(member => (
                            <tr key={member.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => setSelectedStaff(member)}>
                               <td className="px-8 py-6">
                                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-all">
                                     {member.name.charAt(0)}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex flex-col">
                                     <span className="font-black text-slate-900 uppercase tracking-tighter text-sm italic">{member.name}</span>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee {member.id}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex flex-col gap-1">
                                     <span className="text-[10px] font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{member.role}</span>
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border w-fit ${
                                        member.status === 'Active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                                     }`}>{member.status}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-bold text-slate-400 text-xs">{member.joinDate}</td>
                               <td className="px-8 py-6 text-right">
                                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all shadow-sm"><MoreVertical className="w-4 h-4" /></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
           )}

           {activeTab === 'PAYROLL' && (
             <motion.div key="payroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Base <span className="text-[var(--brand-orange)] font-black">Salaries</span></h3>
                   <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-emerald-500/20">
                      <Zap className="w-4 h-4" /> Bulk payout
                   </button>
                </div>
                <div className="space-y-4">
                   {MOCK_STAFF.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-[var(--brand-blue)] transition-all group">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[var(--brand-blue)] shadow-inner">
                               <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role}</p>
                               <h5 className="font-black text-slate-900 italic uppercase italic tracking-tighter">{member.name}</h5>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Gross</p>
                            <span className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">{member.salary}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
           )}

           {activeTab === 'HIRING' && (
             <motion.div key="hiring" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                   <h4 className="text-xl font-black text-slate-900 italic uppercase">Applicant <span className="text-blue-500">Queue</span></h4>
                   <div className="space-y-4">
                      {MOCK_APPLICANTS.map(app => (
                        <div key={app.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group">
                           <div className="absolute right-0 top-0 h-full w-2 bg-blue-500/20 group-hover:bg-blue-500 transition-all" />
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <h6 className="font-black text-slate-900 text-lg italic uppercase">{app.name}</h6>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase">{app.position}</span>
                              </div>
                              <div className="text-right">
                                 <span className="text-[10px] font-black text-emerald-500 italic block">{app.match}% Match</span>
                                 <span className="text-[9px] font-black p-1.5 bg-blue-50 text-blue-500 rounded-lg uppercase">{app.status}</span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                             <button className="flex-grow py-3 bg-[var(--brand-blue)] text-white rounded-xl text-[10px] font-black uppercase italic tracking-tight">Schedule interview</button>
                             <button className="px-4 py-3 bg-white text-slate-400 border border-slate-100 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><MoreVertical className="w-4 h-4" /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-between overflow-hidden relative">
                   <UserPlus className="w-32 h-32 text-[var(--brand-orange)] absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                   <div>
                      <Heart className="w-10 h-10 text-[var(--brand-orange)] mb-8" />
                      <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Expand the <br /> <span className="text-[var(--brand-orange)]">TS Couriers</span> Family</h4>
                      <p className="text-slate-400 text-sm leading-relaxed mb-10">We are currently looking for 2 additional drivers (UK Hub) and 1 customs specialist for SDQ operations.</p>
                   </div>
                   <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-3">
                      Post New Opportunity <TrendingUp className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Staff Detail Drawer (Simulation) */}
        <AnimatePresence>
           {selectedStaff && (
             <div className="fixed inset-0 z-[60] flex justify-end">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white w-full max-w-xl h-full shadow-2xl p-12 overflow-y-auto">
                   <button onClick={() => setSelectedStaff(null)} className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100">✕ Close</button>
                   
                   <div className="flex flex-col items-center text-center mt-12 mb-12">
                      <div className="w-24 h-24 bg-blue-50 text-[var(--brand-blue)] rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-xl mb-6">
                        {selectedStaff.name.charAt(0)}
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">{selectedStaff.name}</h2>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4">{selectedStaff.role}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-12">
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                         <div className="flex items-center justify-center gap-2 text-[var(--brand-orange)] font-black text-lg mb-1">
                            <Star className="w-4 h-4 fill-current" /> {selectedStaff.rating}
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Rating</p>
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center flex flex-col justify-center items-center">
                         <span className="text-lg font-black text-slate-900">{selectedStaff.joinDate}</span>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Since</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Personnel Dashboard</h5>
                      <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[var(--brand-blue)] transition-all cursor-pointer">
                         <Mail className="w-5 h-5 text-slate-400 group-hover:text-[var(--brand-blue)]" />
                         <span className="text-xs font-bold text-slate-600">Send Internal Notice</span>
                      </div>
                      <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[var(--brand-blue)] transition-all cursor-pointer">
                         <Phone className="w-5 h-5 text-slate-400 group-hover:text-[var(--brand-blue)]" />
                         <span className="text-xs font-bold text-slate-600">VoIP Call Member</span>
                      </div>
                      <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-500 transition-all cursor-pointer">
                         <FileText className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                         <span className="text-xs font-bold text-slate-600">Management Records</span>
                      </div>
                   </div>

                   <div className="mt-12 pt-12 border-t border-slate-100">
                      <button onClick={() => alert('Performance review requested!')} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-[var(--brand-orange)] transition-all">
                         Request Performance Audit <Award className="w-4 h-4" />
                      </button>
                   </div>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

      </main>
    </div>
  );
}
