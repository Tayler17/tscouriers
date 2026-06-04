'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, ShieldCheck, Mail, Lock, ChevronRight, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { name: formData.name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: formData.name,
        email: formData.email,
        role: 'CUSTOMER',
        can_access_accounting: false,
        can_access_hr: false,
        can_access_shipments: false,
        can_access_containers: false,
        can_access_analytics: false,
        can_access_settings: false,
        can_access_users: false,
      });

      // Auto-link to address book contact if email matches
      await supabase
        .from('address_book')
        .update({ user_id: data.user.id })
        .eq('email', formData.email);
    }

    setSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => router.push('/login'), 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar */}
        <div className="md:w-64 bg-[var(--brand-orange)] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative z-10">
            <UserPlus className="w-12 h-12 text-white mb-6" />
            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight text-white/90">Join the <br /> Network</h3>
            <p className="text-xs font-bold text-orange-100 mt-4 leading-relaxed">Start shipping globally with TS Couriers premium service.</p>
          </div>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-white/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Verified Logistics</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-grow p-12">
          <h2 className="text-3xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Create Your <span className="text-[var(--brand-orange)]">Account</span></h2>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-emerald-100 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Account created! Redirecting to login...
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" placeholder="Full Name" required className="input-field"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" placeholder="Phone" className="input-field"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="email" placeholder="Email address" required className="input-field"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="password" placeholder="Create Password (min 6 chars)" required minLength={6} className="input-field"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input type="checkbox" className="mt-1" required />
              <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-widest">
                I agree to the <span className="text-[var(--brand-blue)] italic">Terms of Service</span> and <span className="text-[var(--brand-blue)] italic">Privacy Policy</span> of TS Couriers.
              </p>
            </div>

            <button type="submit" disabled={isSubmitting || success}
              className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-orange-500/20 group disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Creating Account...' : 'Register Now'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? <Link href="/login" className="text-[var(--brand-blue)] hover:underline">Log in here</Link>
            </p>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .input-field { width: 100%; padding: 1.25rem 1.5rem 1.25rem 4rem; border-radius: 1.25rem; background: #f8fafc; border: 1px solid #f1f5f9; outline: none; transition: all 0.2s; font-weight: 700; font-size: 0.875rem; }
        .input-field:focus { background: white; border-color: #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
      `}</style>
    </main>
  );
}
