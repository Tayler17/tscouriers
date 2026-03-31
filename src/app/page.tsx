'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Globe, Package, Truck, Shield, MapPin, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-slate-50 pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/warehouse.png" 
            alt="Modern Logistics Warehouse"
            fill
            className="object-cover opacity-20 grayscale-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--brand-blue)] rounded-l-[100px] opacity-10 transform translate-x-20 rotate-12" />
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-4 rounded-full bg-orange-100 text-[var(--brand-orange)] font-bold text-sm mb-6 uppercase tracking-wider">
                London's Premier Logistics Partner
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--brand-blue)] leading-tight mb-6">
                Shipping Life's Most <span className="text-[var(--brand-orange)]">Important</span> Items.
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                Reliable door-to-door shipping to the Dominican Republic, efficient routes to Spain & Europe, and professional local courier services across the UK.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking" className="btn-primary flex items-center justify-center gap-2">
                  Get a Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/track" className="btn-secondary flex items-center justify-center gap-2 px-8">
                  Track Shipment
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block absolute right-12 bottom-24 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 w-80"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-[var(--brand-blue)]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Swift Tracking</h3>
              <p className="text-xs text-slate-500">Real-time status updates</p>
            </div>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter Tracking No. (Ex: TS1234)" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button className="w-full bg-[var(--brand-blue)] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
              Track Now
            </button>
          </div>
        </motion.div>
      </section>

      {/* Main Corridors / Services Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-4">Our Core Routes</h2>
              <p className="text-slate-500 max-w-2xl">Expert logistics tailored for the international community and local businesses alike.</p>
            </div>
            <Link href="/services" className="text-[var(--brand-blue)] font-bold flex items-center gap-2 hover:underline">
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1: DR */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-1 rounded-3xl bg-slate-50 border border-slate-100 group transition-all overflow-hidden"
            >
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                <Image src="/vessel.png" alt="Dominican Shipping" fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 bg-[var(--brand-blue)]/20 mix-blend-multiply" />
              </div>
              <div className="p-7 pt-0">
                <h3 className="text-2xl font-bold text-[var(--brand-blue)] mb-4">Dominican Republic</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Specialized door-to-door service for boxes, barrels, appliances, and furniture. Monthly sea freight departures.
                </p>
                <Link href="/dominican-republic" className="text-[var(--brand-orange)] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Service Card 2: Spain/Europe */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-1 rounded-3xl bg-slate-50 border border-slate-100 group transition-all overflow-hidden"
            >
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-[var(--brand-blue)] flex items-center justify-center">
                 <Globe className="w-20 h-20 text-white/20 absolute" />
                 <Truck className="w-16 h-16 text-white z-10" />
              </div>
              <div className="p-7 pt-0">
                <h3 className="text-2xl font-bold text-[var(--brand-blue)] mb-4">Spain & Europe</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Reliable UK to Europe freight routes. We handle the transport while you manage destination customs for complete control.
                </p>
                <Link href="/spain-europe" className="text-[var(--brand-blue)] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Service Card 3: Local UK */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-1 rounded-3xl bg-slate-50 border border-slate-100 group transition-all overflow-hidden"
            >
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                <Image src="/courier.png" alt="Local London Courier" fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 bg-[var(--brand-orange)]/10" />
              </div>
              <div className="p-7 pt-0">
                <h3 className="text-2xl font-bold text-[var(--brand-blue)] mb-4">Local London & UK</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Professional courier services across London and inter-city UK routes for households and businesses. Large item specialists.
                </p>
                <Link href="/local-courier" className="text-[var(--brand-orange)] font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Why Choose Us */}
      <section className="py-24 bg-[var(--brand-blue)] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                Trusted by the Community, <br /> Built for Logistics.
              </h2>
              <p className="text-blue-100 text-lg mb-12 max-w-lg">
                For years, TS Couriers and Dominican Shipping have been the bridge between families and businesses. We combine technical efficiency with community trust.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-[var(--brand-orange)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Fully Secured</h4>
                    <p className="text-sm text-blue-200">Your goods are tracked and handled with care.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-[var(--brand-orange)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Door-to-Door</h4>
                    <p className="text-sm text-blue-200">The most convenient service for international shipping.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Latest Updates</h3>
                <div className="space-y-6">
                  <div className="pb-6 border-b border-white/10">
                    <div className="text-[var(--brand-orange)] text-sm font-bold mb-2">MARCH 2026 DEPARTURES</div>
                    <p className="font-medium">Vessel to Dominican Republic departing soon. Final collection day: Sunday 22nd March.</p>
                  </div>
                  <div className="pb-6 border-b border-white/10">
                    <div className="text-[var(--brand-orange)] text-sm font-bold mb-2">NEW EXPANDED UK ROUTES</div>
                    <p className="font-medium">Weekly routes now confirmed from London to Manchester and Birmingham.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-12">Common Questions</h2>
          <div className="space-y-4 text-left">
            {[
              { q: "How long does shipping to Dominican Republic take?", a: "Estimated transit time for sea freight is 6 to 8 weeks." },
              { q: "Do the prices include customs in the Dominican Republic?", a: "Yes, our door-to-door service to the DR typically includes customs management and fees." },
              { q: "When do you collect parcels in London?", a: "Our main collection days are Sundays. Thursdays may also be available upon confirmation." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">{item.q}</h4>
                  <p className="text-slate-500 text-sm">{item.a}</p>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-[var(--brand-orange)] transition-colors" />
              </div>
            ))}
          </div>
          <Link href="/faq" className="inline-block mt-12 text-[var(--brand-blue)] font-bold hover:underline">
            View all FAQs
          </Link>
        </div>
      </section>
    </main>
  );
}
