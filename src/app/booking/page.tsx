'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Calendar,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Info,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Check,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES, ITEMS, SERVICE_PLANS, SERVICE_FEATURES } from './constants';
import StripePayment from '@/components/StripePayment';
import BookingEmailPreview from '@/components/BookingEmailPreview';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function BookingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    customer: { name: '', email: '', phone: '' },
    collection: {
      name: '', email: '', phone: '', address: '', notes: '', isSameAsCustomer: false,
      parking: 'NO', floor: 'Door', steps: 'NO'
    },
    delivery: {
      name: '', email: '', phone: '', address: '', notes: '', isSameAsCustomer: false,
      parking: 'NO', floor: 'Door', steps: 'NO'
    },
    items: [] as { id: string, name: string, quantity: number, price: number }[],
    planId: 'standard',
    dates: { collection: '', delivery: '' }
  });

  const [dynamicPlans, setDynamicPlans] = useState(SERVICE_PLANS);

  // Pre-fill customer info if user is logged in as CUSTOMER
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      setFormData(prev => ({
        ...prev,
        customer: {
          name:  prev.customer.name  || user.name  || '',
          email: prev.customer.email || user.email || '',
          phone: prev.customer.phone || '',
        },
      }));
    }
  }, [user]);

  useEffect(() => {
    supabase.from('plan_settings').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setDynamicPlans(prev => prev.map(plan => {
          const override = (data as { id: string; surcharge: number }[]).find(d => d.id === plan.id);
          return override ? { ...plan, surcharge: override.surcharge } : plan;
        }));
      }
    });
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [showPrintLabel, setShowPrintLabel] = useState(false);

  // Generate next available collection dates (Sundays=0 and Thursdays=4)
  const availablePickupDates = useMemo(() => {
    const dates: { label: string; day: string; value: string }[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 2); // min 2 days advance
    while (dates.length < 6) {
      const dow = d.getDay();
      if (dow === 0 || dow === 4) {
        dates.push({
          label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
          day:   d.toLocaleDateString('en-GB', { weekday: 'long' }),
          value: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, []);

  const printLabel = () => {
    const trackUrl = `${window.location.origin}/track?id=${trackingId}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackUrl)}&margin=4`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Shipping Label - ${trackingId}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f5; }
      .label { border: 3px solid #000; padding: 20px; max-width: 480px; margin: 0 auto; background: #fff; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 14px; }
      .logo { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
      .logo span { color: #E85D04; }
      .tracking-block { text-align: right; }
      .tracking-id { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
      .route { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 12px; }
      .sm { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 2px; }
      .val { font-size: 13px; font-weight: 700; }
      .sub { font-size: 10px; color: #666; margin-top: 2px; }
      .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 12px; }
      .bottom { display: flex; justify-content: space-between; align-items: center; }
      .bottom-info { flex: 1; }
    </style></head><body>
    <div class="label">
      <div class="header">
        <div class="logo">TS <span>Couriers</span><br><span style="font-size:9px;font-weight:600;letter-spacing:2px;color:#666;">GLOBAL LOGISTICS</span></div>
        <div class="tracking-block">
          <div class="sm">Tracking ID</div>
          <div class="tracking-id">${trackingId}</div>
        </div>
      </div>
      <div class="route">
        <div>
          <div class="sm">From (Sender)</div>
          <div class="val">${formData.customer.name || 'N/A'}</div>
          <div class="sub">${formData.collection.address}</div>
          <div class="sub">${formData.customer.phone}</div>
        </div>
        <div style="border-left:1px solid #ddd; padding-left:12px;">
          <div class="sm">To (Beneficiary)</div>
          <div class="val">${formData.delivery.name || 'N/A'}</div>
          <div class="sub">${formData.delivery.address}</div>
          <div class="sub">${formData.delivery.phone}</div>
        </div>
      </div>
      <div class="details">
        <div>
          <div class="sm">Collection Date</div>
          <div class="val">${formData.dates.collection || 'TBC'}</div>
        </div>
        <div>
          <div class="sm">Service Plan</div>
          <div class="val">${currentPlan.name}</div>
        </div>
        <div style="grid-column:span 2;">
          <div class="sm">Contents</div>
          <div class="val">${formData.items.map(i => `${i.quantity}x ${i.name}`).join(' · ') || 'General Cargo'}</div>
        </div>
        <div>
          <div class="sm">Total</div>
          <div class="val" style="color:#E85D04;">£${totalAmount.toFixed(2)}</div>
        </div>
      </div>
      <div class="bottom">
        <div class="bottom-info">
          <div class="sm">Scan to Track</div>
          <div style="font-size:9px;color:#666;margin-top:2px;">${trackUrl}</div>
          <div style="margin-top:8px;font-size:8px;color:#aaa;">Printed: ${new Date().toLocaleString()}</div>
        </div>
        <img src="${qrSrc}" width="100" height="100" style="border:2px solid #000;padding:2px;" alt="QR" />
      </div>
    </div>
    <script>
      document.querySelector('img').onload = () => window.print();
      setTimeout(() => window.print(), 2500);
    </script></body></html>`);
    win.document.close();
  };

  const saveBookingToSupabase = async () => {
    const id = `TS-${Date.now().toString().slice(-6)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const itemType = formData.items.length === 1 ? formData.items[0].name : formData.items.length > 1 ? 'Mixed Cargo' : 'General';

    // Use auth user's email first (ensures booking appears in customer portal)
    const resolvedEmail = (user?.role === 'CUSTOMER' ? user.email : null)
      || formData.customer.email
      || null;

    // metadata stores extra fields that may not exist as columns
    const bookingMeta = {
      customer_phone: formData.customer.phone || null,
      plan_id: formData.planId,
      items: formData.items,
      collection_notes: formData.collection.notes || null,
      delivery_notes: formData.delivery.notes || null,
      delivery_name: formData.delivery.name || null,
      delivery_phone: formData.delivery.phone || null,
      collection_parking: formData.collection.parking,
      delivery_floor: formData.delivery.floor,
    };

    try {
      await Promise.all([
        supabase.from('bookings').insert({
          id,
          customer: formData.customer.name || user?.name || 'Guest',
          customer_email: resolvedEmail,
          route: `${formData.collection.address?.split(',')[0] || 'Origin'} → ${formData.delivery.address?.split(',')[0] || 'Destination'}`,
          date: formData.dates.collection || today,
          status: 'Pending Pickup',
          type: itemType,
          collection_address: formData.collection.address,
          delivery_address: formData.delivery.address,
          total_amount: totalAmount,
        }),
        supabase.from('shipments').insert({
          id: `SHP-${Date.now().toString().slice(-6)}`,
          customer: formData.customer.name || user?.name || 'Guest',
          destination: formData.delivery.address?.split(',')[0] || 'International',
          origin: formData.collection.address?.split(',')[0] || 'London',
          type: itemType,
          weight: `${formData.items.reduce((a, i) => a + i.quantity, 0)} items`,
          status: 'Pending Pickup',
          date: today,
          metadata: {
            ...bookingMeta,
            booking_id: id,
            customer_email: resolvedEmail,
          },
        }),
      ]);
    } catch (err) {
      console.error('Booking save error:', err);
      // Continue anyway — show success to user even if DB insert failed
    }

    setTrackingId(id);
    return id;
  };

  // Derived Values
  const selectedItemsCount = useMemo(() => formData.items.reduce((acc, i) => acc + i.quantity, 0), [formData.items]);
  const baseItemsPrice = useMemo(() => formData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0), [formData.items]);
  const currentPlan = useMemo(() => dynamicPlans.find(p => p.id === formData.planId) || dynamicPlans[0], [formData.planId, dynamicPlans]);
  
  const totalAmount = baseItemsPrice + currentPlan.surcharge;

  const nextStep = () => { setStep(s => Math.min(s + 1, 6)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const prevStep = () => { setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const addItem = (item: typeof ITEMS[0]) => {
    setFormData(prev => {
      const existing = prev.items.find(i => i.id === item.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        };
      }
      return {
        ...prev,
        items: [...prev.items, { id: item.id, name: item.name, quantity: 1, price: item.basePrice }]
      };
    });
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const handleSameAsCustomer = (type: 'collection' | 'delivery') => {
    setFormData(prev => {
      const isSame = !prev[type].isSameAsCustomer;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          isSameAsCustomer: isSame,
          name: isSame ? prev.customer.name : '',
          email: isSame ? prev.customer.email : '',
          phone: isSame ? prev.customer.phone : '',
        }
      };
    });
  };

  const filteredItems = ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen pt-24 pb-20 bg-[#fbfbfb]">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Progress Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[var(--brand-blue)] rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Truck className="w-6 h-6" />
               </div>
               <div>
                  <h1 className="text-2xl font-black text-[var(--brand-blue)] tracking-tight">Booking <span className="text-[var(--brand-orange)]">Assistant</span></h1>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Process your shipment in 6 steps</p>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= i ? 'bg-[var(--brand-orange)] text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                        {step > i ? <CheckCircle2 className="w-4 h-4" /> : i === 6 ? <CreditCard className="w-3.5 h-3.5" /> : i}
                     </div>
                     {i < 6 && <div className={`w-4 h-0.5 rounded-full ${step > i ? 'bg-[var(--brand-orange)]' : 'bg-slate-100'}`} />}
                  </div>
               ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           <div className="lg:col-span-8 space-y-8">
              <AnimatePresence mode="wait">
                 
                 {/* STEP 1: ADDRESSES */}
                 {step === 1 && (
                   <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 space-y-10">
                         <div className="text-center space-y-2 mb-2">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Book Your <span className="text-[var(--brand-orange)]">Collection</span></h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter postcode or city — we handle the rest.</p>
                         </div>
                         <div className="grid grid-cols-1 gap-8">
                            <div className="relative group">
                               <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[var(--brand-orange)] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-2">Collection Postcode / Address</label>
                               <div className="relative">
                                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                  <input type="text" placeholder="e.g. E1 6RF or 14 High Street, London" value={formData.collection.address} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, address: e.target.value } }))} className="input-booking py-6 pl-16 text-lg" />
                               </div>
                            </div>
                            <div className="relative group">
                               <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[var(--brand-blue)] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-2">Delivery Postcode / City</label>
                               <div className="relative">
                                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                  <input type="text" placeholder="City, postcode or country — any destination" value={formData.delivery.address} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, address: e.target.value } }))} className="input-booking py-6 pl-16 text-lg" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 2: CHOOSE PACKAGE (ITEM PICKER) */}
                 {step === 2 && (
                   <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row md:h-[700px]">

                         {/* Categories — horizontal scroll on mobile, vertical sidebar on desktop */}
                         <div className="md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-6 md:overflow-y-auto flex-shrink-0">
                            <h3 className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 italic">Item Categories</h3>
                            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 md:space-y-2 scrollbar-hide">
                              {CATEGORIES.map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => setActiveCategory(cat.id)}
                                  className={`flex-shrink-0 flex md:flex-col items-center gap-2 md:gap-3 px-3 py-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all ${activeCategory === cat.id ? 'bg-white shadow-lg border border-slate-100 text-[var(--brand-blue)]' : 'text-slate-400 hover:bg-white/70'}`}
                                >
                                  <cat.icon className={`w-5 h-5 md:w-7 md:h-7 flex-shrink-0 ${activeCategory === cat.id ? 'text-[var(--brand-orange)]' : 'opacity-40'}`} />
                                  <span className="text-[9px] md:text-[10px] font-extrabold uppercase text-center whitespace-nowrap">{cat.name}</span>
                                </button>
                              ))}
                            </div>
                         </div>

                         <div className="flex-grow flex flex-col p-5 md:p-8">
                            <div className="relative mb-5 md:mb-8">
                               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                               <input type="text" placeholder="Search packages (Barrel, Box, Sofa...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-sm" />
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[320px] md:min-h-0">
                               {filteredItems.map(item => {
                                  const cartItem = formData.items.find(i => i.id === item.id);
                                  return (
                                 <div key={item.id} className={`group flex items-center justify-between p-5 rounded-3xl border transition-all ${cartItem ? 'bg-orange-50 border-orange-200 shadow-md' : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-lg'}`}>
                                    <div className="flex items-center gap-4">
                                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${cartItem ? 'bg-[var(--brand-orange)]' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                                          <Package className={`w-6 h-6 ${cartItem ? 'text-white' : 'text-slate-300 group-hover:text-[var(--brand-blue)]'}`} />
                                       </div>
                                       <div>
                                          <span className="font-bold text-slate-700 italic block">{item.name}</span>
                                          <span className="text-[11px] font-black text-emerald-600">£{item.basePrice.toFixed(2)}</span>
                                       </div>
                                    </div>
                                    {cartItem ? (
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => {
                                          if (cartItem.quantity <= 1) { removeItem(item.id); }
                                          else { setFormData(prev => ({ ...prev, items: prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i) })); }
                                        }} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100">
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-6 text-center font-black text-slate-900">{cartItem.quantity}</span>
                                        <button onClick={() => addItem(item)} className="w-8 h-8 bg-[var(--brand-orange)] text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all">
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button onClick={() => addItem(item)} className="bg-[var(--brand-orange)] text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Add to Cart</button>
                                    )}
                                 </div>
                                  );
                               })}
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 3: SENDER & BENEFICIARY DATA */}
                 {step === 3 && (
                   <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 space-y-12">
                         <div className="text-center mb-8">
                             <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Contact <span className="text-[var(--brand-orange)]">Information</span></h2>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Required for global customs and delivery tracking.</p>
                         </div>

                         {/* ── Sender ── */}
                         <section>
                            <h3 className="text-xl font-black text-[var(--brand-blue)] mb-6 flex items-center gap-3 italic uppercase tracking-tighter"><User className="w-7 h-7 text-[var(--brand-orange)]" /> Sender</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <input type="text" placeholder="Full name *" value={formData.customer.name} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, name: e.target.value }, collection: { ...p.collection, name: e.target.value } }))} className="input-booking" />
                               <input type="text" placeholder="Phone *" value={formData.customer.phone} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, phone: e.target.value }, collection: { ...p.collection, phone: e.target.value } }))} className="input-booking" />
                               <input type="email" placeholder="Email address" value={formData.customer.email} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, email: e.target.value }, collection: { ...p.collection, email: e.target.value } }))} className="input-booking md:col-span-2" />
                            </div>
                            {/* Collection address — editable copy of Step 1 */}
                            <div className="mt-6">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                 <MapPin className="w-3 h-3 text-[var(--brand-orange)]" /> Collection Address
                                 {!formData.collection.address && <span className="text-red-400 normal-case font-bold text-[9px]">— enter from Step 1 or correct here</span>}
                               </label>
                               <div className="relative">
                                 <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                 <input type="text" placeholder="e.g. E1 6RF or 14 High Street, London" value={formData.collection.address} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, address: e.target.value } }))} className="input-booking pl-14" />
                               </div>
                            </div>
                            <div className="mt-4">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notes for Driver (Pickup)</label>
                               <input type="text" placeholder="Gate code, buzzer, special instructions..." value={formData.collection.notes} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, notes: e.target.value } }))} className="input-booking" />
                            </div>
                         </section>

                         {/* ── Recipient ── */}
                         <section className="pt-8 border-t border-slate-100">
                            <h3 className="text-xl font-black text-[var(--brand-blue)] mb-6 flex items-center gap-3 italic uppercase tracking-tighter"><User className="w-7 h-7 text-[var(--brand-blue)]" /> Recipient</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <input type="text" placeholder="Recipient Full Name *" value={formData.delivery.name} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, name: e.target.value } }))} className="input-booking" />
                               <input type="text" placeholder="Recipient Phone *" value={formData.delivery.phone} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, phone: e.target.value } }))} className="input-booking" />
                               <input type="email" placeholder="Recipient Email" value={formData.delivery.email} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, email: e.target.value } }))} className="input-booking md:col-span-2" />
                            </div>
                            {/* Delivery address — editable copy of Step 1 */}
                            <div className="mt-6">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                 <MapPin className="w-3 h-3 text-[var(--brand-blue)]" /> Delivery Address
                                 {!formData.delivery.address && <span className="text-red-400 normal-case font-bold text-[9px]">— enter from Step 1 or correct here</span>}
                               </label>
                               <div className="relative">
                                 <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                 <input type="text" placeholder="City, postcode or country — any destination" value={formData.delivery.address} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, address: e.target.value } }))} className="input-booking pl-14" />
                               </div>
                            </div>
                            <div className="mt-4">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notes for Driver (Delivery)</label>
                               <input type="text" placeholder="Address details, contact at destination..." value={formData.delivery.notes} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, notes: e.target.value } }))} className="input-booking" />
                            </div>
                         </section>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 4: LOGISTICS SETUP */}
                 {step === 4 && (
                   <motion.div key="s4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12">
                         <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Support at <span className="text-[var(--brand-orange)]">Location</span></h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Help our drivers plan your pickup and delivery.</p>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                               <h4 className="text-xl font-black text-[var(--brand-blue)] flex items-center gap-3 italic uppercase tracking-tighter"><Truck className="w-5 h-5 text-[var(--brand-orange)]" /> Origin (Pickup)</h4>
                               <div className="bg-slate-50 p-8 rounded-3xl space-y-6">
                                  {/* Collection date */}
                                  <div className="space-y-3">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><Calendar className="w-3 h-3" /> Collection Date <span className="text-slate-300">· Sun & Thu</span></p>
                                     <div className="grid grid-cols-2 gap-2">
                                        {availablePickupDates.map(d => (
                                           <button key={d.value} type="button" onClick={() => setFormData(p => ({ ...p, dates: { ...p.dates, collection: d.value } }))}
                                             className={`p-3 rounded-2xl border-2 text-left transition-all ${formData.dates.collection === d.value ? 'border-[var(--brand-orange)] bg-orange-50' : 'border-white bg-white hover:border-slate-200'}`}>
                                             <p className={`text-[9px] font-black uppercase tracking-widest ${formData.dates.collection === d.value ? 'text-[var(--brand-orange)]' : 'text-slate-400'}`}>{d.day.slice(0, 3)}</p>
                                             <p className={`text-xs font-black ${formData.dates.collection === d.value ? 'text-slate-900' : 'text-slate-600'}`}>{d.label}</p>
                                           </button>
                                        ))}
                                     </div>
                                     {!formData.dates.collection && (
                                        <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Select a date to continue</p>
                                     )}
                                  </div>
                                  <div className="space-y-4 border-t border-slate-200 pt-4">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><Info className="w-3 h-3" /> Parking availability?</p>
                                     <div className="flex flex-wrap gap-2">
                                        {['NO', 'OUTSIDE', 'STREET', 'NEARBY'].map(opt => (
                                           <button key={opt} onClick={() => setFormData(p => ({ ...p, collection: { ...p.collection, parking: opt } }))} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.collection.parking === opt ? 'bg-[var(--brand-blue)] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{opt}</button>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-8">
                               <h4 className="text-xl font-black text-[var(--brand-blue)] flex items-center gap-3 italic uppercase tracking-tighter"><Package className="w-5 h-5 text-[var(--brand-blue)]" /> Destination</h4>
                               <div className="bg-slate-50 p-8 rounded-3xl space-y-6">
                                  <div className="space-y-4">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><Info className="w-3 h-3" /> Delivery Floor?</p>
                                     <div className="flex flex-wrap gap-2">
                                        {['GROUND', '1st FLOOR', 'STAIRS', 'ELEVATOR'].map(opt => (
                                           <button key={opt} onClick={() => setFormData(p => ({ ...p, delivery: { ...p.delivery, floor: opt } }))} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.delivery.floor === opt ? 'bg-[var(--brand-blue)] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{opt}</button>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 5: PLAN SELECTION (Standard/Premium) */}
                 {step === 5 && (
                   <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                      <div className="text-center space-y-4">
                         <h3 className="text-4xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter">Choose Your <span className="text-[var(--brand-orange)]">Service Level</span></h3>
                         <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Standard for economy, Premium for speed and protection.</p>
                      </div>

                      {/* Plan Selection Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto px-10">
                         {dynamicPlans.map(plan => {
                            const total = baseItemsPrice + plan.surcharge;
                            return (
                              <div 
                                key={plan.id} 
                                className={`relative p-12 rounded-[3.5rem] border-4 transition-all cursor-pointer overflow-hidden ${formData.planId === plan.id ? 'border-[var(--brand-orange)] bg-white shadow-2xl scale-105 z-10' : 'border-transparent bg-white/60 hover:border-slate-200'}`}
                                onClick={() => setFormData(p => ({ ...p, planId: plan.id }))}
                              >
                                 <div className="flex justify-between items-start mb-8 text-center flex-col gap-4">
                                    <h4 className="text-2xl font-black text-slate-800 italic uppercase underline decoration-[var(--brand-orange)] decoration-4 underline-offset-8 mx-auto">{plan.name}</h4>
                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all mx-auto ${formData.planId === plan.id ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)] shadow-lg shadow-orange-500/20' : 'border-slate-200'}`}>
                                       {formData.planId === plan.id && <div className="w-4 h-4 rounded-full bg-white" />}
                                    </div>
                                 </div>
                                 <div className="space-y-1 text-center bg-slate-50 py-6 rounded-3xl mb-8">
                                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest italic">Total with Plan</p>
                                    <h5 className="text-5xl font-black text-[var(--brand-blue)] tracking-tight">£{total.toFixed(2)}</h5>
                                 </div>
                                 
                                 <div className="space-y-4 italic px-4">
                                    {Object.entries(plan.details).slice(0, 4).map(([k, v]) => (
                                       <div key={k} className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                                          <span className="text-slate-400 uppercase text-[10px] tracking-tighter">{k}</span>
                                          <span className="text-slate-700 uppercase">{typeof v === 'boolean' ? (v ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-slate-200" />) : v}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                            );
                         })}
                      </div>

                      <div className="text-center pt-8">
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">Prices calculated based on base shipping costs + plan tier level.</p>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 6: SECURE PAYMENT */}
                 {step === 6 && (
                    <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                       <StripePayment
                          amount={totalAmount}
                          onSuccess={async () => {
                             setIsSendingEmail(true);
                             await saveBookingToSupabase();
                             setIsSendingEmail(false);
                             setSubmitted(true);
                          }}
                          onCancel={prevStep}
                       />
                    </motion.div>
                 )}

              </AnimatePresence>

              {/* Controls */}
              {step < 6 && (
                 <div className="flex justify-between items-center px-4 mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white">
                    <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 invisible' : 'text-slate-400 hover:text-[var(--brand-blue)]'}`}><ArrowLeft className="w-4 h-4" /> Previous</button>
                    <button
                      onClick={nextStep}
                      disabled={step === 4 && !formData.dates.collection}
                      className="btn-primary px-16 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-orange-500/10 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {step === 5 ? 'Proceed to Payment' : 'Continue'} <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
              )}
           </div>

           {/* Sidebar: Snapshot Summary */}
           <div className="lg:col-span-4 space-y-8 sticky top-24">
              <div className="bg-[var(--brand-blue)] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -translate-y-12 translate-x-12 rounded-full" />
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 italic"><h3 className="text-xl font-black uppercase tracking-tighter leading-none">Global Booking <br /><span className="text-[var(--brand-orange)]">Snapshot</span></h3><ShoppingCart className="w-6 h-6 text-white/30" /></div>
                    
                    {/* Condensed Address View */}
                    {(formData.collection.address || formData.delivery.address) && (
                      <div className="mb-8 space-y-3 bg-white/5 p-5 rounded-3xl border border-white/5">
                        {formData.collection.address && (
                          <div className="flex items-start gap-4">
                            <div className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center mt-1 shrink-0"><MapPin className="w-3 h-3 text-[var(--brand-orange)]" /></div>
                            <p className="text-[10px] font-bold text-blue-100/70 uppercase leading-relaxed">Origin: {formData.collection.address}</p>
                          </div>
                        )}
                        {formData.delivery.address && (
                          <div className="flex items-start gap-4 pt-2 border-t border-white/5">
                            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-1 shrink-0"><MapPin className="w-3 h-3 text-blue-400" /></div>
                            <p className="text-[10px] font-bold text-blue-100/70 uppercase leading-relaxed">Dest.: {formData.delivery.address}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-grow space-y-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {formData.items.length === 0 ? (
                          <div className="text-center py-10 text-white/20 italic text-sm border-2 border-dashed border-white/10 rounded-3xl">Waiting for pack items...</div>
                       ) : (
                          formData.items.map(item => (
                             <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <div><p className="font-bold text-xs text-blue-50 tracking-tight">{item.name}</p><p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Quantity: {item.quantity}</p></div>
                                <div className="flex items-center gap-4"><span className="font-black text-xs text-blue-100">£{(item.price * item.quantity).toFixed(2)}</span><button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
                             </div>
                          ))
                       )}
                    </div>

                    <div className="space-y-4 pt-10 border-t border-white/10 mt-auto">
                       <div className="flex justify-between items-center text-xs font-bold text-blue-100/40 uppercase tracking-widest italic"><span>Cargo Value</span><span>£{baseItemsPrice.toFixed(2)}</span></div>
                       <div className="flex justify-between items-center text-xs font-bold text-blue-100/40 uppercase tracking-widest italic"><span>Tier Surcharge</span><span>£{currentPlan.surcharge.toFixed(2)}</span></div>
                       <div className="flex justify-between items-center pt-8"><span className="text-2xl font-black italic uppercase tracking-tighter">Grand Total</span><span className="text-4xl font-black text-[var(--brand-orange)] tracking-tight">£{totalAmount.toFixed(2)}</span></div>
                    </div>
                 </div>
              </div>
              
              {/* Trust Badge */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                 <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Secured Logistics</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Full insurance included in premium sea freight voyages.</p>
              </div>
           </div>
        </div>
      </div>

      {(submitted || isSendingEmail) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-12 text-center">
           <AnimatePresence mode="wait">
              {isSendingEmail ? (
                <motion.div key="sending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center gap-6">
                   <div className="relative">
                      <div className="w-20 h-20 border-4 border-slate-100 border-t-[var(--brand-orange)] rounded-full animate-spin" />
                      <Mail className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[var(--brand-blue)]" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">Personalizing Your <span className="text-[var(--brand-orange)]">Confirmation</span></h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Checking logistics availability & sending email...</p>
                   </div>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md">
                   <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/20"><CheckCircle2 className="w-16 h-16" /></div>
                   <h2 className="text-5xl font-black text-[var(--brand-blue)] mb-6 italic uppercase tracking-tighter leading-none">Booking <br /><span className="text-[var(--brand-orange)] font-black italic">Successful!</span></h2>
                   <p className="text-slate-500 text-lg mb-12 font-medium italic">Your order has been secured. A confirmation email has been sent to <span className="text-slate-900 font-bold">{formData.customer.email}</span>.</p>
                   <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setShowReceipt(true)}
                          className="bg-slate-900 text-white py-5 rounded-[2rem] shadow-2xl uppercase italic tracking-tighter hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-sm font-black"
                        >
                          <Mail className="w-5 h-5" /> Digital Receipt
                        </button>
                        <button
                          onClick={printLabel}
                          className="bg-[var(--brand-orange)] text-white py-5 rounded-[2rem] shadow-2xl shadow-orange-500/20 uppercase italic tracking-tighter hover:bg-orange-600 transition-all flex items-center justify-center gap-3 text-sm font-black"
                        >
                          <Package className="w-5 h-5" /> Print Label
                        </button>
                      </div>
                      <Link href="/" className="text-slate-400 font-black uppercase text-xs tracking-widest hover:text-[var(--brand-blue)] transition-colors py-4 text-center">Return to Homepage</Link>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </motion.div>
      )}

      {showReceipt && (
         <BookingEmailPreview
           data={{ ...formData, trackingId }}
           onClose={() => setShowReceipt(false)}
         />
      )}

      <style jsx>{`
        .input-booking { width: 100%; padding: 1rem 1.5rem; border-radius: 1.25rem; background: #f8fafc; border: 1px solid #f1f5f9; outline: none; font-weight: 700; font-size: 0.875rem; transition: all 0.2s; }
        .input-booking:focus { background: #ffffff; border-color: #cbd5e1; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
}
