'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Search, MessageSquare, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Dominican Republic', href: '/dominican-republic' },
  { name: 'Spain & Europe', href: '/spain-europe' },
  { name: 'Local Courier', href: '/local-courier' },
  { name: 'Shop', href: '/shop' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/driver') || pathname.startsWith('/customer');

  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 80) setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on outside click via escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : user?.role === 'DRIVER' ? '/driver' : '/customer';
  const dashboardLabel = user?.role === 'ADMIN' ? 'Admin Panel' : user?.role === 'DRIVER' ? 'Driver App' : 'My Account';

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/');
  };

  if (isDashboard) return null;

  return (
    <>
      <nav className={cn(
        "w-full z-50 transition-all duration-300 px-4 py-3",
        isHome ? "fixed" : "sticky top-0 bg-white shadow-sm border-b border-slate-50",
        isHome && scrolled ? "top-0 bg-white/80 backdrop-blur-md shadow-md py-2" : isHome ? "top-4 bg-transparent" : "py-2"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/95 backdrop-blur-sm px-4 md:px-6 py-3 rounded-2xl shadow-sm border border-white/20">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "font-medium transition-colors relative group text-sm",
                  pathname === link.href ? "text-[var(--brand-blue)]" : "text-slate-700 hover:text-[var(--brand-blue)]"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-[var(--brand-orange)] transition-all",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 text-[var(--brand-orange)] font-black uppercase text-xs tracking-widest border border-orange-500/20 px-4 py-2 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {dashboardLabel}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-[var(--brand-blue)] font-bold transition-colors text-sm">Login</Link>
                <Link href="/track" className="flex items-center gap-2 text-slate-700 hover:text-[var(--brand-blue)] font-medium text-sm">
                  <Search className="w-4 h-4" /><span>Track</span>
                </Link>
                <Link href="/booking" className="btn-primary py-2 px-5 text-sm shadow-lg shadow-orange-500/10">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            onClick={() => setIsOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-6 h-6" /></motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-6 h-6" /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile Menu — fixed overlay, independent of nav scroll */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-3 right-3 z-50 lg:hidden bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
              style={{
                top: isHome && !scrolled ? '88px' : '68px',
                maxHeight: `calc(100vh - ${isHome && !scrolled ? '100px' : '80px'})`,
              }}
            >
              {/* Scrollable content */}
              <div className="overflow-y-auto" style={{ maxHeight: `calc(100vh - ${isHome && !scrolled ? '100px' : '80px'})` }}>

                {user ? (
                  /* ── LOGGED-IN MOBILE MENU ── */
                  <div className="p-6 space-y-3">
                    {/* User badge */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                      <div className="w-11 h-11 bg-[var(--brand-orange)] text-white rounded-xl flex items-center justify-center font-black text-lg shadow">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between w-full p-5 bg-[var(--brand-blue)] text-white rounded-2xl font-black uppercase text-sm tracking-widest active:scale-95 transition-all"
                    >
                      <span className="flex items-center gap-3"><LayoutDashboard className="w-5 h-5" />{dashboardLabel}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/track"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between w-full p-4 bg-slate-50 text-slate-700 rounded-2xl font-bold uppercase text-sm border border-slate-100 active:scale-95 transition-all"
                    >
                      <span className="flex items-center gap-3"><Search className="w-4 h-4 text-slate-400" />Track Shipment</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  /* ── GUEST MOBILE MENU ── */
                  <div className="p-6 space-y-1">
                    {/* Nav links */}
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between w-full py-4 px-2 border-b border-slate-50 transition-colors active:bg-slate-50",
                          pathname === link.href
                            ? "text-[var(--brand-orange)] font-black"
                            : "text-slate-800 font-bold hover:text-[var(--brand-blue)]"
                        )}
                      >
                        <span className="text-lg italic uppercase tracking-tighter">{link.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                    ))}

                    {/* Action buttons */}
                    <div className="pt-4 space-y-3">
                      <Link
                        href="/booking"
                        onClick={() => setIsOpen(false)}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
                      >
                        Book Now <ChevronRight className="w-4 h-4" />
                      </Link>
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href="/track"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-700 rounded-2xl font-black uppercase text-xs border border-slate-100 active:scale-95 transition-all"
                        >
                          <Search className="w-4 h-4" /> Track
                        </Link>
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs active:scale-95 transition-all"
                        >
                          Login
                        </Link>
                      </div>
                      <a
                        href="https://wa.me/message/MW3IK3B7LUTSG1"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-xs border border-emerald-100 active:scale-95 transition-all"
                      >
                        <MessageSquare className="w-4 h-4" /> WhatsApp Support
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
