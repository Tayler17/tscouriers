'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  Printer, ArrowLeft, Package, Truck, Globe,
  Anchor, FileText, ShieldCheck, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Container {
  id: string;
  vessel: string;
  flight: string;
  destination: string;
  type: string;
  status: string;
  count: number;
  date: string;
}

interface Shipment {
  id: string;
  customer: string;
  destination: string;
  type: string;
  weight: string;
  status: string;
}

const ACTIVE_STATUSES = ['In Warehouse', 'Ready to Ship', 'In Transit', 'At Port', 'Pending Customs', 'Customs Clearance'];

function ManifestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerId = searchParams.get('id') || '';
  const [container, setContainer] = useState<Container | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerId) { setLoading(false); return; }
    Promise.all([
      supabase.from('containers').select('*').eq('id', containerId).single(),
      supabase.from('shipments').select('*').in('status', ACTIVE_STATUSES).order('date', { ascending: false }),
    ]).then(([{ data: c }, { data: s }]) => {
      setContainer(c as Container);
      setShipments((s as Shipment[]) || []);
      setLoading(false);
    });
  }, [containerId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-widest">
      Loading Manifest...
    </div>
  );

  if (!container) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="font-black italic text-slate-400 uppercase tracking-widest">Container not found: {containerId}</p>
      <button className="btn-primary py-3 px-6 rounded-2xl text-sm" onClick={() => router.back()}>Go Back</button>
    </div>
  );

  const totalWeight = shipments.reduce((sum, s) => {
    const kg = parseFloat(s.weight?.replace(/[^\d.]/g, '') || '0');
    return sum + kg;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-10 print:bg-white print:p-0">
      {/* Header / Actions */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
         <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
           <ArrowLeft className="w-4 h-4" /> Back to Containers
         </button>
         <button onClick={() => window.print()} className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-3 text-sm shadow-xl shadow-orange-500/20">
           <Printer className="w-5 h-5" /> Print Manifest
         </button>
      </div>

      {/* Manifest Document */}
      <div className="max-w-5xl mx-auto bg-white p-16 rounded-[3rem] shadow-2xl border border-slate-100 print:shadow-none print:border-none print:p-8">

         {/* Top Header */}
         <div className="flex justify-between items-start border-b-4 border-slate-900 pb-12 mb-12">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                     <Globe className="w-7 h-7" />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">TS <span className="text-[var(--brand-orange)]">Couriers</span></h1>
               </div>
               <div className="space-y-1 font-bold text-slate-500 text-sm italic">
                  <p>International Logistics & Freight Forwarding</p>
                  <p>Head Office: London, UK</p>
                  <p>Global Carrier Network: EU | DR | US</p>
                  <div className="flex items-center gap-2 text-blue-600 mt-2">
                     <Zap className="w-4 h-4" />
                     <span className="text-xs uppercase tracking-widest font-black">Official Manifest Document</span>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] inline-block mb-4 shadow-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Manifest Reference</p>
                  <h2 className="text-3xl font-black italic">{container.id}</h2>
               </div>
               <div className="flex flex-col gap-1 items-end">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${container.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-blue-50 text-blue-600 border border-blue-500/20'}`}>{container.status}</span>
                  <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Auth: TSC-L0D-26</span>
               </div>
            </div>
         </div>

         {/* Logistics Info Grid */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-1.5">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Anchor className="w-3 h-3" /> Vessel Name
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase">{container.vessel || '—'}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Flight: {container.flight || '—'}</p>
            </div>
            <div className="space-y-1.5 border-l border-slate-100 pl-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Truck className="w-3 h-3" /> Origin
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase">London, UK</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Date: {container.date}</p>
            </div>
            <div className="space-y-1.5 border-l border-slate-100 pl-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Destination
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase tracking-tighter leading-tight">{container.destination}</p>
            </div>
            <div className="space-y-1.5 border-l border-slate-100 pl-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Container
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase">{container.type}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">{shipments.length} Active Items</p>
            </div>
         </div>

         {/* Shipment Table */}
         <div className="mb-16">
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-8 border-b-2 border-slate-100 pb-4 flex items-center gap-3">
               <Package className="w-6 h-6 text-[var(--brand-orange)]" /> Active Consignment <span className="text-[var(--brand-orange)]">Breakdown</span>
            </h3>
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
                     <th className="px-6 py-4">HBL / ID</th>
                     <th className="px-6 py-4">Consignee Name</th>
                     <th className="px-6 py-4">Cargo Type</th>
                     <th className="px-6 py-4">Weight</th>
                     <th className="px-6 py-4 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 italic">
                  {shipments.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No active shipments</td></tr>
                  ) : shipments.map(ship => (
                    <tr key={ship.id}>
                       <td className="px-6 py-4 font-black text-slate-900">{ship.id}</td>
                       <td className="px-6 py-4 font-bold text-slate-700">{ship.customer}</td>
                       <td className="px-6 py-4 font-bold text-slate-500 text-sm uppercase">{ship.type}</td>
                       <td className="px-6 py-4 font-black text-slate-900">{ship.weight}</td>
                       <td className="px-6 py-4 text-right">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black tracking-widest">{ship.status}</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
               <tfoot>
                  <tr className="bg-slate-900 text-white font-black uppercase italic">
                     <td colSpan={3} className="px-6 py-5 text-right text-xs">Accumulated Cargo Total:</td>
                     <td className="px-6 py-5">{totalWeight > 0 ? `${totalWeight.toFixed(0)} kg` : '—'}</td>
                     <td className="px-6 py-5 text-right text-xs text-slate-400 font-bold">{shipments.length} Items</td>
                  </tr>
               </tfoot>
            </table>
         </div>

         {/* Signatures */}
         <div className="grid grid-cols-2 gap-20 pt-12 border-t-2 border-slate-100">
            <div className="space-y-12">
               <div>
                  <p className="text-[10px] font-black italic uppercase text-slate-400 mb-1 border-b border-slate-100 pb-2">Customs Authority Representative</p>
                  <div className="h-20 flex items-end"><ShieldCheck className="w-12 h-12 text-slate-100 mb-2" /></div>
               </div>
               <div>
                  <p className="text-[10px] font-black italic uppercase text-slate-400 mb-1 border-b border-slate-100 pb-2">Warehouse Master Supervisor</p>
                  <div className="h-20" />
               </div>
            </div>
            <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100 flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 bg-white rounded-3xl border-4 border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                  <FileText className="w-10 h-10 text-slate-200" />
               </div>
               <p className="text-xs font-black italic uppercase text-slate-900 mb-2 tracking-tighter">Certified Document</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">This manifest has been digitally verified and sealed by TS Couriers Global Compliance System.</p>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function ManifestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-widest">Loading Digital Manifest...</div>}>
      <ManifestContent />
    </Suspense>
  );
}
