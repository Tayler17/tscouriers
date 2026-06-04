'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, DollarSign, ShieldCheck, Zap, CheckCircle2, ChevronRight, TrendingUp, LayoutDashboard, AlertCircle
} from 'lucide-react';
import { SERVICE_PLANS } from '@/app/booking/constants';
import { supabase } from '@/lib/supabase';

interface PlanSetting {
  id: string;
  surcharge: number;
}

export default function AdminPlansPage() {
  const [surcharges, setSurcharges] = useState<Record<string, number>>(
    Object.fromEntries(SERVICE_PLANS.map(p => [p.id, p.surcharge]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.from('plan_settings').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const map: Record<string, number> = {};
        (data as PlanSetting[]).forEach(r => { map[r.id] = r.surcharge; });
        setSurcharges(prev => ({ ...prev, ...map }));
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const rows = Object.entries(surcharges).map(([id, surcharge]) => ({ id, surcharge }));
    const { error } = await supabase.from('plan_settings').upsert(rows);
    setSaving(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Plan settings saved.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return (
    <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.2em] text-slate-400">Loading Configuration...</div>
  );

  return (
    <main className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-200 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--brand-orange)] font-black text-xs uppercase tracking-widest">
              <LayoutDashboard className="w-4 h-4" /> Management Console
            </div>
            <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-tight">Service <br /><span className="text-[var(--brand-orange)]">Plan Fees</span></h1>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary py-4 px-10 rounded-2xl flex items-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50">
            {message?.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : message?.type === 'success' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICE_PLANS.map(plan => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter underline underline-offset-8 decoration-[var(--brand-orange)]">{plan.name}</h3>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${plan.id === 'premium' ? 'bg-[var(--brand-orange)]' : 'bg-slate-900'}`}>
                    {plan.id === 'premium' ? <Zap className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                  Modify the surcharge added to the base package price for this service level.
                </p>

                <div className="pt-8 space-y-4">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 italic">
                    <TrendingUp className="w-3 h-3 text-[var(--brand-orange)]" /> Tier Surcharge (£)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="number"
                      value={surcharges[plan.id] ?? plan.surcharge}
                      onChange={e => setSurcharges(prev => ({ ...prev, [plan.id]: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-xl font-black"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3 italic">
                {Object.entries(plan.details).slice(0, 3).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    <span>{k}</span>
                    <span className="text-slate-900">{typeof v === 'boolean' ? (v ? 'YES' : 'NO') : v as string}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="bg-blue-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Plan Logic Information</h4>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-[0.1em] opacity-80 leading-relaxed max-w-lg">
                The Standard plan should have a £0 surcharge to reflect base shipping costs. Premium plans add value-added services like choice of room and faster transit.
              </p>
            </div>
            <ChevronRight className="w-12 h-12 text-white/20 hidden md:block" />
          </div>
        </div>
      </div>
    </main>
  );
}
