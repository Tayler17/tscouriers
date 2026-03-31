'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Globe, Package, Truck, Shield, MapPin, ChevronDown, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// ==========================================
// CONFIGURABLE DATA (EDIT HERE)
// ==========================================

const LATEST_UPDATES = [
  { 
    tag: "MARCH 2026 DEPARTURES", 
    title: "Vessel to Dominican Republic", 
    desc: "Departing soon. Final collection day: Sunday 22nd March.",
    urgent: true
  },
  { 
    tag: "NEW EXPANDED UK ROUTES", 
    title: "Regional Courier Service", 
    desc: "Weekly routes now confirmed from London to Manchester and Birmingham.",
    urgent: false
  },
  { 
    tag: "SERVICE UPDATE", 
    title: "Daily London Collection", 
    desc: "Now offering same-day collection in SE & E London postcodes for barrels.",
    urgent: false
  }
];

const COMMON_QUESTIONS = [
  { 
    q: "How long does shipping to Dominican Republic take?", 
    a: "Estimated transit time for sea freight is 6 to 8 weeks door-to-door." 
  },
  { 
    q: "Do the prices include customs in the Dominican Republic?", 
    a: "Yes, our door-to-door service to the DR typically includes customs management and basic fees." 
  },
  { 
    q: "When do you collect parcels in London?", 
    a: "Our main collection days are Sundays. Thursdays may also be available upon pre-confirmation." 
  },
  {
    q: "Can I ship household appliances?",
    a: "Absolutely. We specialize in shipping fridges, washing machines, and televisions safely to the DR and Europe."
  }
];

