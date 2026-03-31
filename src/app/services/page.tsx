'use client';

import { motion } from 'framer-motion';
import { 
  Globe, 
  Plane, 
  Ship, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Package,
  Layers,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  {
    icon: Plane,
    name: "Air Freight",
    tagline: "Express Global Delivery",
    desc: "Speed and reliability for your most urgent shipments with premium air carriers. Ideal for time-critical logistics.",
    features: ["Next Day Delivery", "Premium Handling", "Customs Brokerage", "Global Express"],
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20"
  },
  {
    icon: Ship,
    name: "Sea Freight",
    tagline: "Global Container Solutions",
    desc: "Cost-effective, large-scale shipping solutions for containers and oversized items. Perfect for long-distance logistics.",
    features: ["FCL & LCL Options", "Barrel Consolidation", "Secure Warehousing", "Tracked Voyages"],
    color: "bg-orange-500",
    shadow: "shadow-orange-500/20"
  },
  {
    icon: Truck,
    name: "Local Courier",
    tagline: "Last Mile Excellence",
    desc: "Dedicated domestic logistics for local distribution within UK, Dominican Republic, and Europe.",
    features: ["Same Day Pickup", "Door-to-door Delivery", "Real-time Tracking", "POD Documentation"],
    color: "bg-slate-900",
    shadow: "shadow-slate-900/20"
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -skew-x-12 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
               <div className="w-10 h-10 bg-[var(--brand-orange)] rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Layers className="w-5 h-5" />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Our Premium Solutions</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 leading-[0.9] italic uppercase tracking-tighter mb-8">
              Services Tailored <br /> to <span className="text-[var(--brand-orange)]">Global Success</span>
            </h1>
            <p className="text-xl text-slate-500 font-bold max-w-xl leading-relaxed italic">
              From UK to the world, we provide end-to-end logistics with absolute transparency and care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {SERVICES.map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                <div className={`w-20 h-20 ${service.color} text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl ${service.shadow} group-hover:scale-110 transition-transform duration-500`}>
                   <service.icon className="w-10 h-10" />
                </div>

                <div className="space-y-4 mb-10">
                   <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">{service.name}</h3>
                   <p className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.2em]">{service.tagline}</p>
                   <p className="text-sm font-bold text-slate-500 leading-relaxed italic">{service.desc}</p>
                </div>

                <div className="space-y-3 mb-12">
                   {service.features.map((f, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f}</span>
                     </div>
                   ))}
                </div>

                <Link 
                  href="/booking"
                  className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-[var(--brand-orange)] transition-colors group/link"
                >
                  Book this service <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-slate-900 py-20 text-white relative overflow-hidden mx-6 rounded-[4rem] mb-20">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         <div className="container mx-auto px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Secured <span className="text-[var(--brand-orange)]">Logistics</span></h2>
               <p className="text-blue-200 font-bold opacity-70">Over 15,000 successful deliveries across the world. Your cargo is in professional hands.</p>
            </div>
            <div className="flex gap-8 flex-wrap justify-center">
               <div className="text-center">
                  <p className="text-4xl font-black italic mb-1">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Secure Delivery</p>
               </div>
               <div className="text-center">
                  <p className="text-4xl font-black italic mb-1">24/7</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Global Support</p>
               </div>
               <div className="text-center">
                  <p className="text-4xl font-black italic mb-1">0.1%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Conflict Rate</p>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
