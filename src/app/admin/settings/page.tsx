'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Bell, Globe, CreditCard, ShieldCheck,
  CheckCircle2, ChevronRight, Zap, Building2, AlertCircle, Save,
  Key, Lock, Server, Mail, ToggleLeft, ToggleRight, Hash
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SECTIONS = [
  { id: 'profile',       label: 'Company Profile',        icon: Building2 },
  { id: 'operations',    label: 'Operations',             icon: Hash },
  { id: 'notifications', label: 'Notifications',           icon: Bell },
  { id: 'security',      label: 'Security & Access',       icon: ShieldCheck },
  { id: 'billing',       label: 'Subscription & Billing',  icon: CreditCard },
  { id: 'api',           label: 'Developer & API',         icon: Zap },
];

interface CompanySettings {
  id: string;
  company_name: string;
  support_email: string;
  warehouse_address: string;
  currency: string;
}

const DEFAULTS: CompanySettings = {
  id: 'main',
  company_name: 'TS Couriers Logistics System',
  support_email: 'admin@tscouriers.com',
  warehouse_address: '67-69 Nathan Way, London SE28 0BQ',
  currency: 'GBP',
};

const NOTIF_DEFAULTS = {
  new_booking:    true,
  new_message:    true,
  status_change:  false,
  vessel_depart:  true,
  new_user:       false,
};

