'use client';

import { useState } from 'react';
import { useAuth, Role } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User as UserIcon, Truck, ShieldCheck, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Added for realism
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { success, user: loggedUser, error: loginError } = await login(email, password);

    if (success && loggedUser) {
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'STAFF') {
        router.push('/admin');
      } else if (loggedUser.role === 'DRIVER') {
        router.push('/driver');
      } else {
        router.push('/customer');
      }
    } else {
      setError(loginError ?? 'Invalid credentials. Check your email and password.');
      setIsSubmitting(false);
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
               {/* Logo — click to go home */}
               <Link href="/" className="flex items-center gap-2 mb-8 group w-fit">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                     <Truck className="w-5 h-5 text-[var(--brand-blue)]" />
                  </div>
                  <span className="font-black text-base tracking-tighter uppercase italic leading-none">TS<br/><span className="text-[var(--brand-orange)] text-[10px] tracking-widest font-bold not-italic">COURIERS</span></span>
               </Link>
               <ShieldCheck className="w-10 h-10 text-[var(--brand-orange)] mb-4 opacity-80" />
               <h3 className="text-lg font-black italic uppercase tracking-tighter leading-tight">Secure <br /> Sign In</h3>
            </div>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-12 italic opacity-50">TS Control Panel</p>
         </div>

         {/* Form */}
         <div className="flex-grow p-12">
            <h2 className="text-3xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter">Sign In to <span className="text-[var(--brand-orange)]">TS Control</span></h2>
            
            <form onSubmit={handleLogin} className="space-y-6">

               <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100"
                    >
                       <AlertCircle className="w-4 h-4" /> {error}
                    </motion.div>
                  )}
               </AnimatePresence>

               <div className="space-y-4">
                  <div className="relative">
                     <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="email" 
                       placeholder="Admin / Staff Email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
                     />
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input 
                       type="password"
                       placeholder="Password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
                     />
                  </div>
               </div>

               <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-orange-500/20 group uppercase italic font-black disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Authenticating...' : 'Authorize'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </form>

            <div className="mt-8 text-center space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Use your registered email and password</p>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global platform <Link href="/signup" className="text-[var(--brand-blue)] hover:underline">registration</Link></p>
            </div>
         </div>
      </motion.div>
    </main>
  );
}
