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
  X
} from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES, ITEMS, SERVICE_PLANS, SERVICE_FEATURES } from './constants';
import StripePayment from '@/components/StripePayment';

export default function BookingPage() {
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
    dates: { collection: '30 Mar 2026', delivery: '31 Mar 2026' }
  });

  const [dynamicPlans, setDynamicPlans] = useState(SERVICE_PLANS);

  // Load plans from localStorage if admin changed them
  useEffect(() => {
    const savedPlans = localStorage.getItem('ts_service_plans');
    if (savedPlans) {
      setDynamicPlans(JSON.parse(savedPlans));
    }
  }, []);

  const [submitted, setSubmitted] = useState(false);

  // Derived Values
  const selectedItemsCount = useMemo(() => formData.items.reduce((acc, i) => acc + i.quantity, 0), [formData.items]);
  const baseItemsPrice = useMemo(() => formData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0), [formData.items]);
  const currentPlan = useMemo(() => dynamicPlans.find(p => p.id === formData.planId) || dynamicPlans[0], [formData.planId, dynamicPlans]);
  
  const totalAmount = baseItemsPrice + currentPlan.surcharge;

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

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
                 
                 {/* STEP 1: SIMPLE ADDRESSES */}
                 {step === 1 && (
                   <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 space-y-12">
                         <div className="text-center space-y-2 mb-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Get a <span className="text-[var(--brand-orange)]">Quick Quote</span></h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Where should we pick up and deliver?</p>
                         </div>
                         <div className="grid grid-cols-1 gap-10">
                            <div className="relative group">
                               <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[var(--brand-orange)] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-2">Pickup Address</label>
                               <div className="relative">
                                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                  <input 
                                    type="text" 
                                    placeholder="Enter full pickup address (Street, City, Postcode)" 
                                    value={formData.collection.address} 
                                    onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, address: e.target.value } }))} 
                                    className="input-booking py-6 pl-16 text-lg" 
                                  />
                               </div>
                            </div>
                            <div className="relative group">
                               <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[var(--brand-blue)] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-2">Delivery Destination</label>
                               <div className="relative">
                                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                                  <input 
                                    type="text" 
                                    placeholder="Enter full delivery address (Street, City, Postcode)" 
                                    value={formData.delivery.address} 
                                    onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, address: e.target.value } }))} 
                                    className="input-booking py-6 pl-16 text-lg" 
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 2: CHOOSE PACKAGE (ITEM PICKER) */}
                 {step === 2 && (
                   <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[700px]">
                         <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2 overflow-y-auto">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 italic">Item Categories</h3>
                            {CATEGORIES.map(cat => (
                              <button 
                                key={cat.id} 
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${activeCategory === cat.id ? 'bg-white shadow-xl shadow-slate-200 border border-slate-100 text-[var(--brand-blue)]' : 'text-slate-400 hover:bg-white/50'}`}
                              >
                                 <cat.icon className={`w-7 h-7 ${activeCategory === cat.id ? 'text-[var(--brand-orange)]' : 'opacity-40'}`} />
                                 <span className="text-[10px] font-extrabold uppercase text-center">{cat.name}</span>
                              </button>
                            ))}
                         </div>
                         <div className="flex-grow flex flex-col p-8">
                            <div className="relative mb-8">
                               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                               <input type="text" placeholder="Search packages (Barrel, Box, Sofa...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold" />
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                               {filteredItems.map(item => (
                                 <div key={item.id} className="group flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-50 hover:border-slate-200 hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center transition-colors">
                                          <Package className="w-6 h-6 text-slate-300 group-hover:text-[var(--brand-blue)]" />
                                       </div>
                                       <span className="font-bold text-slate-700 italic">{item.name}</span>
                                    </div>
                                    <button onClick={() => addItem(item)} className="bg-[var(--brand-orange)] text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Add to Cart</button>
                                 </div>
                               ))}
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
                         <section>
                            <h3 className="text-xl font-black text-[var(--brand-blue)] mb-8 flex items-center gap-3 italic uppercase tracking-tighter"><User className="w-7 h-7 text-[var(--brand-orange)]" /> Sender (Remitente)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <input type="text" placeholder="Full name" value={formData.customer.name} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, name: e.target.value }, collection: { ...p.collection, name: e.target.value } }))} className="input-booking" />
                               <input type="text" placeholder="Phone of Sender" value={formData.customer.phone} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, phone: e.target.value }, collection: { ...p.collection, phone: e.target.value } }))} className="input-booking" />
                            </div>
                         </section>
                         <section className="pt-8 border-t border-slate-100">
                            <h3 className="text-xl font-black text-[var(--brand-blue)] mb-8 flex items-center gap-3 italic uppercase tracking-tighter"><User className="w-7 h-7 text-[var(--brand-blue)]" /> Beneficiary (Destinatario)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <input type="text" placeholder="Beneficiary Full Name" value={formData.delivery.name} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, name: e.target.value } }))} className="input-booking" />
                               <input type="text" placeholder="Beneficiary Phone" value={formData.delivery.phone} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, phone: e.target.value } }))} className="input-booking" />
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
                                  <div className="space-y-4">
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
                       <StripePayment amount={totalAmount} onSuccess={() => setSubmitted(true)} onCancel={prevStep} />
                    </motion.div>
                 )}

              </AnimatePresence>

              {/* Controls */}
              {step < 6 && (
                 <div className="flex justify-between items-center px-4 mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white">
                    <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 invisible' : 'text-slate-400 hover:text-[var(--brand-blue)]'}`}><ArrowLeft className="w-4 h-4" /> Previous</button>
                    <button 
                      onClick={nextStep} 
                      className="btn-primary px-16 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-orange-500/10 active:scale-95 transition-all"
                    >
                      {step === 1 ? 'Get Quote' : step === 5 ? 'Proceed to Payment' : 'Continue'} <ArrowRight className="w-5 h-5" />
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

      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-12 text-center">
           <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md">
              <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/20"><CheckCircle2 className="w-16 h-16" /></div>
              <h2 className="text-5xl font-black text-[var(--brand-blue)] mb-6 italic uppercase tracking-tighter leading-none">Booking <br /><span className="text-[var(--brand-orange)] font-black italic">Successful!</span></h2>
              <p className="text-slate-500 text-lg mb-12 font-medium italic">Our global team in UK/DR has received your order. We'll be in touch within 30 mins to confirm pickup.</p>
              <Link href="/" className="btn-primary px-16 py-5 rounded-[2rem] text-xl block shadow-2xl uppercase italic tracking-tighter">Proceed to Dashboard</Link>
           </motion.div>
        </motion.div>
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
