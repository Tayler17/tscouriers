'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  ShoppingCart,
  Info
} from 'lucide-react';

interface StripePaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePayment({ amount, onSuccess, onCancel }: StripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stage, setStage] = useState<'CARD' | 'PROCESSING' | 'SUCCESS'>('CARD');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStage('PROCESSING');
    setIsProcessing(true);
    
    // Simulate real Stripe API Round-trip
    setTimeout(() => {
      setIsProcessing(false);
      setStage('SUCCESS');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
         
         {stage === 'CARD' && (
           <motion.div 
             key="card" 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, y: -10 }}
             className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
           >
              <div className="bg-slate-950 p-8 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[var(--brand-orange)]" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter italic whitespace-nowrap">Secure <span className="text-[var(--brand-orange)]">Checkout</span></h3>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">SSL Encrypted</span>
                 </div>
              </div>

              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <ShoppingCart className="w-6 h-6 text-slate-400" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total to Pay</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">£{amount.toFixed(2)}</p>
                       </div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                       <CreditCard className="w-6 h-6 text-slate-300" />
                    </div>
                 </div>

                 <form onSubmit={handlePayment} className="space-y-6">
                    <div className="space-y-4">
                       <div className="relative">
                          <input type="text" placeholder="Cardholder Name" className="w-full pl-8 pr-8 py-5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold uppercase tracking-widest italic" required />
                       </div>
                       <div className="relative">
                          <input type="text" placeholder="Card Number" className="w-full pl-8 pr-32 py-5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold tracking-widest" required />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1 items-center grayscale opacity-30">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="MM / YY" className="w-full pl-8 pr-8 py-5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold tracking-widest text-center" required />
                          <input type="text" placeholder="CVC" className="w-full pl-8 pr-8 py-5 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold tracking-widest text-center" required />
                       </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center">
                       <Info className="w-3.5 h-3.5 text-blue-500" /> Payment powered by <span className="text-slate-800">Stripe</span>
                    </p>

                    <button type="submit" className="btn-primary w-full py-6 rounded-2xl flex items-center justify-center gap-3 text-xl shadow-2xl shadow-orange-500/10 group">
                       Pay £{amount.toFixed(2)} <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </form>
              </div>

              <div className="bg-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">By clicking Pay, you agree to our <span className="text-[var(--brand-blue)]">Terms of Logistics Service</span>.</p>
                 <button onClick={onCancel} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel Payment</button>
              </div>
           </motion.div>
         )}

         {stage === 'PROCESSING' && (
           <motion.div 
             key="processing" 
             initial={{ opacity: 0, scale: 0.95 }} 
             animate={{ opacity: 1, scale: 1 }} 
             exit={{ opacity: 0, scale: 1.05 }}
             className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center space-y-12 h-[600px]"
           >
              <div className="relative">
                 <Loader2 className="w-24 h-24 text-[var(--brand-orange)] animate-spin" />
                 <Lock className="w-8 h-8 text-[var(--brand-blue)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-4xl font-black italic uppercase tracking-tighter text-[var(--brand-blue)]">Securing <br /> <span className="text-[var(--brand-orange)]">Transaction</span></h3>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Verifying card details with your bank. This may take a moment.</p>
              </div>
              <div className="w-full max-w-xs h-1 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: '100%' }} 
                   transition={{ duration: 3, ease: 'easeInOut' }} 
                   className="h-full bg-[var(--brand-orange)]"
                 />
              </div>
           </motion.div>
         )}

         {stage === 'SUCCESS' && (
           <motion.div 
             key="success" 
             initial={{ opacity: 0, scale: 0.95 }} 
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center space-y-10 h-[600px]"
           >
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                 <CheckCircle2 className="w-16 h-16" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-5xl font-black italic uppercase tracking-tighter text-emerald-600">Payment <br /> Success</h3>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Redirecting to your booking confirmation. Don't close your browser.</p>
              </div>
           </motion.div>
         )}

      </AnimatePresence>
    </div>
  );
}
