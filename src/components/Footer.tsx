import Link from 'next/link';
import Logo from './Logo';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="bg-white p-3 rounded-xl inline-block">
              <Logo />
            </div>
            <p className="text-sm leading-relaxed">
              Leading the bridge between the UK, Europe, and the Dominican Republic. Professional logistics with a community heart.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[var(--brand-orange)] hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[var(--brand-orange)] hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[var(--brand-orange)] hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Services</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/dominican-republic" className="hover:text-[var(--brand-orange)] transition-colors">Shipping to Dominican Republic</Link></li>
              <li><Link href="/spain-europe" className="hover:text-[var(--brand-orange)] transition-colors">Shipping to Spain & Europe</Link></li>
              <li><Link href="/local-courier" className="hover:text-[var(--brand-orange)] transition-colors">Local Courier London</Link></li>
              <li><Link href="/services" className="hover:text-[var(--brand-orange)] transition-colors">Packing & Storage</Link></li>
              <li><Link href="/shop" className="hover:text-[var(--brand-orange)] transition-colors">Packing Materials Store</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/quote" className="hover:text-[var(--brand-orange)] transition-colors">Get a Quote</Link></li>
              <li><Link href="/track" className="hover:text-[var(--brand-orange)] transition-colors">Track Shipment</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--brand-orange)] transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--brand-orange)] transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--brand-orange)] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Our Locations</h4>
            <div className="space-y-6 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[var(--brand-orange)] shrink-0" />
                <div>
                  <div className="text-white font-bold mb-1">London Warehouse</div>
                  <p>67–69 Nathan Way, <br /> London SE28 0BQ</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[var(--brand-orange)] shrink-0" />
                <div>
                  <div className="text-white font-bold mb-1">Dominican Republic</div>
                  <p>AV Libertad 64, Yaguate, <br /> San Cristóbal</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Mail className="w-5 h-5 text-[var(--brand-orange)] shrink-0" />
                <p>taylor_services@hotmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs group">
          <p>© 2026 TS Couriers & Dominican Shipping. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-white transition-colors">English</Link>
            <Link href="/" className="hover:text-white transition-colors">Español</Link>
          </div>
          <p className="flex items-center gap-1 opacity-50">
            Partner of <a href="https://tsmoneytransfer.com" className="underline hover:text-white transition-colors">tsmoneytransfer.com</a>
            <ExternalLink className="w-3 h-3" />
          </p>
        </div>
      </div>
    </footer>
  );
}
