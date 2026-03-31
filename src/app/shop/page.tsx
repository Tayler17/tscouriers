'use client';

import { motion } from 'framer-motion';
import { Package, Archive, Truck, ShoppingCart, Plus, Minus, CheckCircle2, ArrowRight, X, Trash2, ShoppingBag } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';

const products = [
  { 
    id: 1, 
    name: "Small Shipping Box", 
    price: "£2.50", 
    desc: "Reinforced cardboard, ideal for books and small heavy items.",
    icon: Package,
    badge: "Most Popular"
  },
  { 
    id: 2, 
    name: "Standard Shipping Box", 
    price: "£4.50", 
    desc: "Durably built for general household items and clothes.",
    icon: Package
  },
  { 
    id: 3, 
    name: "Large Shipping Box", 
    price: "£6.00", 
    desc: "Perfect for larger, bulky items. Double-walled for strength.",
    icon: Package
  },
  { 
    id: 4, 
    name: "Shipping Barrel (Tanque)", 
    price: "£35.00", 
    desc: "Standard 220L blue barrel for shipments to the DR. Includes lid.",
    icon: Archive,
    badge: "DR Specialist"
  },
  { 
    id: 5, 
    name: "Heavy Duty Packing Tape", 
    price: "£3.00", 
    desc: "Industrial strength tape to ensure your items stay sealed.",
    icon: Package
  },
  { 
    id: 6, 
    name: "Bubble Wrap (10m)", 
    price: "£8.50", 
    desc: "Essential for protecting fragile items and electronics.",
    icon: ShieldCheckFallback
  }
];

