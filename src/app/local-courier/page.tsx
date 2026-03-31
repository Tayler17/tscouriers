'use client';

import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, Shield, ArrowRight, CheckCircle2, Package, Map } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LocalCourierService() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="z-10"
          >
            <span className="text-[var(--brand-orange)] font-bold text-sm uppercase tracking-widest mb-4 inline-block">Regional Logistics Authority</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--brand-blue)] mb-8 leading-tight">
              London & UK <br /> <span className="text-[var(--brand-orange)]">Local Courier</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Fast, professional, and scalable transport services across London and to major UK cities. We specialize in heavy items, furniture, and business-to-business logistics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <Link href="/quote" className="btn-primary flex items-center justify-center gap-2">Book Local Pickup <Truck className="w-5 h-5" /></Link>
               <Link href="/contact" className="btn-secondary px-8">Contact Our Fleet</Link>
            </div>
            
            <div className="mt-12 flex gap-8">
               <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--brand-orange)]" />
                  <span className="text-sm font-bold text-slate-700">Same-Day Available</span>
               </div>
               <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--brand-orange)]" />
                  <span className="text-sm font-bold text-slate-700">Fully Insured</span>
               </div>
            </div>
          </motion.div>
          
          <div className="relative">
             <div className="relative h-[500px] w-full bg-slate-100 rounded-[50px] overflow-hidden rotate-3">
                <Image src="/courier.png" alt="London Courier Van" fill className="object-cover -rotate-3 scale-110" />
             </div>
             <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl border border-slate-50 max-w-xs transition-transform hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Map className="w-5 h-5 text-[var(--brand-blue)]" />
                   </div>
                   <h4 className="font-bold text-slate-800">Canary Wharf</h4>
                </div>
                <p className="text-xs text-slate-500 italic">"TS Couriers handles our office relocations and fragile cargo with absolute precision every time."</p>
             </div>
          </div>
        </div>
      </section>

      {/* Services Breakdown */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-4">Logistics Built for Performance</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">We are not just a parcel shop. We are a transport partner for your most demanding routes.</p>
        </div>
        
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Same-City London", desc: "Express and scheduled deliveries within all London zones." },
            { title: "Heavy Parts & Appliances", desc: "Specialist handling for vehicle spares and large white goods." },
            { title: "London to UK Cities", desc: "Daily routes from London to Birmingham, Manchester, and more." },
            { title: "Furniture Transport", desc: "Gentle handling for household items and office furniture." },
            { title: "Business Contracts", desc: "Regular recurring delivery routes for local entrepreneurs." },
            { title: "Route-Based Service", desc: "Cost-effective shared routes for multi-stop deliveries." }
          ].map((item, idx) => (
             <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--brand-blue)] transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-[var(--brand-blue)] group-hover:text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Operational Area Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
           <div className="lg:w-1/2">
              <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-8 italic uppercase tracking-tighter">Your London Logistics Hub</h2>
              <div className="space-y-8">
                 <div className="flex gap-4">
                    <MapPin className="w-6 h-6 text-[var(--brand-orange)] shrink-0" />
                    <div>
                       <h4 className="font-bold text-lg">67–69 Nathan Way, London SE28 0BQ</h4>
                       <p className="text-slate-500 text-sm">Strategic warehouse location for quick access to Greater London and national motorways.</p>
                    </div>
                 </div>
                 <div className="p-8 bg-[var(--brand-blue)] rounded-3xl text-white">
                    <h3 className="text-xl font-bold mb-4">Active UK Routes:</h3>
                    <ul className="grid grid-cols-2 gap-4 text-sm font-medium">
                       <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[var(--brand-orange)]" /> London to Manchester</li>
                       <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[var(--brand-orange)]" /> London to Birmingham</li>
                       <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[var(--brand-orange)]" /> London to South East</li>
                       <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[var(--brand-orange)]" /> London to Midlands</li>
                    </ul>
                 </div>
              </div>
           </div>
           
           <div className="lg:w-1/2 relative">
               <div className="relative h-96 w-full rounded-[40px] bg-slate-900 overflow-hidden group">
                  <Image src="/warehouse.png" alt="Warehouse Operations" fill className="object-cover opacity-60 transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Link href="/contact" className="bg-white text-[var(--brand-blue)] px-8 py-3 rounded-xl font-bold hover:bg-[var(--brand-orange)] hover:text-white transition-all">Visit Our Warehouse</Link>
                  </div>
               </div>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[var(--brand-orange)] text-white text-center rounded-t-[100px]">
         <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 italic">Trust Your Fleet.</h2>
            <p className="text-orange-50 text-xl mb-12 max-w-2xl mx-auto italic">Scale your business or move your items with London’s most reliable transport network.</p>
            <Link href="/quote" className="inline-block bg-[var(--brand-blue)] text-white font-bold py-5 px-16 rounded-2xl text-xl hover:scale-105 transition-all shadow-2xl">Start a Booking Now</Link>
         </div>
      </section>
    </main>
  );
}
