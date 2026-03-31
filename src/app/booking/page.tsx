'use client';

import { useState, useMemo } from 'react';
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
    planId: 'eco',
    dates: { collection: '30 Mar 2026', delivery: '31 Mar 2026' }
  });

  const [submitted, setSubmitted] = useState(false);

  // Derived Values
  const selectedItemsCount = useMemo(() => formData.items.reduce((acc, i) => acc + i.quantity, 0), [formData.items]);
  const baseItemsPrice = useMemo(() => formData.items.reduce((acc, i) => acc + (i.price * i.quantity), 0), [formData.items]);
  const currentPlan = useMemo(() => SERVICE_PLANS.find(p => p.id === formData.planId) || SERVICE_PLANS[0], [formData.planId]);
  
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

  const updateItemQty = (id: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
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
                  <h1 className="text-2xl font-black text-[var(--brand-blue)] tracking-tight">Booking <span className="text-[var(--brand-orange)]">Pro</span></h1>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Premium Logistics Assistant</p>
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
                 
                 {/* STEP 1: ITEM PICKER */}
                 {step === 1 && (
                   <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[700px]">
                         <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2 overflow-y-auto">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Categories</h3>
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
                               <input type="text" placeholder="Search items to add..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold" />
                            </div>
                            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                               {filteredItems.map(item => (
                                 <div key={item.id} className="group flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-50 hover:border-slate-200 hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center transition-colors">
                                          <Package className="w-6 h-6 text-slate-300 group-hover:text-[var(--brand-blue)]" />
                                       </div>
                                       <span className="font-bold text-slate-700">{item.name}</span>
                                    </div>
                                    <button onClick={() => addItem(item)} className="bg-[var(--brand-orange)] text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Add</button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 2: ADDRESSES & CONTACTS */}
                 {step === 2 && (
                   <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 space-y-12">
                         <section>
                            <h3 className="text-xl font-black text-[var(--brand-blue)] mb-8 flex items-center gap-3"><User className="w-6 h-6 text-[var(--brand-orange)]" /> Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <input type="text" placeholder="Full name" value={formData.customer.name} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, name: e.target.value } }))} className="input-booking" />
                               <input type="email" placeholder="example@mail.com" value={formData.customer.email} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, email: e.target.value } }))} className="input-booking" />
                               <input type="text" placeholder="Phone number" value={formData.customer.phone} onChange={e => setFormData(p => ({ ...p, customer: { ...p.customer, phone: e.target.value } }))} className="input-booking" />
                            </div>
                         </section>
                         <section>
                            <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-black text-[var(--brand-blue)] flex items-center gap-3"><MapPin className="w-6 h-6 text-[var(--brand-orange)]" /> Collection Details</h3><label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="hidden" checked={formData.collection.isSameAsCustomer} onChange={() => handleSameAsCustomer('collection')} /><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.collection.isSameAsCustomer ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)]' : 'border-slate-200'}`}>{formData.collection.isSameAsCustomer && <CheckCircle2 className="w-4 h-4 text-white" />}</div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Same as Customer</span></label></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><input type="text" placeholder="Name" value={formData.collection.name} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, name: e.target.value } }))} className="input-booking" /><input type="email" placeholder="Email" value={formData.collection.email} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, email: e.target.value } }))} className="input-booking" /><input type="text" placeholder="Phone" value={formData.collection.phone} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, phone: e.target.value } }))} className="input-booking" /></div>
                            <input type="text" placeholder="Address..." value={formData.collection.address} onChange={e => setFormData(p => ({ ...p, collection: { ...p.collection, address: e.target.value } }))} className="input-booking w-full" />
                         </section>
                         <section>
                            <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-black text-[var(--brand-blue)] flex items-center gap-3"><MapPin className="w-6 h-6 text-[var(--brand-blue)]" /> Delivery Details</h3><label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="hidden" checked={formData.delivery.isSameAsCustomer} onChange={() => handleSameAsCustomer('delivery')} /><div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.delivery.isSameAsCustomer ? 'bg-[var(--brand-blue)] border-[var(--brand-blue)]' : 'border-slate-200'}`}>{formData.delivery.isSameAsCustomer && <CheckCircle2 className="w-4 h-4 text-white" />}</div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Same as Customer</span></label></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><input type="text" placeholder="Name" value={formData.delivery.name} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, name: e.target.value } }))} className="input-booking" /><input type="email" placeholder="Email" value={formData.delivery.email} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, email: e.target.value } }))} className="input-booking" /><input type="text" placeholder="Phone" value={formData.delivery.phone} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, phone: e.target.value } }))} className="input-booking" /></div>
                            <input type="text" placeholder="Address..." value={formData.delivery.address} onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, address: e.target.value } }))} className="input-booking w-full" />
                         </section>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 3: LOGISTICS */}
                 {step === 3 && (
                   <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12"><div className="grid grid-cols-1 md:grid-cols-2 gap-12"><div className="space-y-8"><h4 className="text-xl font-black text-[var(--brand-blue)] flex items-center gap-3"><Truck className="w-5 h-5 text-[var(--brand-orange)]" /> Collection Setup</h4><div className="bg-slate-50 p-8 rounded-3xl space-y-6"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parking?</p><div className="flex flex-wrap gap-2">{['NO', 'SPACE OUTSIDE', 'ON STREET', 'NEARBY'].map(opt => (<button key={opt} onClick={() => setFormData(p => ({ ...p, collection: { ...p.collection, parking: opt } }))} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.collection.parking === opt ? 'bg-[var(--brand-blue)] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{opt}</button>))}</div></div></div></div><div className="space-y-8"><h4 className="text-xl font-black text-[var(--brand-blue)] flex items-center gap-3"><Package className="w-5 h-5 text-[var(--brand-blue)]" /> Delivery Setup</h4><div className="bg-slate-50 p-8 rounded-3xl space-y-6"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parking?</p><div className="flex flex-wrap gap-2">{['NO', 'SPACE OUTSIDE', 'ON STREET', 'NEARBY'].map(opt => (<button key={opt} onClick={() => setFormData(p => ({ ...p, delivery: { ...p.delivery, parking: opt } }))} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.delivery.parking === opt ? 'bg-[var(--brand-blue)] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{opt}</button>))}</div></div></div></div></div></div>
                   </motion.div>
                 )}

                 {/* STEP 4: SERVICE PLANS (PROOVIA STYLE) */}
                 {step === 4 && (
                   <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                      <div className="text-center space-y-4">
                         <h3 className="text-4xl font-black text-[var(--brand-blue)] italic uppercase tracking-tighter">Select Your <span className="text-[var(--brand-orange)]">Delivery Option</span></h3>
                         <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Premium tailored logistics for your global shipments.</p>
                      </div>

                      {/* Plan Selection Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {SERVICE_PLANS.map(plan => {
                            const total = baseItemsPrice + plan.surcharge;
                            return (
                              <div 
                                key={plan.id} 
                                className={`relative p-10 rounded-[3rem] border-4 transition-all cursor-pointer overflow-hidden ${formData.planId === plan.id ? 'border-[var(--brand-orange)] bg-white shadow-2xl scale-105 z-10' : 'border-transparent bg-white/60 hover:border-slate-200'}`}
                                onClick={() => setFormData(p => ({ ...p, planId: plan.id }))}
                              >
                                 <div className="flex justify-between items-start mb-8">
                                    <h4 className="text-xl font-black text-slate-800 italic uppercase underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4">{plan.name}</h4>
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.planId === plan.id ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)]' : 'border-slate-200'}`}>
                                       {formData.planId === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                    </div>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Price</p>
                                    <h5 className="text-5xl font-black text-[var(--brand-blue)] tracking-tight">£{total.toFixed(2)}</h5>
                                 </div>
                                 
                                 {formData.planId === plan.id && (
                                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                      <CheckCircle2 className="w-4 h-4" /> Selected Plan
                                   </motion.div>
                                 )}
                              </div>
                            );
                         })}
                      </div>

                      {/* Comparison Table */}
                      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden mt-12">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead className="bg-slate-50">
                                  <tr>
                                     <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 italic">Features Comparison</th>
                                     {SERVICE_PLANS.map(plan => (
                                       <th key={plan.id} className={`px-8 py-6 text-center text-sm font-black italic uppercase tracking-tighter border-b ${formData.planId === plan.id ? 'text-[var(--brand-orange)] border-[var(--brand-orange)]/20' : 'text-slate-800 border-slate-100'}`}>
                                          {plan.name}
                                       </th>
                                     ))}
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50 italic">
                                  {SERVICE_FEATURES.map((feature, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                       <td className="px-8 py-5 text-sm font-bold text-slate-600 uppercase tracking-tight">{feature}</td>
                                       {SERVICE_PLANS.map(plan => {
                                          const detail = plan.details[feature as keyof typeof plan.details];
                                          const isBool = typeof detail === 'boolean';
                                          return (
                                            <td key={plan.id} className={`px-8 py-5 text-center text-xs font-black border-l border-slate-50 ${formData.planId === plan.id ? 'bg-orange-50/10 text-slate-900 font-black' : 'text-slate-500'}`}>
                                               {isBool ? (
                                                  detail ? <Check className="w-5 h-5 mx-auto text-emerald-500" /> : <X className="w-5 h-5 mx-auto text-slate-300" />
                                               ) : (
                                                  <span className="uppercase">{detail as string}</span>
                                               )}
                                            </td>
                                          );
                                       })}
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                         <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">All plans include basic insurance and door-to-door tracking as standard.</p>
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {/* STEP 5: FINAL REVIEW */}
                 {step === 5 && (
                    <motion.div key="s5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-slate-100">
                       <div className="w-24 h-24 bg-blue-100 text-[var(--brand-blue)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/10"><ShieldCheck className="w-12 h-12" /></div>
                       <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-4 uppercase italic">Final <span className="text-[var(--brand-orange)]">Review</span></h2>
                       <p className="text-slate-500 max-w-md mx-auto mb-12 font-bold uppercase text-xs tracking-widest leading-relaxed">Review your summary and take the last step: <span className="text-slate-900 font-black">Secure Payment</span>.</p>
                       <button onClick={nextStep} className="btn-primary w-full max-w-sm py-6 text-xl shadow-2xl flex items-center justify-center gap-3">Go to Payment <CreditCard className="w-6 h-6" /></button>
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
              {step < 5 && (
                 <div className="flex justify-between items-center px-4 mt-12">
                    <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 invisible' : 'text-slate-400 hover:text-[var(--brand-blue)]'}`}><ArrowLeft className="w-4 h-4" /> Previous</button>
                    <button onClick={nextStep} className="btn-primary px-16 py-4 rounded-2xl flex items-center gap-3 shadow-xl">Continue <ArrowRight className="w-5 h-5" /></button>
                 </div>
              )}
           </div>

           {/* Sidebar: Summary & Extras */}
           <div className="lg:col-span-4 space-y-8 sticky top-24">
              <div className="bg-[var(--brand-blue)] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -translate-y-12 translate-x-12 rounded-full" />
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6"><h3 className="text-xl font-black uppercase tracking-tight">Order <span className="text-[var(--brand-orange)]">Summary</span></h3><ShoppingCart className="w-6 h-6 text-white/30" /></div>
                    <div className="flex-grow space-y-6 mb-10">{formData.items.length === 0 ? (<div className="text-center py-10 text-white/30 italic text-sm">No items added</div>) : (formData.items.map(item => (<div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors"><div><p className="font-bold text-sm text-blue-50">{item.name}</p><p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Qty: {item.quantity}</p></div><div className="flex items-center gap-4"><span className="font-black text-blue-100">£{(item.price * item.quantity).toFixed(2)}</span><button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div></div>)))}</div>
                    <div className="space-y-4 pt-10 border-t border-white/10">
                       <div className="flex justify-between items-center text-xs font-bold text-blue-100/50 uppercase tracking-widest"><span>Items Subtotal</span><span>£{baseItemsPrice.toFixed(2)}</span></div>
                       <div className="flex justify-between items-center text-xs font-bold text-blue-100/50 uppercase tracking-widest"><span>{currentPlan.name} Surcharge</span><span>£{currentPlan.surcharge.toFixed(2)}</span></div>
                       <div className="flex justify-between items-center pt-6"><span className="text-2xl font-black italic uppercase tracking-tighter">Total Amount</span><span className="text-4xl font-black text-[var(--brand-orange)] tracking-tight">£{totalAmount.toFixed(2)}</span></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-12 text-center">
           <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md">
              <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/20"><CheckCircle2 className="w-16 h-16" /></div>
              <h2 className="text-5xl font-black text-[var(--brand-blue)] mb-6 italic uppercase tracking-tighter">Booking <br /><span className="text-[var(--brand-orange)] font-black">Success!</span></h2>
              <p className="text-slate-500 text-lg mb-12 font-medium">Your request has been received. Our team will bring your items to life. Expect a call shortly.</p>
              <Link href="/" className="btn-primary px-16 py-5 rounded-[2rem] text-xl block shadow-2xl">Return to Homepage</Link>
           </motion.div>
        </motion.div>
      )}

      <style jsx>{`
        .input-booking { width: 100%; padding: 1rem 1.5rem; border-radius: 1.25rem; background: #f8fafc; border: 1px solid #f1f5f9; outline: none; font-weight: 700; font-size: 0.875rem; transition: all 0.2s; }
        .input-booking:focus { background: #ffffff; border-color: #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
}
