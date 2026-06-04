'use client';

import { motion } from 'framer-motion';
import { 
  Truck, 
  ShieldCheck, 
  Globe, 
  Timer, 
  MapPin, 
  ChevronRight, 
  Package, 
  ArrowRight,
  TrendingUp,
  History,
  Info,
  ChevronDown,
  MessageSquare,
  Ship,
  Anchor
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ChevronRight as CR } from 'lucide-react';

const DEFAULT_UPDATES = [
  { tag: "DEPARTURES", title: "Vessel to Dominican Republic", description: "Contact us for the next available departure date.", more_info: "Our monthly vessel to Rio Haina accepts cargo door-to-door. Transit time: 6-8 weeks.", urgent: true },
  { tag: "LONDON COURIER", title: "Same-Day Collection Available", description: "We cover SE1, E1, W1 and surrounding areas.", more_info: "Weekly routes confirmed within London zones for packages heading to DR.", urgent: false }
];

const DEFAULT_FAQS = [
  { q: "How long does shipping to Dominican Republic take?", a: "Estimated transit time for sea freight is 6 to 8 weeks door-to-door from London to Rio Haina." },
  { q: "Do you offer courier services within London?", a: "Yes, we specialize in London courier collections, particularly on Sundays and Thursdays." },
  { q: "Do the prices include customs in the Dominican Republic?", a: "Yes, our door-to-door service to the DR typically includes customs management and basic fees." },
  { q: "When do you collect parcels in London?", a: "Our main collection days are Sundays. Thursdays may also be available upon pre-confirmation." }
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState(DEFAULT_UPDATES);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeUpdate, setActiveUpdate] = useState<number | null>(null);

  // Redirect logged-in users to their dashboard automatically
  useEffect(() => {
    if (user) {
      const dest = user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/driver' : '/customer';
      router.replace(dest);
    }
  }, [user]);

  useEffect(() => {
    supabase.from('news').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) setUpdates(data as typeof DEFAULT_UPDATES);
    });
    supabase.from('faqs').select('*').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) setFaqs(data as typeof DEFAULT_FAQS);
    });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center pt-20 pb-8 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--brand-blue)]/5 skew-x-12 translate-x-24" />
        <div className="absolute inset-0 z-0">
          <Image src="/warehouse.png" alt="Modern Logistics Hub" fill className="object-cover opacity-20 grayscale-[0.5]" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent z-10" />
        </div>

        <div className="container mx-auto px-5 md:px-6 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-8 md:w-12 h-[2px] bg-[var(--brand-orange)]" />
              <span className="text-[var(--brand-orange)] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px]">Premium Logistics</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[var(--brand-blue)] leading-[0.9] tracking-tighter mb-6 md:mb-10 italic uppercase">
              Global <br /> Shipping <br />
              <span className="text-[var(--brand-orange)]">Redefined.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 mb-8 md:mb-12 max-w-xl font-medium leading-relaxed">
              Specialized door-to-door courier services from London to the Dominican Republic. Secure, reliable, and faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-5">
              <Link href="/booking" className="btn-primary group flex items-center justify-center gap-3 px-7 md:px-10 py-4 md:py-5 rounded-2xl shadow-2xl shadow-orange-500/20 active:scale-95 transition-all text-base md:text-lg">
                Book Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/track" className="bg-white hover:bg-slate-50 text-[var(--brand-blue)] border-2 border-slate-200 font-bold py-4 md:py-5 px-7 md:px-10 rounded-2xl transition-all active:scale-95 text-base md:text-lg flex items-center justify-center gap-2">
                Track Shipment
              </Link>
            </div>

            {/* Stats — inline on mobile */}
            <div className="flex gap-6 md:gap-12 mt-10 md:mt-16 text-slate-400">
              <div><p className="text-xl md:text-2xl font-black text-[var(--brand-blue)] italic">24/7</p><p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Support</p></div>
              <div className="w-[1px] h-10 bg-slate-200" />
              <div><p className="text-xl md:text-2xl font-black text-[var(--brand-blue)] italic">100%</p><p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Insurance</p></div>
              <div className="w-[1px] h-10 bg-slate-200" />
              <div><p className="text-xl md:text-2xl font-black text-[var(--brand-blue)] italic">Weekly</p><p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Departures</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest Updates / News Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
             <div className="space-y-4">
                <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[var(--brand-orange)]" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Live Feed</span></div>
                <h2 className="text-5xl font-black text-[var(--brand-blue)] italic tracking-tighter uppercase leading-none">Latest <br /><span className="text-[var(--brand-orange)]">Updates.</span></h2>
             </div>
             <p className="text-slate-400 font-bold max-w-sm italic text-sm">Stay informed about vessel departures, route changes and company notices in real-time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {updates.map((update: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group p-10 rounded-[3rem] border transition-all h-full flex flex-col justify-between ${update.urgent ? 'bg-[var(--brand-blue)] text-white border-[var(--brand-blue)] shadow-2xl shadow-blue-900/20' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
              >
                <div>
                  <span className={`text-[10px] font-black tracking-widest uppercase mb-4 inline-block ${update.urgent ? 'text-[var(--brand-orange)]' : 'text-slate-400'}`}>
                    {update.tag}
                  </span>
                  <h3 className={`text-3xl font-black mb-6 italic leading-none ${update.urgent ? 'text-white' : 'text-slate-800'}`}>
                    {update.title}
                  </h3>
                  <p className={`text-sm font-medium leading-relaxed mb-10 italic ${update.urgent ? 'text-blue-100/70' : 'text-slate-500'}`}>
                    {update.description}
                  </p>

                  <motion.div
                    initial={false}
                    animate={{ height: activeUpdate === idx ? 'auto' : 0, opacity: activeUpdate === idx ? 1 : 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <p className={`text-xs font-bold p-4 rounded-2xl ${update.urgent ? 'bg-white/10 text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                      {update.more_info || "Contact us for more details about this notice."}
                    </p>
                  </motion.div>
                </div>
                <button 
                  onClick={() => setActiveUpdate(activeUpdate === idx ? null : idx)}
                  className="flex items-center gap-3 w-full text-left outline-none"
                >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${update.urgent ? 'bg-white/10 text-white group-hover:bg-[var(--brand-orange)]' : 'bg-white text-slate-400 group-hover:bg-[var(--brand-blue)] group-hover:text-white'}`}>
                      <Info className={`w-5 h-5 transition-transform ${activeUpdate === idx ? 'rotate-180' : ''}`} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{activeUpdate === idx ? 'Close Details' : 'More Details'}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* DR Shipping — Orange */}
            <Link href="/dominican-republic" className="group relative bg-[var(--brand-orange)] p-12 rounded-[3.5rem] shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-2 transition-all overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Ship className="w-32 h-32 text-white" /></div>
              <div className="w-20 h-20 bg-white/20 text-white rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                <Anchor className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase leading-none mb-4">DR Shipping</h3>
              <p className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-colors">
                Door-to-door Service <ArrowRight className="w-4 h-4" />
              </p>
            </Link>

            {/* London Courier — Brand Blue */}
            <Link href="/local-courier" className="group relative bg-[var(--brand-blue)] p-12 rounded-[3.5rem] shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-2 transition-all overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Truck className="w-32 h-32 text-white" /></div>
              <div className="w-20 h-20 bg-white/20 text-white rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                <MapPin className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase leading-none mb-4">London Courier</h3>
              <p className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-colors">
                Book Collection <ArrowRight className="w-4 h-4" />
              </p>
            </Link>

            {/* Live Tracking — Dark Slate */}
            <Link href="/track" className="group relative bg-slate-900 p-12 rounded-[3.5rem] shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/40 hover:-translate-y-2 transition-all overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><History className="w-32 h-32 text-white" /></div>
              <div className="w-20 h-20 bg-white/10 text-[var(--brand-orange)] rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                <Timer className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase leading-none mb-4">Live Tracking</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-[var(--brand-orange)] transition-colors">
                Track Cargo <ArrowRight className="w-4 h-4" />
              </p>
            </Link>

          </div>
        </div>
      </section>

      {/* Common Questions / FAQ Section */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-20 space-y-4">
               <h2 className="text-5xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter">Common <span className="text-[var(--brand-orange)]">Questions.</span></h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Everything you need to know about our global logistics.</p>
            </div>
            
            <div className="space-y-4">
               {faqs.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 transition-all hover:border-slate-200">
                     <button 
                       onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                       className="w-full flex items-center justify-between p-8 text-left outline-none"
                     >
                        <span className="text-lg font-black text-slate-800 italic uppercase underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4">{faq.q}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === idx ? 'bg-[var(--brand-orange)] text-white rotate-180' : 'bg-white text-slate-300'}`}>
                           <ChevronDown className="w-5 h-5" />
                        </div>
                     </button>
                     <motion.div 
                       initial={false}
                       animate={{ 
                         height: activeFaq === idx ? 'auto' : 0,
                         opacity: activeFaq === idx ? 1 : 0
                       }}
                       className="overflow-hidden bg-white/50"
                     >
                        <div className="p-8 pt-0 text-slate-500 font-bold italic leading-relaxed">
                           {faq.a}
                        </div>
                     </motion.div>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </main>
  );
}