// ==========================================

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center overflow-hidden bg-slate-50 pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/warehouse.png" 
            alt="Modern Logistics Warehouse"
            fill
            className="object-cover opacity-20 grayscale-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--brand-blue)] rounded-l-[100px] opacity-10 transform translate-x-20 rotate-12" />
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                 <span className="inline-block py-1.5 px-4 rounded-full bg-orange-100 text-[var(--brand-orange)] font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                   London's Logistic Hub
                 </span>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-[var(--brand-blue)] leading-[0.9] mb-8 italic uppercase tracking-tighter">
                Shipping <br /> Your <span className="text-[var(--brand-orange)] underline decoration-8 decoration-orange-500/20 underline-offset-8">Legacy.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-xl font-medium">
                Professional door-to-door logistics bridging the UK with the Dominican Republic & Europe. Reliable, secure, and community-focused.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/booking" className="btn-primary py-6 px-12 rounded-[2rem] flex items-center justify-center gap-3 text-lg shadow-2xl shadow-orange-500/20 active:scale-95 transition-all">
                  Get a Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/track" className="btn-secondary py-6 px-12 rounded-[2rem] flex items-center justify-center gap-3 text-lg border-2 border-slate-200 active:scale-95 transition-all">
                  Track Shipment
                </Link>
              </div>
              
              <div className="mt-16 flex items-center gap-8 grayscale opacity-40">
                 <div className="flex items-center gap-2 font-black italic text-sm tracking-tighter"><Globe className="w-5 h-5" /> GLOBAL NETWORK</div>
                 <div className="flex items-center gap-2 font-black italic text-sm tracking-tighter"><Shield className="w-5 h-5" /> TAX & CUSTOMS</div>
                 <div className="flex items-center gap-2 font-black italic text-sm tracking-tighter"><Truck className="w-5 h-5" /> EXPRESS FLEET</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Corridors / Services Grid */}
      <section id="services" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-[var(--brand-blue)] leading-none italic uppercase tracking-tighter">Our Core <span className="text-[var(--brand-orange)]">Corridors</span></h2>
              <p className="text-slate-500 max-w-2xl font-medium">Expert logistics tailored for the international community and local businesses alike.</p>
            </div>
            <Link href="/services" className="bg-slate-50 px-8 py-4 rounded-2xl text-[var(--brand-blue)] font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-slate-100 transition-all">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Service Card 1: DR */}
            <motion.div whileHover={{ y: -10 }} className="p-2 rounded-[3.5rem] bg-slate-50 border border-slate-100 group transition-all">
              <div className="relative h-64 rounded-[3rem] overflow-hidden mb-8 shadow-xl">
                <Image src="/vessel.png" alt="Dominican Shipping" fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-blue)]/60 to-transparent flex items-end p-8">
                   <span className="bg-white text-[var(--brand-blue)] px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Door-to-Door</span>
                </div>
              </div>
              <div className="p-8 pt-0 space-y-6">
                <h3 className="text-3xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter underline underline-offset-4 decoration-orange-500/30">Dominican Republic</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Specialized service for barrels, boxes & appliances. Monthly sea freight departures with full customs management included.
                </p>
                <Link href="/dominican-republic" className="btn-primary py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 group-hover:bg-[var(--brand-blue)] transition-all">
                  Cargo Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Service Card 2: Spain/Europe */}
            <motion.div whileHover={{ y: -10 }} className="p-2 rounded-[3.5rem] bg-slate-50 border border-slate-100 group transition-all">
              <div className="relative h-64 rounded-[3rem] overflow-hidden mb-8 shadow-xl bg-[var(--brand-blue)] flex items-center justify-center">
                 <Globe className="w-24 h-24 text-white/10 absolute rotate-12" />
                 <Truck className="w-20 h-20 text-white z-10" />
              </div>
              <div className="p-8 pt-0 space-y-6">
                <h3 className="text-3xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter underline underline-offset-4 decoration-blue-500/30">Spain & Europe</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Reliable UK to Europe freight. We handle the transport while you manage destination customs for complete control.
                </p>
                <Link href="/spain-europe" className="bg-white text-[var(--brand-blue)] border-2 border-slate-100 py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest hover:border-[var(--brand-blue)] transition-all">
                  Route Map <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Service Card 3: Local UK */}
            <motion.div whileHover={{ y: -10 }} className="p-2 rounded-[3.5rem] bg-slate-50 border border-slate-100 group transition-all">
              <div className="relative h-64 rounded-[3rem] overflow-hidden mb-8 shadow-xl">
                <Image src="/courier.png" alt="Local London Courier" fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-orange)]/40 to-transparent flex items-end p-8">
                   <span className="bg-white text-[var(--brand-orange)] px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Same-day London</span>
                </div>
              </div>
              <div className="p-8 pt-0 space-y-6">
                <h3 className="text-3xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter underline underline-offset-4 decoration-orange-500/30">Local UK Courier</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Professional fleet across London and UK inter-city routes. Efficient logistics for households and local businesses.
                </p>
                <Link href="/local-courier" className="btn-primary py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 group-hover:bg-[var(--brand-blue)] transition-all">
                  Book Pickup <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Updates & Trust Section */}
      <section className="py-32 bg-[var(--brand-blue)] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-[1] italic uppercase tracking-tighter">
                Trusted by the <br /> <span className="text-[var(--brand-orange)] font-black">Community</span>
              </h2>
              <p className="text-blue-100/80 text-xl mb-12 max-w-lg font-medium leading-relaxed">
                For over a decade, TS Couriers and Dominican Shipping have been the bridge between families. We combine expert logistics with personal care.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-inner group-hover:bg-[var(--brand-orange)] transition-all">
                    <Shield className="w-7 h-7 text-[var(--brand-orange)] group-hover:text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">Fully Secured</h4>
                    <p className="text-sm text-blue-200/60 font-medium">Every shipment is tracked and insured for peace of mind.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-inner group-hover:bg-[var(--brand-orange)] transition-all">
                    <Package className="w-7 h-7 text-[var(--brand-orange)] group-hover:text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">White Glove</h4>
                    <p className="text-sm text-blue-200/60 font-medium">Specialized handling for large items and fragile cargo.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-10 flex flex-wrap gap-8">
                 <div className="flex flex-col"><span className="text-4xl font-black text-[var(--brand-orange)]">10k+</span><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Orders Delivered</span></div>
                 <div className="flex flex-col"><span className="text-4xl font-black text-blue-400">15+</span><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Global Partners</span></div>
                 <div className="flex flex-col"><span className="text-4xl font-black text-[var(--brand-orange)]">100%</span><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Trust Rate</span></div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/5 rounded-[4rem] blur-2xl group-hover:bg-white/10 transition-all" />
              <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">System <br /><span className="text-[var(--brand-orange)]">Updates</span></h3>
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center rotate-12"><MessageSquare className="w-6 h-6 text-orange-400" /></div>
                </div>
                <div className="space-y-8">
                  {LATEST_UPDATES.map((update, idx) => (
                    <div key={idx} className="pb-8 border-b border-white/5 group last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                         <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${update.urgent ? 'bg-[var(--brand-orange)] text-white' : 'bg-white/10 text-blue-200'}`}>
                           {update.tag}
                         </div>
                         {update.urgent && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />}
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-[var(--brand-orange)] transition-colors">{update.title}</h4>
                      <p className="font-medium text-blue-100/60 leading-relaxed text-sm">{update.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Interactive Section */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center space-y-6 mb-24">
             <span className="bg-orange-50 text-[var(--brand-orange)] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] inline-block border border-orange-100 shadow-sm shadow-orange-500/5">Help Center</span>
             <h2 className="text-5xl md:text-6xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter underline decoration-[var(--brand-orange)] decoration-8 decoration-orange-500/10 underline-offset-12">Common <span className="text-[var(--brand-orange)]">Questions</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200 border border-slate-100 space-y-6 flex flex-col justify-between h-full bg-gradient-to-br from-white to-slate-50/50 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full translate-x-12 -translate-y-12" />
                   <div className="space-y-8 relative z-10">
                      <h3 className="text-3xl font-black text-slate-900 border-l-8 border-[var(--brand-orange)] pl-6 italic uppercase tracking-tighter">Still <br /> have <span className="text-[var(--brand-orange)]">concerns?</span></h3>
                      <p className="text-slate-500 font-medium leading-relaxed px-2">Our global support team is available 24/7 to help you with tracking or new bookings to the DR and Europe.</p>
                   </div>
                   <div className="space-y-4 pt-10">
                      <a href="https://wa.me/447700000000" className="w-full bg-emerald-50 text-emerald-600 font-black uppercase text-xs tracking-widest py-6 rounded-3xl flex items-center justify-center gap-3 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-500/5 active:scale-95 group">
                         <MessageSquare className="w-5 h-5 group-hover:scale-125 transition-transform" /> Chat via WhatsApp
                      </a>
                   </div>
                </div>
             </div>
             
             <div className="space-y-6">
               {COMMON_QUESTIONS.map((item, idx) => (
                 <div 
                   key={idx} 
                   className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer group"
                   onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                 >
                   <div className="flex justify-between items-center">
                     <h4 className="font-extrabold text-slate-800 italic uppercase tracking-tighter text-lg leading-tight group-hover:text-[var(--brand-orange)] transition-colors pr-8">{item.q}</h4>
                     <ChevronDown className={`w-6 h-6 text-slate-300 group-hover:text-[var(--brand-orange)] transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-[var(--brand-orange)]' : ''}`} />
                   </div>
                   {activeFaq === idx && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-50 mt-6 font-medium text-slate-500 leading-relaxed text-sm">
                        {item.a}
                     </motion.div>
                   )}
                 </div>
               ))}
               <Link href="/faq" className="w-full py-5 text-center text-[var(--brand-blue)] font-black uppercase text-[10px] tracking-widest block hover:text-[var(--brand-orange)] transition-colors italic border-2 border-dashed border-slate-200 rounded-3xl hover:border-[var(--brand-orange)]">
                  Explore full help directory ➔
               </Link>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Badge Bar */}
      <div className="bg-white py-12 border-y border-slate-100">
         <div className="container mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="font-black italic text-2xl tracking-tighter">LLOYDS INSURANCE</span>
            <span className="font-black italic text-2xl tracking-tighter">DR CUSTOMS</span>
            <span className="font-black italic text-2xl tracking-tighter">UK LOGISTICS</span>
            <span className="font-black italic text-2xl tracking-tighter">STRIKE SECURE</span>
         </div>
      </div>
    </main>
  );
}
