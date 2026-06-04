'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  Printer,
  ArrowLeft,
  Scissors,
  Truck,
  MapPin
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase';

interface Shipment {
  id: string;
  customer: string;
  destination: string;
  type: string;
  weight: string;
  status: string;
  date: string;
}

function LabelContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    supabase.from('shipments').select('*').eq('id', id).single().then(({ data }) => {
      setShipment(data as Shipment);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-widest">
      Loading Label...
    </div>
  );

  if (!shipment) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="font-black italic text-slate-400 uppercase tracking-widest">Shipment not found: {id}</p>
      <button className="btn-primary py-3 px-6 rounded-2xl text-sm" onClick={() => window.history.back()}>Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-10 print:bg-white print:p-0 flex flex-col items-center">
      {/* Action Bar (Hidden on print) */}
      <div className="w-full max-w-[4in] mb-6 flex justify-between items-center print:hidden">
         <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" /> Back
         </button>
         <button className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 text-sm shadow-xl" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print Label
         </button>
      </div>

      {/* 4x6 Thermal Label Container */}
      <div className="w-[4in] h-[6in] bg-white border-[3px] border-black text-black font-sans p-6 overflow-hidden flex flex-col shadow-2xl print:shadow-none print:border-[2px] relative">

         {/* Top Logo & ID */}
         <div className="flex justify-between items-start border-b-[3px] border-black pb-4 mb-4">
            <div>
               <h1 className="text-2xl font-black italic uppercase leading-none">TS <span className="text-[var(--brand-orange)]">Couriers</span></h1>
               <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Global Logistics Network</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase">Tracking ID</p>
               <h2 className="text-xl font-black italic leading-none">{shipment.id}</h2>
            </div>
         </div>

         {/* Routing Info */}
         <div className="grid grid-cols-2 gap-4 border-b-[3px] border-black pb-4 mb-4">
            <div className="border-r-[2px] border-black pr-4">
               <p className="text-[7px] font-black uppercase mb-1">From / Origin</p>
               <p className="text-[10px] font-extrabold uppercase leading-tight">London, UK</p>
               <p className="text-[7px] font-bold mt-1">Warehouse: LND-H1</p>
            </div>
            <div className="pl-2">
               <p className="text-[7px] font-black uppercase mb-1 underline decoration-2">Destination / Port</p>
               <p className="text-[10px] font-extrabold uppercase leading-tight">{shipment.destination}</p>
               <p className="text-[7px] font-bold mt-1">Priority: High</p>
            </div>
         </div>

         {/* Consignee Info (Main Area) */}
         <div className="flex-grow flex flex-col justify-center border-b-[3px] border-black pb-4 mb-4">
            <p className="text-[8px] font-black uppercase mb-1">To / Consignee</p>
            <h3 className="text-2xl font-black italic uppercase leading-tight mb-2 tracking-tighter">{shipment.customer}</h3>
            <div className="flex items-center gap-2 mb-4">
               <MapPin className="w-3 h-3" />
               <p className="text-[9px] font-bold uppercase tracking-tight italic">Address details in master manifest</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
               <div className="bg-black text-white p-2 rounded-lg text-center">
                  <p className="text-[6px] font-black uppercase">Weight</p>
                  <p className="text-xs font-black italic">{shipment.weight}</p>
               </div>
               <div className="bg-black text-white p-2 rounded-lg text-center">
                  <p className="text-[6px] font-black uppercase">Status</p>
                  <p className="text-[8px] font-black italic">{shipment.status}</p>
               </div>
               <div className="bg-black text-white p-2 rounded-lg text-center flex flex-col justify-center">
                  <p className="text-[6px] font-black uppercase leading-none">Type</p>
                  <p className="text-[8px] font-black italic leading-none uppercase">{shipment.type}</p>
               </div>
            </div>
         </div>

         {/* QR & Service Info */}
         <div className="flex items-center justify-between">
            <div className="space-y-2 max-w-[60%]">
               <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <p className="text-[9px] font-black uppercase italic tracking-tighter">Sea Freight — Door to Door</p>
               </div>
               <p className="text-[7px] font-black uppercase leading-tight italic">Date: {shipment.date}</p>
               <div className="pt-2 border-t border-black/10">
                  <p className="text-[6px] font-bold">Printed on: {new Date().toLocaleString()}</p>
               </div>
            </div>
            <div className="w-20 h-20 border-[2.5px] border-black p-1 flex items-center justify-center bg-white">
               <QRCode
                 value={`${typeof window !== 'undefined' ? window.location.origin : 'https://tscouriers.com'}/track?id=${shipment.id}`}
                 size={72}
                 level="M"
               />
            </div>
         </div>

         {/* Cut Line */}
         <div className="absolute bottom-0 left-0 w-full h-[10px] border-t-2 border-dashed border-black mt-2 print:hidden flex items-center justify-center">
            <Scissors className="w-3 h-3 text-slate-300 -translate-y-[6px]" />
         </div>
      </div>
      <p className="mt-8 text-xs font-bold text-slate-400 print:hidden uppercase tracking-widest italic">Standard 4x6 Thermal Output Ready</p>
    </div>
  );
}

export default function LabelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-widest">Loading Label System...</div>}>
      <LabelContent />
    </Suspense>
  );
}
