'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Package, Truck, Shield, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FaqItem {
  id: string;
  q: string;
  a: string;
  sort_order: number;
}

const DEFAULT_FAQS: FaqItem[] = [
  { id: '1', sort_order: 1, q: "How long does shipping to Dominican Republic take?", a: "Estimated transit time for sea freight is 6 to 8 weeks from the date of departure. We have monthly vessel departures." },
  { id: '2', sort_order: 2, q: "Do prices include customs for the DR?", a: "Yes, our door-to-door service to the Dominican Republic typically includes customs management and destination duties for personal effects." },
  { id: '3', sort_order: 3, q: "What items are prohibited to ship to DR?", a: "Certain items like illegal substances, hazardous chemicals, and large amounts of cash are prohibited. For specific items like vehicle parts, customs rules may apply." },
  { id: '4', sort_order: 4, q: "Who is responsible for European customs?", a: "For shipments to Spain and Europe, customs charges and customs management at the destination are the customer's responsibility." },
  { id: '5', sort_order: 5, q: "Do you offer door-to-door in Europe?", a: "We offer transport from our London warehouse to the destination city. Final door delivery depends on the specific route and agreement." },
  { id: '6', sort_order: 6, q: "When are your collection days in London?", a: "Our main collection days are Sundays. Thursdays may also be available upon confirmation. Please book by Friday." },
  { id: '7', sort_order: 7, q: "What payment methods do you accept?", a: "We accept bank transfer, cash on collection, and secure payment links for remote bookings." },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [activeIdx, setActiveIdx] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('faqs').select('*').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) setFaqs(data as FaqItem[]);
    });
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-20">
      <section className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Frequently Asked <span className="text-[var(--brand-orange)]">Questions</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto italic">Everything you need to know about shipping with TS Couriers.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Sidebar */}
            <div className="hidden lg:block space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Topics</p>
              {['Dominican Republic', 'Spain & Europe', 'Collections', 'Payments'].map((label) => (
                <div key={label} className="w-full text-left p-4 rounded-xl font-bold text-slate-700 bg-slate-50 text-sm">
                  {label}
                </div>
              ))}
              <div className="pt-10">
                <div className="p-6 bg-[var(--brand-blue)] rounded-2xl text-white">
                  <h4 className="font-bold mb-2">Still need help?</h4>
                  <p className="text-xs text-blue-200 mb-6 italic">Our bilingual support is available 6 days a week.</p>
                  <Link href="/contact" className="text-[var(--brand-orange)] font-bold text-sm underline">Contact Us</Link>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-2xl font-bold text-[var(--brand-blue)] mb-8 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-[var(--brand-orange)]" />
                Common Questions
              </h3>
              {faqs.map((item, i) => {
                const isOpen = activeIdx === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border border-slate-100 rounded-3xl overflow-hidden hover:border-slate-200 transition-all"
                  >
                    <button
                      className="w-full p-6 text-left flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      onClick={() => setActiveIdx(isOpen ? null : item.id)}
                    >
                      <span className="font-bold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-2 bg-white">
                            <p className="text-slate-600 leading-relaxed text-sm">{item.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Icon strip */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { icon: Shield, label: 'Secure Cargo' },
              { icon: Truck, label: 'Fast Local Fleet' },
              { icon: Package, label: 'Careful Packing' },
              { icon: DollarSign, label: 'Transparent Pricing' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <Icon className="w-8 h-8 text-[var(--brand-blue)] mb-4" />
                <h5 className="font-bold text-slate-800">{label}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