interface OpsSettings {
  shipmentPrefix: string;
  idDigits: string;
  containerPrefix: string;
}
const OPS_DEFAULTS: OpsSettings = { shipmentPrefix: 'TS', idDigits: '4', containerPrefix: 'CONT' };

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings]   = useState<CompanySettings>(DEFAULTS);
  const [loading, setLoading]      = useState(true);
  const [saving, setSaving]        = useState(false);
  const [message, setMessage]      = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notifs, setNotifs]        = useState(NOTIF_DEFAULTS);
  const [ops, setOps]              = useState<OpsSettings>(OPS_DEFAULTS);

  useEffect(() => {
    supabase.from('company_settings').select('*').eq('id', 'main').single().then(({ data }) => {
      if (data) setSettings(data as CompanySettings);
      setLoading(false);
    });
    const saved = localStorage.getItem('ts_notif_prefs');
    if (saved) setNotifs(JSON.parse(saved));
    const savedOps = localStorage.getItem('ts_ops_settings');
    if (savedOps) setOps({ ...OPS_DEFAULTS, ...JSON.parse(savedOps) });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (activeSection === 'profile') {
      const { error } = await supabase.from('company_settings').upsert(settings);
      setSaving(false);
      setMessage(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Company profile saved.' });
    } else if (activeSection === 'operations') {
      const clean: OpsSettings = {
        shipmentPrefix: (ops.shipmentPrefix || 'TS').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'TS',
        idDigits: ['4','5','6'].includes(ops.idDigits) ? ops.idDigits : '4',
        containerPrefix: (ops.containerPrefix || 'CONT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'CONT',
      };
      localStorage.setItem('ts_ops_settings', JSON.stringify(clean));
      setOps(clean);
      setSaving(false);
      setMessage({ type: 'success', text: 'Reference format saved.' });
    } else if (activeSection === 'notifications') {
      localStorage.setItem('ts_notif_prefs', JSON.stringify(notifs));
      setSaving(false);
      setMessage({ type: 'success', text: 'Notification preferences saved.' });
    } else {
      setSaving(false);
      setMessage({ type: 'error', text: 'No changes to save in this section.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const update = (field: keyof CompanySettings, value: string) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  const toggleNotif = (key: keyof typeof NOTIF_DEFAULTS) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

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
            {message && (
              <div className={`flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            <button onClick={handleSave} disabled={saving || loading}
              className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-2 text-sm shadow-xl shadow-orange-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Section Nav */}
          <div className="lg:col-span-4 space-y-3">
            {SECTIONS.map(section => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all border ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-slate-50'}`}>
                      <section.icon className={`w-5 h-5 ${isActive ? 'text-[var(--brand-orange)]' : ''}`} />
                    </div>
                    <span className="text-sm font-black italic uppercase tracking-tighter">{section.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-[var(--brand-orange)]" />}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8 space-y-8">

            {/* ── PROFILE ── */}
            {activeSection === 'profile' && (
              <>
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                  <div className="flex items-center gap-6 border-b border-slate-50 pb-10">
                    <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-50 shadow-inner">
                      <Building2 className="w-12 h-12 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 italic uppercase">TS <span className="text-[var(--brand-orange)]">Couriers</span> Ltd</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Logistics Headquarters — London, UK</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Legal Company Name</label>
                        <input type="text" value={settings.company_name} onChange={e => update('company_name', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Support Email</label>
                        <input type="email" value={settings.support_email} onChange={e => update('support_email', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner text-blue-500" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Warehouse Address</label>
                        <input type="text" value={settings.warehouse_address} onChange={e => update('warehouse_address', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Currency Unit</label>
                        <select value={settings.currency} onChange={e => update('currency', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-inner appearance-none">
                          <option value="GBP">GBP (£) — British Pound</option>
                          <option value="USD">USD ($) — US Dollar</option>
                          <option value="DOP">DOP ($) — Dominican Peso</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="pt-10 border-t border-slate-50">
                    <h4 className="text-sm font-black italic uppercase text-slate-900 mb-6 flex items-center gap-3">
                      <Globe className="w-4 h-4 text-[var(--brand-blue)]" /> Regional <span className="text-[var(--brand-orange)]">Coverage</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {['UK — London', 'ES — Madrid', 'ES — Barcelona', 'DR — Santo Domingo', 'DR — Santiago'].map(tag => (
                        <span key={tag} className="px-4 py-2 bg-blue-50 text-[var(--brand-blue)] rounded-xl text-[10px] font-black uppercase border border-blue-100 italic">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
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
                  <button onClick={() => setActiveSection('security')} className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Configure</button>
                </div>
              </>
            )}

            {/* ── OPERATIONS ── */}
            {activeSection === 'operations' && (
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                <div className="border-b border-slate-50 pb-8">
                  <h3 className="text-xl font-black italic uppercase text-slate-900">Reference <span className="text-[var(--brand-orange)]">Format</span></h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Customise how new shipment and container IDs are generated.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Shipment Prefix</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text" maxLength={6}
                        value={ops.shipmentPrefix}
                        onChange={e => setOps(p => ({ ...p, shipmentPrefix: e.target.value.toUpperCase() }))}
                        placeholder="TS"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black text-sm focus:bg-white transition-all tracking-widest uppercase"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold px-2">e.g. "TS" → <span className="font-black text-slate-600">TS-0001</span></p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ID Length (digits)</label>
                    <select
                      value={ops.idDigits}
                      onChange={e => setOps(p => ({ ...p, idDigits: e.target.value }))}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all appearance-none"
                    >
                      <option value="4">4 digits — TS-0001</option>
                      <option value="5">5 digits — TS-00001</option>
                      <option value="6">6 digits — TS-000001</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Container Prefix</label>
                    <input
                      type="text" maxLength={6}
                      value={ops.containerPrefix}
                      onChange={e => setOps(p => ({ ...p, containerPrefix: e.target.value.toUpperCase() }))}
                      placeholder="CONT"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black text-sm focus:bg-white transition-all tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-slate-400 font-bold px-2">e.g. "CONT" → <span className="font-black text-slate-600">CONT-0001</span></p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Preview</label>
                    <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <p className="font-mono text-emerald-400 text-sm font-black">
                        {(ops.shipmentPrefix || 'TS').toUpperCase()}-{'X'.repeat(parseInt(ops.idDigits || '4'))}
                      </p>
                      <p className="font-mono text-blue-400 text-sm font-black">
                        {(ops.containerPrefix || 'CONT').toUpperCase()}-{'X'.repeat(parseInt(ops.idDigits || '4'))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    ⚠ This only affects new IDs going forward — existing shipments keep their current reference.
                  </p>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeSection === 'notifications' && (
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="border-b border-slate-50 pb-8">
                  <h3 className="text-xl font-black italic uppercase text-slate-900">Email & Alert <span className="text-[var(--brand-orange)]">Preferences</span></h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Choose which events trigger notifications to the support email.</p>
                </div>
                {[
                  { key: 'new_booking' as const,   label: 'New Booking Request',      desc: 'Alert when a customer submits a new booking via the website.' },
                  { key: 'new_message' as const,   label: 'New Contact Message',      desc: 'Alert when someone sends a message via the contact form.' },
                  { key: 'status_change' as const, label: 'Shipment Status Change',   desc: 'Notify when any shipment status is updated by staff.' },
                  { key: 'vessel_depart' as const, label: 'Vessel / Container Event', desc: 'Alert when a container is loaded or a vessel departs.' },
                  { key: 'new_user' as const,      label: 'New User Registration',    desc: 'Notify when a new customer registers an account.' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notifs[item.key] ? 'bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]' : 'bg-slate-100 text-slate-300'}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter">{item.label}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotif(item.key)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${notifs[item.key] ? 'bg-[var(--brand-orange)] text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {notifs[item.key] ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {notifs[item.key] ? 'On' : 'Off'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="border-b border-slate-50 pb-8">
                    <h3 className="text-xl font-black italic uppercase text-slate-900">Security & <span className="text-[var(--brand-orange)]">Access Control</span></h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage authentication and access policies.</p>
                  </div>
                  <div className="p-8 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-5">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-amber-700 text-sm uppercase italic">Two-Factor Authentication — Disabled</p>
                      <p className="text-xs text-amber-600 font-medium mt-1">Enabling 2FA adds an extra layer of security. Configure via Supabase Dashboard → Authentication → Settings.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Lock,   title: 'Password Policy',   desc: 'Minimum 8 characters, enforced by Supabase Auth.' },
                      { icon: Mail,   title: 'Email Verification', desc: 'New accounts require email confirmation before access.' },
                      { icon: Key,    title: 'JWT Expiry',         desc: 'Sessions expire after 1 hour of inactivity by default.' },
                      { icon: Server, title: 'Database RLS',       desc: 'Row Level Security is enabled on all tables.' },
                    ].map(card => (
                      <div key={card.title} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] rounded-xl flex items-center justify-center">
                            <card.icon className="w-5 h-5" />
                          </div>
                          <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter">{card.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{card.desc}</p>
                        <span className="mt-3 inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white">
                  <h4 className="font-black italic uppercase text-lg mb-2">Active Sessions</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Session management is handled by Supabase Auth.</p>
                  <p className="text-xs text-slate-500 font-medium">To revoke all sessions: Supabase Dashboard → Authentication → Users → Invalidate sessions.</p>
                </div>
              </div>
            )}

            {/* ── BILLING ── */}
            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="border-b border-slate-50 pb-8">
                    <h3 className="text-xl font-black italic uppercase text-slate-900">Subscription & <span className="text-[var(--brand-orange)]">Billing</span></h3>
                  </div>
                  <div className="bg-slate-950 text-white p-10 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--brand-orange)]/10 rounded-full translate-x-12 -translate-y-12" />
                    <span className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.3em] mb-3 inline-block">Current Plan</span>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Enterprise</h2>
                    <p className="text-slate-400 text-sm font-bold mt-2">Custom Logistics Platform — TS Couriers Ltd</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Shipments', value: 'Unlimited' },
                      { label: 'Admin Users', value: '25 Seats' },
                      { label: 'Data Retention', value: '2 Years' },
                    ].map(item => (
                      <div key={item.label} className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-100">
                        <p className="text-2xl font-black text-[var(--brand-blue)] italic">{item.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[var(--brand-orange)] p-10 rounded-[3.5rem] text-white">
                  <p className="font-black italic uppercase text-lg mb-2">Need to upgrade or modify your plan?</p>
                  <p className="text-orange-100 text-sm font-medium mb-6">Contact the development team at taylor_services@hotmail.com</p>
                  <a href="mailto:taylor_services@hotmail.com" className="inline-block px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Contact Support</a>
                </div>
              </div>
            )}

            {/* ── API / DEVELOPER ── */}
            {activeSection === 'api' && (
              <div className="space-y-6">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="border-b border-slate-50 pb-8">
                    <h3 className="text-xl font-black italic uppercase text-slate-900">Developer & <span className="text-[var(--brand-orange)]">API Access</span></h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Integration endpoints and configuration.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Supabase Project URL</label>
                      <div className="flex items-center gap-3 p-5 bg-slate-950 rounded-2xl font-mono text-xs text-emerald-400">
                        <Server className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>https://elvrrcsiopitldekhgrg.supabase.co</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Platform Version</label>
                      <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <Zap className="w-4 h-4 text-[var(--brand-orange)]" />
                        <span className="font-black text-sm text-slate-700 italic uppercase">Next.js 15 · Supabase · Tailwind CSS</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Webhook Endpoint (Optional)</label>
                      <input type="url" placeholder="https://your-integration.com/webhook"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">Receive POST events for new bookings, shipment updates, etc.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--brand-blue)] p-10 rounded-[3.5rem] text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <Key className="w-6 h-6 text-[var(--brand-orange)]" />
                    <h4 className="font-black italic uppercase">API Keys</h4>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">API keys are managed directly in the Supabase Dashboard. Never expose the service role key client-side.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
