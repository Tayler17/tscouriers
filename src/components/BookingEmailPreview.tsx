'use client';

import { motion } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  Printer,
  Download
} from 'lucide-react';
import Logo from './Logo';

interface EmailPreviewProps {
  data: any;
  onClose: () => void;
}

export default function BookingEmailPreview({ data, onClose }: EmailPreviewProps) {
  const trackingNumber = data.trackingId || `TS-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackUrl = typeof window !== 'undefined' ? `${window.location.origin}/track?id=${trackingNumber}` : `/track?id=${trackingNumber}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Booking Receipt - ${trackingNumber}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #1e293b; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
      .logo { font-size: 22px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
      .logo span { color: #E85D04; }
      .receipt-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #94a3b8; text-align: right; }
      .receipt-date { font-size: 13px; font-weight: 700; text-align: right; margin-top: 4px; }
      .confirmed { text-align: center; padding: 30px 0; border-bottom: 1px solid #f1f5f9; margin-bottom: 30px; }
      .confirmed h1 { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
      .confirmed h1 span { color: #E85D04; }
      .tracking-box { background: #0f172a; color: #fff; border-radius: 16px; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
      .tracking-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #93c5fd; margin-bottom: 6px; }
      .tracking-id { font-size: 24px; font-weight: 900; letter-spacing: 2px; }
      .track-url { font-size: 11px; color: #94a3b8; margin-top: 6px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
      .section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #94a3b8; margin-bottom: 10px; }
      .field { margin-bottom: 6px; }
      .field-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; }
      .field-val { font-size: 13px; font-weight: 700; margin-top: 2px; }
      .items-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-size: 12px; font-weight: 700; }
      .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    </style></head><body>
    <div class="header">
      <div class="logo">TS <span>Couriers</span></div>
      <div>
        <div class="receipt-title">Order Receipt</div>
        <div class="receipt-date">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
    <div class="confirmed">
      <h1>Your Ship is <span>Confirmed!</span></h1>
      <p style="color:#64748b;margin-top:8px;font-size:13px;">Hi ${data.customer?.name || 'Customer'}, your booking has been received successfully.</p>
    </div>
    <div class="tracking-box">
      <div>
        <div class="tracking-label">Private Tracking ID</div>
        <div class="tracking-id">${trackingNumber}</div>
        <div class="track-url">Track: ${trackUrl}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <div class="section-label">Collection</div>
        <div class="field"><div class="field-label">Name</div><div class="field-val">${data.collection?.name || '—'}</div></div>
        <div class="field"><div class="field-label">Address</div><div class="field-val">${data.collection?.address || '—'}</div></div>
        <div class="field"><div class="field-label">Date</div><div class="field-val">${data.dates?.collection || 'TBC'}</div></div>
      </div>
      <div>
        <div class="section-label">Delivery</div>
        <div class="field"><div class="field-label">Name</div><div class="field-val">${data.delivery?.name || '—'}</div></div>
        <div class="field"><div class="field-label">Address</div><div class="field-val">${data.delivery?.address || '—'}</div></div>
        <div class="field"><div class="field-label">Phone</div><div class="field-val">${data.delivery?.phone || '—'}</div></div>
      </div>
    </div>
    <div class="section-label">Items</div>
    ${(data.items || []).map((item: any) => `<div class="items-row"><span>${item.quantity}× ${item.name}</span><span>£${(item.price * item.quantity).toFixed(2)}</span></div>`).join('')}
    <div class="footer">
      © ${new Date().getFullYear()} TS Couriers · Dominican Shipping · All rights reserved
    </div>
    <script>window.onload = () => window.print();</script>
    </body></html>`);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Browser Tray Mockup */}
        <div className="bg-slate-100 px-6 py-3 flex items-center justify-between border-b border-slate-200">
           <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
           </div>
           <div className="bg-white px-20 py-1 rounded-md text-[10px] font-bold text-slate-400 border border-slate-200">
              inbox.ts-couriers.com
           </div>
           <div className="flex gap-3 text-slate-400">
              <Printer className="w-4 h-4 cursor-pointer hover:text-slate-600" onClick={handlePrint} />
              <Download className="w-4 h-4 cursor-pointer hover:text-slate-600" onClick={handlePrint} />
           </div>
        </div>

        {/* Email Header */}
        <div className="bg-white p-8 border-b border-slate-50 flex justify-between items-center">
           <div className="scale-75 origin-left">
              <Logo />
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Receipt</p>
              <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* Email Body Wrap */}
        <div className="flex-grow overflow-y-auto p-12 custom-scrollbar space-y-12">
           
           {/* Welcome Message */}
           <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Your ship is <span className="text-[var(--brand-orange)]">Confirmed!</span></h1>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Hi {data.customer.name}, we've received your payment and our logistics team is already preparing your slot.</p>
           </div>

           {/* Tracking Banner */}
           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-orange)] opacity-10 rounded-full translate-x-12 -translate-y-12" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest leading-none mb-2">Private Tracking ID</p>
                    <p className="text-2xl font-black tracking-tighter italic">{trackingNumber}</p>
                 </div>
                 <button
                   onClick={() => window.open(`/track?id=${trackingNumber}`, '_blank')}
                   className="bg-[var(--brand-orange)] hover:bg-[#e65100] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors"
                 >
                    Track Journey <ExternalLink className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>

           {/* Shipment Breakdown */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--brand-orange)]" /> Pickup Details
                 </h4>
                 <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm capitalize">{data.collection.name}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{data.collection.address}</p>
                    <p className="text-[10px] font-bold text-[var(--brand-blue)] mt-2 uppercase">Scheduled: {data.dates.collection}</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package className="w-4 h-4 text-[var(--brand-blue)]" /> Order Summary
                 </h4>
                 <div className="space-y-3">
                    {data.items.slice(0, 3).map((item: any, i: number) => (
                       <div key={i} className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-2 text-slate-600">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-slate-900">£{(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                    ))}
                    {data.items.length > 3 && (
                       <p className="text-[10px] text-slate-400 italic">+{data.items.length - 3} more items...</p>
                    )}
                 </div>
              </div>
           </div>

           {/* Insurance Shield */}
           <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[var(--brand-blue)] shadow-sm">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                 <p className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-widest">TS Proobia Care+</p>
                 <p className="text-[10px] text-slate-500 font-medium">Your shipment is fully insured up to £1,000 against damage or loss.</p>
              </div>
           </div>

           {/* Footer Action */}
           <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
              <div className="flex gap-4">
                 <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-[var(--brand-blue)] transition-colors">
                       <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter transition-colors group-hover:text-slate-600">Support</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-[var(--brand-blue)] transition-colors">
                       <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter transition-colors group-hover:text-slate-600">Contact</span>
                 </div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold max-w-xs text-center leading-relaxed">
                 © {new Date().getFullYear()} TS Couriers. All rights reserved. <br />
                 UK & Dominican Republic Logistics Experts.
              </p>
           </div>
        </div>

        {/* UI Controls */}
        <div className="bg-white p-6 border-t border-slate-50 flex justify-center">
           <button 
             onClick={onClose}
             className="bg-[var(--brand-blue)] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
              Done & Finish <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
