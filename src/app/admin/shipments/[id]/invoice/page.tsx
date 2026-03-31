'use client';

import { useParams } from 'next/navigation';
import { 
  Printer, 
  ArrowLeft, 
  Globe, 
  Wallet, 
  FileText, 
  ShieldCheck, 
  Zap,
  Building2,
  Calendar,
  User,
  Package
} from 'lucide-react';

const MOCK_SHIPMENT = {
  id: 'TS-9011',
  customer: 'Carlos Ruiz',
  email: 'carlos.r@gmail.com',
  phone: '+44 7911 123456',
  destination: 'Santo Domingo, DR',
  origin: 'London, UK',
  date: '28 Mar 2026',
  items: [
    { type: 'Standard Barrel', qty: 2, unitPrice: 120, total: 240 },
    { type: 'Large Box', qty: 3, unitPrice: 45, total: 135 },
    { type: 'Medium Box', qty: 1, unitPrice: 30, total: 30 },
    { type: 'Insurance (Premium)', qty: 1, unitPrice: 25, total: 25 },
  ],
  subtotal: 430,
  tax: 0,
  total: 430,
  paymentStatus: 'PAID',
  paymentMethod: 'Stripe / Visa'
};

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-white p-10 print:p-0 flex flex-col items-center">
      {/* Header / Actions (Hidden on print) */}
      <div className="w-full max-w-4xl mb-8 flex justify-between items-center print:hidden">
         <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" /> Back to Shipments
         </button>
         <button className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-3 text-sm shadow-xl" onClick={() => window.print()}>
            <Printer className="w-5 h-5" /> Print Invoice
         </button>
      </div>

      {/* Invoice Document */}
      <div className="w-full max-w-4xl bg-white p-16 border border-slate-100 shadow-2xl print:shadow-none print:border-none print:p-8">
         
         {/* Top Header */}
         <div className="flex justify-between items-start border-b-[4px] border-slate-900 pb-12 mb-12">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                     <Globe className="w-7 h-7" />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 italic uppercase underline decoration-[var(--brand-orange)] decoration-4 underline-offset-8">TS <span className="text-[var(--brand-orange)]">Couriers</span></h1>
               </div>
               <div className="space-y-1 font-bold text-slate-500 text-xs italic uppercase tracking-widest">
                  <p>International Logistics & Freight Forwarding</p>
                  <p>12 Canary Wharf, London, E14 5AB</p>
                  <p>Contact: +44 20 7123 4567 | admin@tscouriers.com</p>
                  <div className="flex items-center gap-2 text-emerald-600 mt-2">
                     <ShieldCheck className="w-3.5 h-3.5" />
                     <span className="text-[9px]">Verified Official Commercial Invoice</span>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <div className="bg-slate-950 text-white px-8 py-5 rounded-[2rem] inline-block mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1 leading-none italic">Invoicing Reference</p>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">{id}</h2>
               </div>
               <div className="flex flex-col gap-1 items-end">
                  <span className="text-xs font-black text-slate-900 uppercase italic underline decoration-2">Date Exported: {MOCK_SHIPMENT.date}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Auth: TSC-INV-SEC-44</span>
               </div>
            </div>
         </div>

         {/* Client & Shipping Info Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
               <User className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200 opacity-50" />
               <p className="text-[10px] font-black italic uppercase text-slate-400 mb-4 underline decoration-[var(--brand-orange)] decoration-2">Billing & Consignee Info</p>
               <h3 className="text-xl font-black text-slate-900 italic uppercase mb-2 tracking-tighter leading-none">{MOCK_SHIPMENT.customer}</h3>
               <div className="space-y-1 text-xs font-bold text-slate-500 uppercase italic">
                  <p>{MOCK_SHIPMENT.email}</p>
                  <p>{MOCK_SHIPMENT.phone}</p>
                  <p className="mt-4 text-[var(--brand-blue)] font-black">Destination: {MOCK_SHIPMENT.destination}</p>
               </div>
            </div>
            <div className="p-8 border-2 border-slate-100 rounded-[2.5rem] flex flex-col justify-center">
               <p className="text-[10px] font-black italic uppercase text-slate-400 mb-4">Payment Summary</p>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-black italic">
                     <span className="text-slate-400">Total Charged</span>
                     <span className="text-2xl text-[var(--brand-orange)] underline decoration-4 underline-offset-4">£{MOCK_SHIPMENT.total}.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase text-slate-400 italic">Method</span>
                     <span className="text-[10px] font-black uppercase text-slate-900 italic">{MOCK_SHIPMENT.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase text-slate-400 italic">Status</span>
                     <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">{MOCK_SHIPMENT.paymentStatus}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Invoice Breakdown */}
         <div className="mb-16">
            <h4 className="text-sm font-black italic uppercase text-slate-900 mb-6 flex items-center gap-3">
               <Package className="w-5 h-5 text-[var(--brand-orange)]" /> Shipment <span className="text-[var(--brand-orange)]">Breakdown</span>
            </h4>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] italic">
                        <th className="px-6 py-4 rounded-l-2xl">Bulto / Service Type</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Unit Rate</th>
                        <th className="px-6 py-4 rounded-r-2xl text-right">Total Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 italic">
                     {MOCK_SHIPMENT.items.map((item, idx) => (
                        <tr key={idx} className="group">
                           <td className="px-6 py-6 font-black text-slate-900">{item.type}</td>
                           <td className="px-6 py-6 font-bold text-slate-500">{item.qty} units</td>
                           <td className="px-6 py-6 font-bold text-slate-500">£{item.unitPrice}.00</td>
                           <td className="px-6 py-6 text-right font-black text-slate-900 italic">£{item.total}.00</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot>
                     <tr className="border-t-[4px] border-slate-900 bg-slate-50/50">
                        <td colSpan={3} className="px-6 py-8 text-right font-black italic uppercase text-xs tracking-tighter">Gross Commercial Total Payable:</td>
                        <td className="px-6 py-8 text-right font-black text-2xl text-slate-900 italic underline decoration-[var(--brand-orange)] decoration-4">£{MOCK_SHIPMENT.total}.00</td>
                     </tr>
                  </tfoot>
               </table>
            </div>
         </div>

         {/* Footer Terms */}
         <div className="grid grid-cols-2 gap-20 pt-12 border-t-2 border-slate-100">
            <div className="space-y-12">
               <div>
                  <p className="text-[10px] font-black italic uppercase text-slate-400 mb-2 border-b border-slate-100 pb-2">Logistics Control Auth</p>
                  <div className="h-20 flex items-end">
                     <FileText className="w-12 h-12 text-slate-100 mb-2" />
                  </div>
               </div>
            </div>
            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 text-center">
               <Zap className="w-10 h-10 text-[var(--brand-orange)] mx-auto mb-4 opacity-50" />
               <p className="text-xs font-black italic uppercase text-slate-900 mb-1 tracking-tighter">Thank you for your business</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">TS Couriers is committed to providing premium door-to-door global logistics.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
