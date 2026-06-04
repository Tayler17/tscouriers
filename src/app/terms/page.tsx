'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, AlertCircle, Package, Globe, Phone } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    icon: FileText,
    title: "1. Booking & Service Agreement",
    content: [
      "By placing a booking with TS Couriers, you confirm that all information provided is accurate and complete.",
      "TS Couriers reserves the right to refuse or cancel bookings that violate these terms or applicable law.",
      "Bookings are confirmed upon receipt of payment or agreed payment arrangement.",
      "Collection windows are estimated. TS Couriers will contact you to confirm the exact time.",
    ]
  },
  {
    icon: Package,
    title: "2. Cargo & Prohibited Items",
    content: [
      "You are responsible for ensuring your goods are permitted under UK export regulations and destination country import regulations.",
      "Prohibited items include: illegal substances, hazardous materials, weapons, counterfeit goods, and live animals.",
      "Currency shipments exceeding legal thresholds require prior declaration.",
      "TS Couriers reserves the right to inspect, refuse, or report any suspected prohibited cargo to the relevant authorities.",
    ]
  },
  {
    icon: Shield,
    title: "3. Liability & Insurance",
    content: [
      "TS Couriers provides basic cargo protection included in all shipments. Liability is limited to the declared value or £50 per item, whichever is lower, unless additional insurance is purchased.",
      "Claims for damage or loss must be reported within 7 days of the expected delivery date.",
      "TS Couriers is not liable for delays caused by customs clearance, weather, strikes, or events beyond our control.",
      "For high-value items (electronics, jewellery, artwork), supplemental insurance is strongly recommended.",
    ]
  },
  {
    icon: Globe,
    title: "4. International Shipping & Customs",
    content: [
      "For shipments to the Dominican Republic, TS Couriers assists with customs documentation. The receiver is responsible for any applicable duties beyond what is included in the agreed service.",
      "For shipments to Spain and Europe, customs clearance and any resulting fees at the destination are solely the customer's responsibility.",
      "Transit times are estimates only. Sea freight typically takes 6–8 weeks from London to Santo Domingo.",
      "TS Couriers is not responsible for items held by customs authorities.",
    ]
  },
  {
    icon: AlertCircle,
    title: "5. Payments & Refunds",
    content: [
      "Payments are accepted by bank transfer, cash on collection, or approved payment link.",
      "Quoted prices are valid for 14 days and subject to change based on fuel surcharges or route changes.",
      "Refunds for cancelled bookings are considered on a case-by-case basis. Bookings cancelled before collection may receive a full or partial refund. Bookings cancelled after collection are non-refundable.",
      "Disputes must be submitted in writing within 30 days of the service date.",
    ]
  },
  {
    icon: Shield,
    title: "6. Privacy & Data",
    content: [
      "TS Couriers collects personal data (name, address, phone, email) solely for the purpose of providing logistics services.",
      "Your data is stored securely and is never sold to third parties.",
      "We may share your information with customs authorities, delivery partners, or legal bodies as required by law.",
      "You may request deletion of your data by contacting us at dominicanshipping@tscouriers.com.",
    ]
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[var(--brand-orange)] rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Terms of <span className="text-[var(--brand-orange)]">Service</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl italic">
              Please read these terms carefully before using TS Couriers services. By booking with us, you agree to be bound by these conditions.
            </p>
            <p className="text-xs text-slate-500 mt-6 font-bold uppercase tracking-widest">Last updated: January 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                    <section.icon className="w-5 h-5 text-[var(--brand-orange)]" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">{section.title}</h2>
                </div>
                <ul className="space-y-4">
                  {section.content.map((point, j) => (
                    <li key={j} className="flex gap-4 text-slate-600 text-sm leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)] shrink-0 mt-2" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Contact Box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-[var(--brand-blue)] rounded-[3rem] p-12 text-white text-center"
          >
            <Phone className="w-10 h-10 text-[var(--brand-orange)] mx-auto mb-6" />
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Questions About Our Terms?</h3>
            <p className="text-blue-200 mb-8 italic max-w-lg mx-auto">Our bilingual team is happy to explain any of these terms in English or Spanish.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 bg-[var(--brand-orange)] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/30">
                Contact Us
              </Link>
              <a href="https://wa.me/message/MW3IK3B7LUTSG1" className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all border border-white/20">
                WhatsApp Support
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
