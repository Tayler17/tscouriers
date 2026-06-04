'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, MapPin, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STATUS_STEPS = [
  'Pending Pickup',
  'Collected',
  'In Warehouse',
  'Ready to Ship',
  'At Sea',
  'In Custom',
  'Out for Delivery',
  'Delivered',
];

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function TrackingPage() {
  const [trackingNo, setTrackingNo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .or(`id.eq.${trackingNo.toUpperCase()},id.eq.${trackingNo}`)
      .single();

    if (!shipment) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .or(`id.eq.${trackingNo.toUpperCase()},id.eq.${trackingNo}`)
        .single();

      if (booking) {
        setResult({
          id: booking.id,
          status: booking.status,
          origin: booking.collection_address || 'London Hub',
          destination: booking.delivery_address || booking.route?.split('→')[1]?.trim() || 'Dominican Republic',
          type: booking.type,
          date: booking.date,
          currentStep: getStepIndex(booking.status),
        });
      } else {
        setError('Tracking number not found. Please verify and try again.');
      }
    } else {
      setResult({
        id: shipment.id,
        status: shipment.status,
        origin: shipment.origin || 'London Hub',
        destination: shipment.destination,
        type: shipment.type,
        date: shipment.date,
        currentStep: getStepIndex(shipment.status),
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="container mx-auto px-6 max-w-5xl">

        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--brand-blue)] mb-6">
              Track Your <span className="text-[var(--brand-orange)]">Cargo</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto italic">
              Enter your TS tracking number to view real-time status updates.
            </p>
          </motion.div>

          <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto relative group">
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. TS01234)"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              className="w-full pl-8 pr-40 py-6 rounded-[2rem] bg-white shadow-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xl font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium"
            />
            <button
              disabled={loading || !trackingNo}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--brand-blue)] text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-2 hover:bg-blue-800 disabled:bg-slate-300 transition-all shadow-lg active:scale-95"
            >
              {loading ? 'Searching...' : 'Track'} {!loading && <Search className="w-5 h-5" />}
            </button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-red-500 font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

              {/* Status card */}
              <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="bg-blue-100 text-[var(--brand-blue)] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
                      {result.status}
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-800">{result.id}</h2>
                    <p className="text-slate-400 font-bold mt-1">{result.type} · {result.date}</p>
                  </div>
                  <Package className="w-12 h-12 text-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-12 bg-slate-50 p-8 rounded-[2rem] mb-10">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">From</p>
                    <p className="text-slate-800 font-bold underline decoration-[var(--brand-orange)] decoration-2">{result.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">To</p>
                    <p className="text-slate-800 font-bold underline decoration-[var(--brand-blue)] decoration-2">{result.destination}</p>
                  </div>
                </div>

                {/* Timeline */}
                <h3 className="text-xl font-bold text-slate-800 mb-8">Shipment Timeline</h3>
                <div className="relative space-y-8">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 z-0" />
                  {STATUS_STEPS.map((step, idx) => {
                    const completed = idx <= result.currentStep;
                    const current = idx === result.currentStep;
                    return (
                      <div key={step} className="relative z-10 flex gap-8 items-start">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${
                          current ? 'bg-[var(--brand-orange)] text-white scale-110 ring-8 ring-orange-50' :
                          completed ? 'bg-[var(--brand-blue)] text-white' :
                          'bg-slate-100 text-slate-300'
                        }`}>
                          {completed ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <div className="flex-grow pt-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-bold ${completed ? 'text-slate-800' : 'text-slate-400 italic'}`}>{step}</h4>
                            {current && <span className="text-xs font-black text-[var(--brand-orange)] uppercase tracking-widest">Current</span>}
                          </div>
                          {current && <p className="text-xs text-slate-500 mt-1">Your shipment is currently at this stage.</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Help sidebar */}
              <div className="bg-[var(--brand-orange)] rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/20">
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <p className="text-orange-50 text-sm mb-8 italic">Our team is available to assist with your shipment.</p>
                <div className="space-y-4">
                  <button className="w-full bg-white text-[var(--brand-orange)] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                    WhatsApp Support
                  </button>
                  <button className="w-full bg-black/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/20">
                    Report Issue
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40">
            <div className="flex flex-col items-center gap-4 grayscale"><Package className="w-12 h-12" /><span className="font-bold uppercase tracking-widest text-xs">Enter ID</span></div>
            <div className="flex flex-col items-center gap-4 grayscale"><Truck className="w-12 h-12" /><span className="font-bold uppercase tracking-widest text-xs">View Status</span></div>
            <div className="flex flex-col items-center gap-4 grayscale"><CheckCircle2 className="w-12 h-12" /><span className="font-bold uppercase tracking-widest text-xs">Confirm Delivery</span></div>
          </div>
        )}
      </div>
    </main>
  );
}
