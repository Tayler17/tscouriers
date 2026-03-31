'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck, 
  Calendar, 
  User, 
  CheckCircle2, 
  Box, 
  Archive, 
  Layout, 
  HardDrive,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const packageTypes = [
  { id: 'box', name: 'Boxes', icon: Box },
  { id: 'barrel', name: 'Barrels', icon: Archive },
  { id: 'furniture', name: 'Furniture / Fixtures', icon: Layout },
  { id: 'appliances', name: 'Household Appliances', icon: HardDrive },
  { id: 'pallet', name: 'Pallet', icon: Package },
  { id: 'full-van', name: 'Full Van', icon: Truck },
  { id: 'container', name: 'Full Container', icon: Ship }, // Importing Ship here or using fallback
  { id: 'other', name: 'Others', icon: Package },
];

// Fallback Ship icon since it might not be imported
function Ship(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    >
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M19.38 20.51a11.5 11.5 0 0 0-14.76 0" />
      <path d="M4 11V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      <path d="M5 11v-1a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1" />
      <path d="M12 7V4" />
      <path d="M8 7V5" />
      <path d="M16 7V5" />
    </svg>
  );
}

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    packageType: '',
    quantity: 1,
    weight: '',
    dimensions: '',
    pickupDate: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    if (step === 1) return formData.origin && formData.destination;
    if (step === 2) return formData.packageType;
    if (step === 3) return formData.weight;
    if (step === 4) return true; // Optional notes/date for now
    return false;
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
             {['Route', 'Cargo', 'Details', 'Preferences', 'Contact'].map((label, i) => (
               <div key={i} className="flex flex-col items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[var(--brand-blue)] text-white scale-125' : 'bg-slate-200 text-slate-500'}`}>
                    {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                 </div>
                 <span className={`text-[10px] uppercase tracking-tighter font-bold ${step === i + 1 ? 'text-[var(--brand-blue)]' : 'text-slate-400'}`}>{label}</span>
               </div>
             ))}
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-blue-500" 
               initial={{ width: '0%' }}
               animate={{ width: `${(step / 5) * 100}%` }}
             />
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
          
          <div className="p-8 md:p-12 flex-grow">
            <AnimatePresence mode="wait">
              {/* STEP 1: Route */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-2">Where is it going?</h2>
                    <p className="text-slate-500 italic">Select your collection and delivery locations.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 font-bold text-slate-700 ml-1">
                        <MapPin className="w-4 h-4 text-[var(--brand-orange)]" /> Collection (From)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: London, UK"
                        value={formData.origin}
                        onChange={(e) => updateForm('origin', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 font-bold text-slate-700 ml-1">
                        <MapPin className="w-4 h-4 text-[var(--brand-blue)]" /> Delivery (To)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Santo Domingo, DR"
                        value={formData.destination}
                        onChange={(e) => updateForm('destination', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Package Type */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-2">What are you sending?</h2>
                    <p className="text-slate-500 italic">Select the item type that best describes your cargo.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {packageTypes.map((pkg) => (
                      <button 
                        key={pkg.id}
                        onClick={() => updateForm('packageType', pkg.id)}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.packageType === pkg.id ? 'border-[var(--brand-orange)] bg-orange-50 text-[var(--brand-orange)]' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        <pkg.icon className={`w-8 h-8 ${formData.packageType === pkg.id ? 'text-[var(--brand-orange)]' : 'text-slate-300'}`} />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">{pkg.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Details */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-2">Cargo Details</h2>
                    <p className="text-slate-500 italic">Provide estimated weight and dimensions if possible.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="font-bold text-slate-700 ml-1">Estimated Weight (kg)</label>
                       <input 
                        type="text" 
                        placeholder="Ex: 50kg" 
                        value={formData.weight}
                        onChange={(e) => updateForm('weight', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="font-bold text-slate-700 ml-1">Quantity / Count</label>
                       <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
                          <button onClick={() => updateForm('quantity', Math.max(1, formData.quantity - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold">-</button>
                          <span className="flex-grow text-center font-extrabold text-xl font-mono">{formData.quantity}</span>
                          <button onClick={() => updateForm('quantity', formData.quantity + 1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold">+</button>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <label className="font-bold text-slate-700 ml-1">Dimensions / Cubic Meters (Optional)</label>
                     <input 
                      type="text" 
                      placeholder="Ex: 1m x 1.2m x 0.8m or 1.2 CBM" 
                      value={formData.dimensions}
                      onChange={(e) => updateForm('dimensions', e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" 
                     />
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Preferences */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-2">Pickup & Notes</h2>
                    <p className="text-slate-500 italic">When should we collect? Any special handling required?</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-center mb-6">
                     <Calendar className="w-8 h-8 text-[var(--brand-blue)] shrink-0" />
                     <p className="text-sm text-blue-800 font-medium">Note: Our main collection day in London is <strong>Sunday</strong>. We will confirm your slot after the quote is processed.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="font-bold text-slate-700 ml-1">Notes / Special Instructions</label>
                       <textarea 
                        rows={4} 
                        placeholder="Fragile items, restricted access, etc." 
                        value={formData.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none resize-none"
                       />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Contact */}
              {step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 text-center"
                >
                  <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-[var(--brand-blue)] mb-2">Ready to Send</h2>
                    <p className="text-slate-500 italic">Enter your details and our team will provide a custom quote within 24 hours.</p>
                  </div>
                  <div className="space-y-4 max-w-sm mx-auto">
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input 
                         type="text" 
                         placeholder="Your Name" 
                         value={formData.name}
                         onChange={(e) => updateForm('name', e.target.value)}
                         className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" 
                       />
                    </div>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input 
                         type="text" 
                         placeholder="Phone Number" 
                         value={formData.phone}
                         onChange={(e) => updateForm('phone', e.target.value)}
                         className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" 
                       />
                    </div>
                    <button 
                      onClick={() => setSubmitted(true)}
                      className="btn-primary w-full py-5 text-lg mt-4 shadow-orange-500/20 shadow-xl"
                    >
                       Get My Custom Quote
                    </button>
                    <p className="text-[10px] text-slate-400 mt-4">By requesting a quote, you agree to our terms and community shipping guidelines.</p>
                  </div>
                </motion.div>
              )}

              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
                     <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-[var(--brand-blue)] mb-4">Quote Requested!</h2>
                  <p className="text-slate-600 max-w-md mx-auto mb-10">
                    Thank you for your interest. Our logistics team will review your details and send a custom quote to your phone/email within 24 hours.
                  </p>
                  <Link href="/" className="btn-primary px-10">Return Home</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="p-8 bg-slate-50 flex justify-between items-center border-t border-slate-100">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-[var(--brand-blue)]'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 5 && (
              <button 
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 font-bold px-10 py-3 rounded-xl transition-all ${isStepValid() ? 'bg-[var(--brand-blue)] text-white shadow-xl hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Community Trust Tip */}
        <div className="mt-12 text-center text-slate-400 text-sm italic">
           Need help booking? Call us directly: <a href="tel:+442074076858" className="font-bold text-[var(--brand-orange)] hover:underline">+44 207 407 6858</a>
        </div>
      </div>
    </main>
  );
}
