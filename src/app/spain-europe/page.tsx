'use client';

import { motion } from 'framer-motion';
import { Globe, Truck, ShieldCheck, Info, ArrowRight, Package, Calculator, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SpainEuropeService() {
  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="text-[var(--brand-blue)] font-bold text-sm uppercase tracking-widest mb-4 inline-block">International Freight</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--brand-blue)] mb-8">
              Shipping to <br /><span className="text-[var(--brand-orange)]">Spain & Europe</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
              Reliable transport solutions from the UK to Spain and European destinations. We provide the logistics; you maintain control of your cargo.
            </p>
            <div className="flex flex-wrap gap-4">
               <Link href="/booking" className="btn-primary">Request EU Quote</Link>
               <Link href="/contact" className="px-8 py-3 rounded-lg font-bold border-2 border-slate-200 text-slate-700 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition-all">Speak to an Agent</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Customs Disclaimer / Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-orange-50 border-l-8 border-[var(--brand-orange)] p-8 rounded-2xl">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[var(--brand-orange)] rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--brand-blue)] mb-4 uppercase">Important Notice: Customs Responsibility</h3>
                <p className="text-slate-700 mb-4 leading-relaxed font-medium">
                  For shipments to Spain and Europe, customs charges and customs management at the destination are the <span className="underline decoration-[var(--brand-orange)] decoration-2">customer’s responsibility</span>.
                </p>
                <p className="text-slate-600 text-sm">
                  TS Couriers handles the international transport and logistics from the UK. While we offer general guidance, each customer must ensure they comply with local EU customs regulations upon arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-6">Efficient Logistics Corridor</h2>
                <p className="text-slate-600 leading-relaxed">
                  We have established weekly routes from London to major cities in Spain and the European Union. Whether you are moving personal items or commercial goods, we ensure a professional handling process.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Weekly Departures", desc: "Consistent schedule for predictable delivery windows." },
                  { title: "Secure Handling", desc: "Expert packing and loading to minimize risk during transit." },
                  { title: "Route Optimization", desc: "Direct logistics for faster turnaround times compared to standard post." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand-orange)]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-slate-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-orange)] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
               <h3 className="text-2xl font-bold mb-8 italic">Transit Estimates</h3>
               <div className="space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-blue-200">UK to France/Benelux</span>
                    <span className="font-bold text-[var(--brand-orange)]">3-5 Days</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-blue-200">UK to Spain (Madrid/Barcelona)</span>
                    <span className="font-bold text-[var(--brand-orange)]">5-7 Days</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-blue-200">UK to Southern Spain/Portugal</span>
                    <span className="font-bold text-[var(--brand-orange)]">7-10 Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">UK to Central/Eastern Europe</span>
                    <span className="font-bold text-[var(--brand-orange)]">Call for Quote</span>
                  </div>
               </div>
               <p className="mt-10 text-xs text-blue-300 italic opacity-70">
                 * Transit times are estimates and may vary due to customs processing and peak seasons.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-24 bg-[var(--brand-blue)] text-white text-center">
        <div className="container mx-auto px-6">
           <h2 className="text-3xl md:text-5xl font-extrabold mb-8">Send Your Cargo to Europe</h2>
           <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <Link href="/booking" className="bg-[var(--brand-orange)] text-white font-bold py-4 px-10 rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
               Get Custom Quote <Calculator className="w-5 h-5" />
             </Link>
             <Link href="/services" className="bg-white/10 backdrop-blur-md text-white font-bold py-4 px-10 rounded-xl hover:bg-white/20 transition-all">
               View Packaging Rules
             </Link>
           </div>
        </div>
      </section>
    </main>
  );
}
