import Link from 'next/link';
import Logo from './Logo';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink, MessageSquare } from 'lucide-react';

export default function Footer() {
  const whatsappNumber = "447700000000"; // Replace with real number
  
  return (
    <footer className="bg-slate-950 text-slate-400 pt-32 pb-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-orange)] to-[var(--brand-blue)] opacity-20" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="space-y-10">
            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl shadow-white/5 group transition-transform hover:scale-105">
              <Logo />
            </div>
            <p className="text-sm font-medium leading-relaxed max-w-xs text-slate-500 italic">
              "Providing the most reliable bridge between the UK, Europe, and the Dominican Republic." Professional logistics with a community heart.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com/tscouriers" target="_blank" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[var(--brand-orange)] hover:text-white transition-all shadow-inner border border-white/5 active:scale-90">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/tscouriers" target="_blank" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[var(--brand-orange)] hover:text-white transition-all shadow-inner border border-white/5 active:scale-90">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-inner border border-emerald-500/10 active:scale-90">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] italic border-l-4 border-[var(--brand-orange)] pl-4">Logistics Hub</h4>
            <ul className="space-y-4 text-[13px] font-bold uppercase tracking-tight">
              <li><Link href="/dominican-republic" className="hover:text-[var(--brand-orange)] transition-colors inline-flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-[var(--brand-orange)] transition-colors" /> Shipping to DR</Link></li>
              <li><Link href="/spain-europe" className="hover:text-[var(--brand-orange)] transition-colors inline-flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-[var(--brand-orange)] transition-colors" /> Spain & Europe</Link></li>
              <li><Link href="/local-courier" className="hover:text-[var(--brand-orange)] transition-colors inline-flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-[var(--brand-orange)] transition-colors" /> Local London</Link></li>
              <li><Link href="/services" className="hover:text-[var(--brand-orange)] transition-colors inline-flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-[var(--brand-orange)] transition-colors" /> All Services</Link></li>
              <li><Link href="/shop" className="hover:text-[var(--brand-orange)] transition-colors inline-flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-[var(--brand-orange)] transition-colors" /> Packing Store</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-8">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] italic border-l-4 border-blue-500 pl-4">Support & Care</h4>
            <ul className="space-y-4 text-[13px] font-bold uppercase tracking-tight">
              <li><Link href="/booking" className="hover:text-[var(--brand-orange)] transition-colors">Request a Quote</Link></li>
              <li><Link href="/track" className="hover:text-[var(--brand-orange)] transition-colors">Track Shipment</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--brand-orange)] transition-colors">Common Questions</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--brand-orange)] transition-colors">Global Contact</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--brand-orange)] transition-colors opacity-40">Policy & Terms</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-8">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] italic border-l-4 border-white/20 pl-4">Our Presence</h4>
            <div className="space-y-8 text-sm">
              <div className="flex gap-4 group">
                <MapPin className="w-5 h-5 text-[var(--brand-orange)] shrink-0 group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="text-white font-black uppercase text-[10px] tracking-widest italic opacity-40">UK HQ Warehouse</div>
                  <p className="font-medium text-slate-400 group-hover:text-white transition-colors">67–69 Nathan Way, London SE28 0BQ</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                   <div className="text-white font-black uppercase text-[10px] tracking-widest italic opacity-40">DR Regional Office</div>
                   <p className="font-medium text-slate-400 group-hover:text-white transition-colors">AV Libertad 64, Yaguate, San Cristóbal</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <Mail className="w-5 h-5 text-slate-500 shrink-0" />
                <p className="font-black italic text-white uppercase text-xs tracking-tighter">taylor_services@hotmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Bar */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] group">
          <p className="opacity-40">© 2026 TS Couriers & Dominican Shipping. <span className="text-[var(--brand-orange)]">Logistics v5.0</span></p>
          <div className="flex gap-10">
            <Link href="/" className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">English Global</Link>
            <Link href="/" className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">Spanish Latam</Link>
          </div>
          <p className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
            Strategic Partner of <a href="https://tsmoneytransfer.com" target="_blank" className="text-white hover:text-[var(--brand-orange)] transition-colors flex items-center gap-1">TSMoneyTransfer.com <ExternalLink className="w-3 h-3" /></a>
          </p>
        </div>
      </div>
    </footer>
  );
}