function ShieldCheckFallback(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function ShopPage() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((acc, qty) => acc + qty, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((acc, [id, qty]) => {
      const product = products.find(p => p.id === Number(id));
      if (!product) return acc;
      const price = parseFloat(product.price.replace('£', ''));
      return acc + (price * qty);
    }, 0);
  }, [cart]);

  const addToCart = (id: number) => {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const deleteItem = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="container mx-auto px-6">
        
        {/* Shop Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--brand-blue)] mb-4 italic uppercase tracking-tighter">Packing <span className="text-[var(--brand-orange)]">Materials</span></h1>
             <p className="text-xl text-slate-500 max-w-xl italic">Get the right protection for your shipments. Professional materials for local and international shipping.</p>
          </motion.div>
          
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Items</span>
                <span className="text-3xl font-black text-[var(--brand-blue)]">{cartCount}</span>
             </div>
             <button 
               onClick={() => setIsCartOpen(true)}
               className="w-16 h-16 bg-[var(--brand-orange)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all"
             >
                <ShoppingCart className="w-8 h-8" />
             </button>
          </div>
        </div>

        {/* Collection Alert */}
        <div className="bg-[var(--brand-blue)] p-8 rounded-[2.5rem] mb-16 text-white flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex gap-6 items-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                 <Truck className="w-8 h-8 text-[var(--brand-orange)]" />
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-1 underline decoration-[var(--brand-orange)] decoration-2">Collection with Shipping</h3>
                 <p className="text-blue-200 text-sm italic">We can bring your ordered materials when we collect your cargo. No separate trip needed!</p>
              </div>
           </div>
           <button className="bg-white text-[var(--brand-blue)] px-8 py-4 rounded-xl font-extrabold hover:bg-[var(--brand-orange)] hover:text-white transition-all shadow-xl">
              Request Delivery with Pickup
           </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {products.map((item) => (
             <motion.div 
               key={item.id}
               whileHover={{ y: -5 }}
               className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full group transition-all"
             >
                <div className="relative mb-8">
                   <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <item.icon className="w-10 h-10 text-slate-300 group-hover:text-[var(--brand-blue)] transition-colors" />
                   </div>
                   {item.badge && (
                     <span className="absolute top-0 right-0 bg-orange-100 text-[var(--brand-orange)] text-[10px] font-bold px-3 py-1 rounded-full uppercase italic ring-4 ring-white">
                        {item.badge}
                     </span>
                   )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-8 flex-grow leading-relaxed">{item.desc}</p>
                                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                    <span className="text-2xl font-black text-[var(--brand-blue)]">{item.price}</span>
                    <div className="flex items-center gap-1">
                       {cart[item.id] > 0 ? (
                         <>
                           <button 
                             onClick={() => removeFromCart(item.id)}
                             className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                           >
                              <Minus className="w-4 h-4 text-slate-400" />
                           </button>
                           <span className="w-8 text-center font-bold text-[var(--brand-blue)]">{cart[item.id]}</span>
                           <button 
                             onClick={() => addToCart(item.id)}
                             className="w-10 h-10 rounded-xl bg-[var(--brand-blue)] flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
                           >
                              <Plus className="w-4 h-4" />
                           </button>
                         </>
                       ) : (
                         <button 
                            onClick={() => addToCart(item.id)}
                            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-[var(--brand-orange)] transition-colors flex items-center gap-2"
                         >
                            Add to Cart <Plus className="w-3 h-3" />
                         </button>
                       )}
                    </div>
                 </div>
             </motion.div>
           ))}
        </div>

        {/* Info Strip */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-slate-900 rounded-[3rem] p-12 text-white">
              <h3 className="text-3xl font-bold mb-8 italic uppercase tracking-tighter">Material <span className="text-[var(--brand-orange)]">Guidelines</span></h3>
              <div className="space-y-6">
                 {[
                   "Always use double-walled boxes for international shipping.",
                   "Label every box and barrel with name and destination phone.",
                   "Do not exceed weight limits (max 30kg per standard box).",
                   "Seal barrels with professional clamps (provided upon request)."
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <p className="text-blue-100 text-sm italic">{tip}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[3rem] p-12 border border-slate-100 flex flex-col justify-center text-center">
              <h3 className="text-2xl font-bold text-[var(--brand-blue)] mb-4">Bulk Orders for Businesses?</h3>
              <p className="text-slate-500 mb-10 italic">We provide discounted rates for monthly contracts and large quantities of shipping materials.</p>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 text-[var(--brand-orange)] font-bold hover:gap-4 transition-all">
                 Request Business Pricing <ArrowRight className="w-5 h-5" />
              </Link>
           </div>
        </div>
      </div>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-[var(--brand-blue)]" />
                  <h3 className="text-xl font-bold text-slate-800">Your Cargo Basket</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {Object.entries(cart).length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium italic">Your basket is empty.</p>
                  </div>
                ) : (
                  Object.entries(cart).map(([id, qty]) => {
                    const product = products.find(p => p.id === Number(id));
                    if (!product) return null;
                    return (
                      <div key={id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <product.icon className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{product.name}</h4>
                          <p className="text-xs text-slate-400 mb-3">{product.price} each</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm hover:bg-slate-100">-</button>
                              <span className="text-sm font-bold">{qty}</span>
                              <button onClick={() => addToCart(product.id)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm hover:bg-slate-100">+</button>
                            </div>
                            <button onClick={() => deleteItem(product.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 font-bold text-xs uppercase uppercase">Subtotal</span>
                  <span className="text-2xl font-black text-slate-800">£{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic mb-4">Final prices will be confirmed upon collection. Taxes included where applicable.</p>
                <button 
                  disabled={cartCount === 0}
                  onClick={() => setIsCheckedOut(true)}
                  className="w-full btn-primary py-5 text-lg shadow-xl shadow-orange-500/20 disabled:grayscale disabled:opacity-50 transition-all font-black uppercase tracking-tight"
                >
                  Confirm Material Request
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Success Modal */}
      <AnimatePresence>
        {isCheckedOut && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--brand-blue)]/95 flex items-center justify-center p-6 text-white text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md"
            >
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-white/5">
                <CheckCircle2 className="w-12 h-12 text-[var(--brand-orange)]" />
              </div>
              <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter">Ready for <span className="text-[var(--brand-orange)]">Pickup</span></h2>
              <p className="text-blue-100 text-lg mb-12 leading-relaxed font-medium">
                Materials requested! We will bring these items with us on our next scheduled collection at your address.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setIsCheckedOut(false);
                    setIsCartOpen(false);
                    setCart({});
                  }}
                  className="w-full bg-white text-[var(--brand-blue)] py-5 rounded-[2rem] font-black uppercase text-xl hover:bg-[var(--brand-orange)] hover:text-white transition-all shadow-2xl"
                >
                  Got it, Thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
