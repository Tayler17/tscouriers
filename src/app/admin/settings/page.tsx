'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  Mail,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Zap,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Company Profile', icon: Building2, active: true },
  { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
  { id: 'security', label: 'Security & Access', icon: ShieldCheck, active: false },
  { id: 'billing', label: 'Subscription & Billing', icon: CreditCard, active: false },
  { id: 'api', label: 'Developer & API', icon: Zap, active: false },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">System <span className="text-[var(--brand-orange)] font-black">Preferences</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Global Configuration & Identity</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2 text-sm shadow-xl shadow-orange-500/20">
                 <CheckCircle2 className="w-4 h-4" /> Save Changes
              </button>
           </div>
        </header>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Navigation Sidebar (Inner) */}
           <div className="lg:col-span-4 space-y-4">
              {SETTINGS_SECTIONS.map((section) => (
                <button 
                  key={section.id}
                  className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all border ${section.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.active ? 'bg-white/10' : 'bg-slate-50'}`}>
                         <section.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black italic uppercase tracking-tighter">{section.label}</span>
                   </div>
                   {section.active && <ChevronRight className="w-4 h-4 text-[var(--brand-orange)]" />}
                </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="lg:col-span-8 space-y-10">
              {/* Profile Section */}
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                 <div className="flex items-center gap-6 border-b border-slate-50 pb-10">
                    <div className="relative group">
                       <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-50 shadow-inner">
                          <Building2 className="w-12 h-12 text-slate-300" />
                       </div>
                       <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--brand-orange)] text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                          <Smartphone className="w-4 h-4" />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 italic uppercase">TS <span className="text-[var(--brand-orange)]">Couriers</span> Ltd</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Logistics Headquarters - London, UK</p>
                    </div>
                 </div>

                 {/* Form Fields */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Legal Company Name</label>
                       <input type="text" defaultValue="TS Couriers Logistics System" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Support Email</label>
                       <input type="email" defaultValue="admin@tscouriers.com" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner text-blue-500" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Warehouse Address</label>
                       <input type="text" defaultValue="12 Canary Wharf, London, E14 5AB" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Currency Unit</label>
                       <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner appearance-none">
                          <option>GBP (£) - British Pound Sterling</option>
                          <option>USD ($) - US Dollar</option>
                          <option>DOP ($) - Dominican Peso</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-50">
                    <h4 className="text-sm font-black italic uppercase text-slate-900 mb-6 flex items-center gap-3">
                       <Globe className="w-4 h-4 text-[var(--brand-blue)]" /> Regional <span className="text-[var(--brand-orange)]">Coverage</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                       {['UK - London', 'ES - Madrid', 'ES - Barcelona', 'DR - Santo Domingo', 'DR - Santiago'].map(tag => (
                         <span key={tag} className="px-4 py-2 bg-blue-50 text-[var(--brand-blue)] rounded-xl text-[10px] font-black uppercase border border-blue-100 italic">{tag}</span>
                       ))}
                       <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase border border-slate-100 hover:bg-slate-100 transition-all">+ Add Region</button>
                    </div>
                 </div>
              </div>

              {/* Security Reminder */}
              <div className="bg-[var(--brand-blue)] p-10 rounded-[3.5rem] text-white flex items-center justify-between shadow-2xl shadow-blue-900/40">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                       <ShieldCheck className="w-8 h-8 text-[var(--brand-orange)]" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black italic uppercase tracking-tighter">Security <span className="text-[var(--brand-orange)]">Audit</span></h4>
                       <p className="text-blue-100 text-xs font-bold uppercase tracking-widest italic">Two-Factor Authentication is currently DISABLED.</p>
                    </div>
                 </div>
                 <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Enable now</button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
