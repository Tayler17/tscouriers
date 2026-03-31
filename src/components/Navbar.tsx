'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, Phone, Package, Search } from 'lucide-react';
import Logo from './Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { usePathname } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Dominican Republic', href: '/dominican-republic' },
  { name: 'Spain & Europe', href: '/spain-europe' },
  { name: 'Local Courier', href: '/local-courier' },
  { name: 'Services', href: '/services' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<'EN' | 'ES'>('EN');
  const pathname = usePathname();
  const isHome = pathname === '/';

  const toggleLang = () => setLang(prev => prev === 'EN' ? 'ES' : 'EN');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "w-full z-50 transition-all duration-300 px-4 py-3",
      isHome ? "fixed" : "sticky top-0 bg-white shadow-sm border-b border-slate-50",
      isHome && scrolled ? "top-0 bg-white/80 backdrop-blur-md shadow-md py-2" : isHome ? "top-4 bg-transparent" : "py-2"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-white/20">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-slate-700 hover:text-[var(--brand-blue)] font-medium transition-colors relative group"
            >
              {lang === 'EN' ? link.name : link.name === 'Services' ? 'Servicios' : link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--brand-orange)] transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 text-slate-700 hover:text-[var(--brand-blue)] font-black px-3 transition-colors active:scale-95"
          >
            <Globe className="w-4 h-4 text-[var(--brand-orange)]" />
            <span className="text-xs uppercase tracking-widest">{lang}</span>
          </button>
          <Link href="/login" className="text-slate-700 hover:text-[var(--brand-blue)] font-bold transition-colors">
            Login
          </Link>
          <Link href="/track" className="flex items-center gap-2 text-slate-700 hover:text-[var(--brand-blue)] font-medium">
            <Search className="w-4 h-4" />
            <span>Track</span>
          </Link>
          <Link href="/booking" className="btn-primary py-2 px-5 text-sm">
            Get Quote
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-slate-700" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-lg font-semibold text-slate-800 border-b border-slate-50 pb-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-2">
            <Link href="/login" className="btn-secondary text-center font-black uppercase text-sm">Login</Link>
            <Link href="/booking" className="btn-primary text-center">Get a Quote</Link>
            <Link href="/track" className="btn-secondary text-center flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Track Shipment
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
