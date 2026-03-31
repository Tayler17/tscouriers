'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Globe, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const offices = [
  {
    city: "London Warehouse (HQ)",
    address: "67–69 Nathan Way, London SE28 0BQ",
    email: "dominicanshipping@tscouriers.com",
    phone: "+44 207 407 6858",
    hours: "Mon-Fri: 10am - 5pm | Sat: 10am - 2pm",
    days: "Collections: Sundays (Main) & Thursdays"
  },
  {
    city: "Dominican Republic Office",
    address: "AV Libertad 64, Yaguate, San Cristóbal",
    email: "taylor_services@hotmail.com",
    phone: "+1 (DR Support Number)",
    hours: "Local DR Business Hours",
    days: "Door-to-Door Delivery Management"
  }
];

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Contact Hero */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--brand-blue)] mb-6">
              Get in <span className="text-[var(--brand-orange)]">Touch</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Whether you are shipping a barrel to the DR or need a commercial courier across London, our team is ready to help in English and Spanish.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
               <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-50">
                  <h3 className="text-3xl font-bold text-[var(--brand-blue)] mb-8">Send a Message</h3>
                  <form className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-700">Full Name</label>
                           <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-blue)]/10 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-700">Email Address</label>
                           <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-blue)]/10 outline-none transition-all" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Subject</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-blue)]/10 outline-none transition-all">
                           <option>Shipping Quote Request</option>
                           <option>Tracking Inquiry</option>
                           <option>Commercial Logistics</option>
                           <option>General Support</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Message</label>
                        <textarea rows={5} placeholder="How can we help you today?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-blue)]/10 outline-none transition-all resize-none"></textarea>
                     </div>
                     <button className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                        Send Message <Send className="w-5 h-5" />
                     </button>
                  </form>
               </div>
            </div>

            {/* Right: Info Boxes */}
            <div className="lg:col-span-5 space-y-8">
               <div className="p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-orange)] opacity-10 rounded-full translate-x-12 -translate-y-12" />
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[var(--brand-orange)]" />
                    Bilingual Support
                  </h3>
                  <p className="text-blue-100 mb-8 font-medium italic">"Hablamos tu idioma. Nuestro equipo domina el inglés y el español para brindarte el mejor servicio."</p>
                  <div className="space-y-4">
                     <a href="https://wa.me/message/MW3IK3B7LUTSG1" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                           <Phone className="w-5 h-5 text-green-400 group-hover:text-white" />
                        </div>
                        <span className="font-bold">WhatsApp Support</span>
                     </a>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                           <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="font-bold">English / Español</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  {offices.map((office, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                       <h4 className="font-bold text-[var(--brand-blue)] text-xl mb-4">{office.city}</h4>
                       <div className="space-y-3 text-sm">
                          <div className="flex gap-3 text-slate-600">
                             <MapPin className="w-4 h-4 text-[var(--brand-orange)] shrink-0" />
                             <span>{office.address}</span>
                          </div>
                          <div className="flex gap-3 text-slate-600">
                             <Clock className="w-4 h-4 text-[var(--brand-orange)] shrink-0" />
                             <span>{office.hours}</span>
                          </div>
                          <div className="flex gap-3 text-slate-600">
                             <Mail className="w-4 h-4 text-[var(--brand-orange)] shrink-0" />
                             <span>{office.email}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section placeholder */}
      <section className="h-[400px] bg-slate-200 relative">
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-400 flex flex-col items-center">
               <MapPin className="w-12 h-12 mb-2" />
               <span className="font-bold uppercase tracking-widest">Interactive Map Integration</span>
            </div>
         </div>
      </section>
    </main>
  );
}
