'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const mockTrackingData = {
  "TS123456": {
    status: "In Transit",
    currentLocation: "En route to Rio Haina Port",
    origin: "London Warehouse, UK",
    destination: "Yaguate, San Cristóbal, DR",
    lastUpdate: "Today, 10:45 AM",
    steps: [
      { status: "Manifested", date: "Mar 10, 2026", completed: true },
      { status: "Collected in London", date: "Mar 12, 2026", completed: true },
      { status: "Processed at HQ", date: "Mar 13, 2026", completed: true },
      { status: "Departure to Port", date: "Mar 15, 2026", completed: true },
      { status: "Vessel Departure", date: "Estimated Mar 22, 2026", completed: false },
      { status: "Arrived at DR Port", date: "Pending", completed: false },
      { status: "Out for Delivery", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ]
  }
};

export default function TrackingPage() {
  const [trackingNo, setTrackingNo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      const found = mockTrackingData[trackingNo.toUpperCase() as keyof typeof mockTrackingData];
      if (found) {
        setResult(found);
      } else {
        setError('Tracking number not found. Please verify and try again.');
        setResult(null);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Search Hero */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--brand-blue)] mb-6">Track Your <span className="text-[var(--brand-orange)]">Cargo</span></h1>
            <p className="text-slate-500 max-w-2xl mx-auto italic">Enter your TS tracking number (e.g., TS123456) to view real-time status updates.</p>
          </motion.div>

          <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto relative group">
            <input 
              type="text" 
              placeholder="Enter Tracking ID..."
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              className="w-full pl-8 pr-40 py-6 rounded-[2rem] bg-white shadow-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium"
            />
            <button 
              disabled={loading || !trackingNo}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--brand-blue)] text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-2 hover:bg-blue-800 disabled:bg-slate-300 transition-all shadow-lg active:scale-95"
            >
              {loading ? "Searching..." : "Track Package"}
              {!loading && <Search className="w-5 h-5" />}
            </button>
          </form>
          
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-red-500 font-bold flex items-center justify-center gap-2">
               <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
          )}
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
               {/* Left: Status Overview */}
               <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-blue)] opacity-5 rounded-full translate-x-12 -translate-y-12" />
                    
                    <div className="flex justify-between items-start mb-10">
                       <div>
                          <span className="bg-blue-100 text-[var(--brand-blue)] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">{result.status}</span>
                          <h2 className="text-3xl font-extrabold text-slate-800">{result.currentLocation}</h2>
                       </div>
                       <Package className="w-12 h-12 text-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-12 bg-slate-50 p-8 rounded-[2rem]">
                       <div>
                          <p className="text-xs text-slate-400 font-bold uppercase mb-2">From</p>
                          <p className="text-slate-800 font-bold underline decoration-[var(--brand-orange)] decoration-2">{result.origin}</p>
                       </div>
                       <div>
                          <p className="text-xs text-slate-400 font-bold uppercase mb-2">Destination</p>
                          <p className="text-slate-800 font-bold underline decoration-[var(--brand-blue)] decoration-2">{result.destination}</p>
                       </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 mb-10">Historical Timeline</h3>
                    <div className="relative space-y-12">
                       <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 z-0" />
                       
                       {result.steps.map((step: any, idx: number) => (
                         <div key={idx} className="relative z-10 flex gap-8 items-start">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${step.completed ? 'bg-[var(--brand-blue)] text-white scale-110 ring-8 ring-blue-50' : 'bg-slate-100 text-slate-300'}`}>
                               {step.completed ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div className="flex-grow pt-1">
                               <div className="flex justify-between items-start">
                                  <h4 className={`font-bold ${step.completed ? 'text-slate-800' : 'text-slate-400 italic'}`}>{step.status}</h4>
                                  <span className="text-xs text-slate-400 font-medium">{step.date}</span>
                               </div>
                               {step.completed && <p className="text-xs text-slate-500 mt-1">Confirmed and scanned at processing center.</p>}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Right: Actions / Sidebar */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-[var(--brand-orange)] rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/20">
                     <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                     <p className="text-orange-50 text-sm mb-8 italic">Our team is available to assist with specific location inquiries.</p>
                     <div className="space-y-4">
                        <button className="w-full bg-white text-[var(--brand-orange)] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                           WhatsApp Support
                        </button>
                        <button className="w-full bg-black/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/20">
                           Report Issue
                        </button>
                     </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
                     <h4 className="font-bold text-slate-800 mb-6 underline decoration-slate-200 decoration-4">Shipping Reminders</h4>
                     <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-slate-600">
                           <ChevronRight className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
                           <span>Vessels depart London monthly for Dominican Republic.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                           <ChevronRight className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
                           <span>Standard transit to DR: 6-8 weeks.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                           <ChevronRight className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
                           <span>European deliveries depend on customs clearance.</span>
                        </li>
                     </ul>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40">
             <div className="flex flex-col items-center gap-4 grayscale">
                <Package className="w-12 h-12" />
                <span className="font-bold uppercase tracking-widest text-xs">Enter ID</span>
             </div>
             <div className="flex flex-col items-center gap-4 grayscale">
                <Truck className="w-12 h-12" />
                <span className="font-bold uppercase tracking-widest text-xs">View Status</span>
             </div>
             <div className="flex flex-col items-center gap-4 grayscale">
                <CheckCircle2 className="w-12 h-12" />
                <span className="font-bold uppercase tracking-widest text-xs">Confirm Delivery</span>
             </div>
          </div>
        )}
      </div>
    </main>
  );
}
