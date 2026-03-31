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
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Default Data (Fallback if localStorage is empty)
const DEFAULT_UPDATES = [
  { tag: "MARCH 2026 DEPARTURES", title: "Vessel to Dominican Republic", desc: "Departing soon. Final collection day: Sunday 22nd March.", urgent: true },
  { tag: "NEW EXPANDED UK ROUTES", title: "Regional Courier Service", desc: "Weekly routes now confirmed from London to Manchester and Birmingham.", urgent: false }
];

const DEFAULT_FAQS = [
  { q: "How long does shipping to Dominican Republic take?", a: "Estimated transit time for sea freight is 6 to 8 weeks door-to-door." },
  { q: "Do the prices include customs in the Dominican Republic?", a: "Yes, our door-to-door service to the DR typically includes customs management and basic fees." },
  { q: "When do you collect parcels in London?", a: "Our main collection days are Sundays. Thursdays may also be available upon pre-confirmation." }
];

export default function Home() {
  const [updates, setUpdates] = useState(DEFAULT_UPDATES);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Load dynamic news
    const savedNews = localStorage.getItem('ts_news_db');
    if (savedNews) {
      setUpdates(JSON.parse(savedNews));
    }

    // Load dynamic faqs
    const savedFaqs = localStorage.getItem('ts_faqs_db');
    if (savedFaqs) {
      setFaqs(JSON.parse(savedFaqs));
    }
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center pt-20 overflow-hidden bg-slate-900">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--brand-blue)]/10 skew-x-12 translate-x-24" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
           <Image 
             src="/ship.png" 
             alt="Vessel" 
             fill 
             className="object-contain object-right opacity-40 translate-x-12 scale-110 pointer-events-none" 
             priority
           />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
               <span className="w-12 h-[2px] bg-[var(--brand-orange)]" />
               <span className="text-[var(--brand-orange)] font-black uppercase tracking-[0.3em] text-xs underline decoration-2 underline-offset-4">Premium Logistics</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 italic uppercase text-shadow-lg">
              Global <br /> Shipping <br /> <span className="text-[var(--brand-orange)]">Redefined.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-xl font-medium leading-relaxed">
              Door-to-door courier services from the UK to the Dominican Republic and Europe. Secure, reliable, and faster than ever.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/booking" className="btn-primary group flex items-center gap-3 px-10 py-5 rounded-2xl shadow-2xl shadow-orange-500/20 active:scale-95 transition-all">
                Get a Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/track" className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/10 font-bold py-5 px-10 rounded-2xl transition-all active:scale-95">
                Track Shipment
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-0 w-full">
          <div className="container mx-auto px-6">
            <div className="flex gap-12 text-white/40">
               <div><p className="text-2xl font-black text-white italic">24/7</p><p className="text-[10px] font-bold uppercase tracking-widest">Support</p></div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div><p className="text-2xl font-black text-white italic">100%</p><p className="text-[10px] font-bold uppercase tracking-widest">Insurance</p></div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div><p className="text-2xl font-black text-white italic">Weekly</p><p className="text-[10px] font-bold uppercase tracking-widest">Departures</p></div>
            </div>
          </div>
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
                    {update.desc}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${update.urgent ? 'bg-white/10 text-white group-hover:bg-[var(--brand-orange)]' : 'bg-white text-slate-400 group-hover:bg-[var(--brand-blue)] group-hover:text-white'}`}>
                      <Info className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">More Details</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Link href="/dominican-republic" className="group relative bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Globe className="w-24 h-24" /></div>
                <div className="w-16 h-16 bg-blue-50 text-[var(--brand-blue)] rounded-2xl flex items-center justify-center mb-8"><Package className="w-8 h-8" /></div>
                <h3 className="text-3xl font-black text-[var(--brand-blue)] italic uppercase leading-none mb-4">DR Shipping</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2 group-hover:text-[var(--brand-orange)] transition-colors">Start Assistant <ArrowRight className="w-4 h-4" /></p>
             </Link>
             <Link href="/spain-europe" className="group relative bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Truck className="w-24 h-24" /></div>
                <div className="w-16 h-16 bg-blue-50 text-[var(--brand-blue)] rounded-2xl flex items-center justify-center mb-8"><ChevronRight className="w-8 h-8" /></div>
                <h3 className="text-3xl font-black text-[var(--brand-blue)] italic uppercase leading-none mb-4">Europe Route</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2 group-hover:text-[var(--brand-orange)] transition-colors">View Routes <ArrowRight className="w-4 h-4" /></p>
             </Link>
             <Link href="/track" className="group relative bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><History className="w-24 h-24" /></div>
                <div className="w-16 h-16 bg-blue-50 text-[var(--brand-blue)] rounded-2xl flex items-center justify-center mb-8"><Timer className="w-8 h-8" /></div>
                <h3 className="text-3xl font-black text-[var(--brand-blue)] italic uppercase leading-none mb-4">Live Tracking</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2 group-hover:text-[var(--brand-orange)] transition-colors">Track Cargo <ArrowRight className="w-4 h-4" /></p>
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

      <style jsx>{`
        .text-shadow-lg {
          text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>
    </main>
  );
}
