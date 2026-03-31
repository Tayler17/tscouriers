'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, User, Truck, ShieldCheck, Mail, Lock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    
    // Automatic redirection based on email
    if (email.includes('admin')) {
      router.push('/admin');
    } else if (email.includes('driver')) {
      router.push('/driver');
    } else {
      router.push('/customer');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row"
      >
         {/* Sidebar / Info */}
         <div className="md:w-56 bg-[var(--brand-blue)] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative z-10">
               <ShieldCheck className="w-12 h-12 text-[var(--brand-orange)] mb-6" />
               <h3 className="text-xl font-black italic uppercase tracking-tighter leading-tight">Secure <br /> Portal</h3>
            </div>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-12">TS Couriers Logistics System v4.0</p>
         </div>

         {/* Form */}
         <div className="flex-grow p-12">
            <h2 className="text-3xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Login to <span className="text-[var(--brand-orange)]">Logistics</span></h2>
            
            <form onSubmit={handleLogin} className="space-y-6">

               <div className="space-y-4">
                  <div className="relative">
                     <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="email" 
                       placeholder="Email address"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                     />
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="password" 
                       placeholder="Password"
                       className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                     />
                  </div>
               </div>

               <button type="submit" className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-orange-500/20 group">
                  Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Don't have an account? <Link href="/signup" className="text-[var(--brand-blue)] hover:underline">Sign up now</Link></p>
            </div>
         </div>
      </motion.div>
    </main>
  );
}
