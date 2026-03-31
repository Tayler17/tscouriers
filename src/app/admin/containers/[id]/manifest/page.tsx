'use client';

import { useParams, useRouter } from 'next/navigation';
import { 
  Printer, 
  ArrowLeft, 
  Package, 
  Truck, 
  Globe, 
  Calendar, 
  Anchor, 
  Plane,
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react';

const MOCK_MANIFEST_DATA = {
  id: 'CONT-4091',
  type: '40ft High Cube Container',
  vessel: 'MSC VALENCIA',
  voyage: 'V-2026-X4',
  portOfLoading: 'Port of London, UK',
  portOfDischarge: 'Rio Haina, Dominican Republic',
  etd: '30 Mar 2026',
  eta: '14 Apr 2026',
  totalWeight: '18,500 kg',
  totalVolume: '67.5 cbm',
  shipments: [
    { id: 'TS-9011', consignee: 'Carlos Ruiz', description: 'Personal Effects (Barrel)', weight: '45kg', seal: 'S-712' },
    { id: 'TS-9012', consignee: 'Elena Gomez', description: 'Household Goods', weight: '210kg', seal: 'S-713' },
    { id: 'TS-9015', consignee: 'Miguel Angel', description: 'Electronics & Tools', weight: '120kg', seal: 'S-714' },
    { id: 'TS-7821', consignee: 'Ricardo Peña', description: 'Vehicle Parts', weight: '850kg', seal: 'S-715' },
    { id: 'TS-7824', consignee: 'Maria Rodriguez', description: 'Construction Materials', weight: '1200kg', seal: 'S-716' },
    { id: 'TS-8842', consignee: 'Juan Perez', description: 'Commercial Goods', weight: '450kg', seal: 'S-717' },
    { id: 'TS-8843', consignee: 'Sarah Johnson', description: 'Assorted Boxes', weight: '320kg', seal: 'S-718' },
  ]
};

export default function ManifestPage() {
  const params = useParams();
  const router = useRouter();
  const containerId = params.id as string;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10 print:bg-white print:p-0">
      {/* Header / Actions (Hidden on print) */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
         <button 
           onClick={() => router.back()}
           className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
         >
           <ArrowLeft className="w-4 h-4" /> Back to Containers
         </button>
         <button 
           onClick={handlePrint}
           className="btn-primary py-3 px-8 rounded-2xl flex items-center gap-3 text-sm shadow-xl shadow-orange-500/20"
         >
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
                  <h2 className="text-3xl font-black italic">{containerId}</h2>
               </div>
               <div className="flex flex-col gap-1 items-end">
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase">Cleared for Dispatch</span>
                  <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Document Auth: TSC-L0D-26</span>
               </div>
            </div>
         </div>

         {/* Logistics Info Grid */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-1.5">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Anchor className="w-3 h-3" /> Vessel Name
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase">{MOCK_MANIFEST_DATA.vessel}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase truncate">Voyage: {MOCK_MANIFEST_DATA.voyage}</p>
            </div>
            <div className="space-y-1.5 border-l border-slate-100 pl-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Truck className="w-3 h-3" /> Origin Port
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase">{MOCK_MANIFEST_DATA.portOfLoading}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">ETD: {MOCK_MANIFEST_DATA.etd}</p>
            </div>
            <div className="space-y-1.5 border-l border-slate-100 pl-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Destination
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase tracking-tighter leading-tight">{MOCK_MANIFEST_DATA.portOfDischarge}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">ETA: {MOCK_MANIFEST_DATA.eta}</p>
            </div>
            <div className="space-y-1.5 border-l border-slate-100 pl-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Cargo Type
               </p>
               <p className="text-lg font-black text-slate-900 italic uppercase">{MOCK_MANIFEST_DATA.type}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Total: 428 Items</p>
            </div>
         </div>

         {/* Shipment Table */}
         <div className="mb-16">
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-8 border-b-2 border-slate-100 pb-4 flex items-center gap-3">
               <Package className="w-6 h-6 text-[var(--brand-orange)]" /> Consignment <span className="text-[var(--brand-orange)]">Breakdown</span>
            </h3>
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
                     <th className="px-6 py-4">HBL / ID</th>
                     <th className="px-6 py-4">Consignee Name</th>
                     <th className="px-6 py-4">Cargo Description</th>
                     <th className="px-6 py-4">Weight</th>
                     <th className="px-6 py-4 text-right">Seal No.</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 italic">
                  {MOCK_MANIFEST_DATA.shipments.map((ship) => (
                     <tr key={ship.id}>
                        <td className="px-6 py-4 font-black text-slate-900">{ship.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{ship.consignee}</td>
                        <td className="px-6 py-4 font-bold text-slate-500 text-sm uppercase">{ship.description}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{ship.weight}</td>
                        <td className="px-6 py-4 text-right">
                           <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black tracking-widest">{ship.seal}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
               <tfoot>
                  <tr className="bg-slate-900 text-white font-black uppercase italic">
                     <td colSpan={3} className="px-6 py-5 text-right text-xs">Accumulated Cargo Load Total:</td>
                     <td className="px-6 py-5">{MOCK_MANIFEST_DATA.totalWeight}</td>
                     <td className="px-6 py-5 text-right text-xs text-slate-400 font-bold">{MOCK_MANIFEST_DATA.totalVolume}</td>
                  </tr>
               </tfoot>
            </table>
         </div>

         {/* Authorization Signatures */}
         <div className="grid grid-cols-2 gap-20 pt-12 border-t-2 border-slate-100">
            <div className="space-y-12">
               <div>
                  <p className="text-[10px] font-black italic uppercase text-slate-400 mb-1 border-b border-slate-100 pb-2">Customs Authority Representative</p>
                  <div className="h-20 flex items-end">
                     <ShieldCheck className="w-12 h-12 text-slate-100 mb-2" />
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black italic uppercase text-slate-400 mb-1 border-b border-slate-100 pb-2">Warehouse Master Supervisor</p>
                  <div className="h-20"></div>
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
