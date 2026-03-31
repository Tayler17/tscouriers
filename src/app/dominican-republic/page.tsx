'use client';

import { motion } from 'framer-motion';
import { Ship, Package, Calendar, ShieldCheck, MapPin, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DominicanRepublicService() {
  return (
    <main className="min-h-screen pt-24">
      {/* Page Header / Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <Image 
          src="/vessel.png" 
          alt="Shipping to Dominican Republic" 
          fill 
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[var(--brand-orange)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Dominican Shipping Specialists</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Shipping to the <br /> <span className="text-[var(--brand-orange)]">Dominican Republic</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Puerta a puerta. Enviamos tus maletas, cajas, tanques y electrodomésticos desde Londres directamente a tu casa en República Dominicana.
            </p>
            <div className="flex gap-4">
              <Link href="/quote" className="btn-primary">Request DR Quote</Link>
              <Link href="/contact" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-3 px-8 rounded-lg transition-all">Contact Spanish Support</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Details Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-8">Nuestra Promesa / Our Promise</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                TS Couriers and Dominican Shipping focus on the community. We understand that your shipments are more than just items—they are help and love for your family back home.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: "Door-to-Door Delivery", desc: "No need to pick up at port. We deliver directly to the final address in DR." },
                  { title: "Customs Included", desc: "For this route, we typically include customs management and fees in our flat rate." },
                  { title: "Monthly Departures", desc: "Reliable sea freight departures every month from our London warehouse." },
                  { title: "Specialized Items", desc: "Experience with barrels, oversized crates, vehicle parts, and full household removals." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[var(--brand-orange)] shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-40 bg-slate-100 rounded-3xl p-6 flex flex-col justify-end">
                  <h4 className="font-bold text-[var(--brand-blue)]">6-8 Weeks</h4>
                  <p className="text-slate-500 text-xs italic">Estimated transit time</p>
                </div>
                <div className="h-64 relative rounded-3xl overflow-hidden">
                   <Image src="/warehouse.png" alt="Warehouse" fill className="object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-[var(--brand-orange)] rounded-3xl p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-20"><Ship className="w-20 h-20" /></div>
                   <h3 className="text-3xl font-extrabold mb-4">DR Customs</h3>
                   <p className="text-orange-50 font-medium">Full management included. We handle the paperwork so you don't have to.</p>
                </div>
                <div className="h-40 bg-slate-900 rounded-3xl p-6 flex flex-col justify-end text-white">
                  <h4 className="font-bold text-[var(--brand-orange)]">Monthly Vessels</h4>
                  <p className="text-slate-400 text-xs italic">London to Rio Haina / Caucedo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we ship grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-4">What Can You Ship?</h2>
            <p className="text-slate-500">From personal effects to commercial cargo.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Package, name: "Boxes & Barrels" },
              { icon: Truck, name: "Vehicle Parts" },
              { icon: Package, name: "Appliances" },
              { icon: Package, name: "Furniture" },
              { icon: Package, name: "Pallets" },
              { icon: Package, name: "Shared Containers" },
              { icon: Package, name: "Full Containers" },
              { icon: Package, name: "Personal Luggage" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-[var(--brand-orange)] transition-colors">
                <item.icon className="w-10 h-10 text-slate-300 group-hover:text-[var(--brand-orange)] transition-colors mb-4" />
                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Info */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="container mx-auto px-6">
          <div className="bg-[var(--brand-blue)] rounded-[40px] p-8 md:p-16 text-white relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-8">London Collection Process</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-[var(--brand-orange)] font-bold text-xl">1</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 italic underline decoration-[var(--brand-orange)]">Sundays are Collection Days</h4>
                      <p className="text-blue-100">Our main collection routes across London happen every Sunday. Please book by Friday to secure your slot.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-[var(--brand-orange)] font-bold text-xl">2</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Door Pickup</h4>
                      <p className="text-blue-100">Our professional drivers will arrive to collect your items. We can provide packing materials if requested in advance.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                 <div className="relative h-96 w-full rounded-3xl overflow-hidden border-8 border-white/5">
                    <Image src="/courier.png" alt="Collection Van" fill className="object-cover" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-6">Ready to Send Your Shipment?</h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto italic">Join hundreds of families who trust TS Couriers for their shipments to Dominican Republic.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/quote" className="btn-primary flex items-center justify-center gap-2 px-10">Start Your Quote <ArrowRight className="w-5 h-5" /></Link>
             <Link href="https://wa.me/message/MW3IK3B7LUTSG1" className="btn-secondary flex items-center justify-center gap-2">WhatsApp Spanish Support</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
