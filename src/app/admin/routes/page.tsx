'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Route as RouteIcon, 
  MapPin, 
  Clock, 
  User, 
  Truck, 
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  Navigation,
  Package,
  Plus,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ROUTES = [
  { 
    id: 'RT-101', 
    driver: 'Marco Antonio', 
    origin: 'London Hub', 
    destination: 'Tilbury Port', 
    progress: 75, 
    status: 'In Transit', 
    eta: '14:20',
    shipments: [
      { id: 'TS-9011', customer: 'Carlos Ruiz', status: 'In Transit' },
      { id: 'TS-9012', customer: 'Elena Gomez', status: 'Picked Up' },
      { id: 'TS-9015', customer: 'Miguel Angel', status: 'In Transit' },
    ]
  },
  { 
    id: 'RT-102', 
    driver: 'Luis Vasquez', 
    origin: 'Madrid Warehouse', 
    destination: 'Valencia Port', 
    progress: 30, 
    status: 'In Transit', 
    eta: '18:45',
    shipments: [
      { id: 'TS-7822', customer: 'Sarah Johnson', status: 'In Transit' },
    ]
  },
  { 
    id: 'RT-104', 
    driver: 'Miguel Angel', 
    origin: 'London Hub', 
    destination: 'Birmingham Pickup', 
    progress: 10, 
    status: 'Delayed', 
    eta: '16:30',
    shipments: [
      { id: 'TS-7824', customer: 'Maria Rodriguez', status: 'Pending' },
      { id: 'TS-8842', customer: 'Juan Perez', status: 'Pending' },
    ]
  },
];

export default function RoutesPage() {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Fleet <span className="text-[var(--brand-orange)] font-black">Routing</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Shipment Logistics</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input type="text" placeholder="Search Route..." className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm" />
              </div>
              <button className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Create New Route
              </button>
           </div>
        </header>

        {/* Fleet Monitor Grid */}
        <div className="grid grid-cols-1 gap-8">
           {MOCK_ROUTES.map((route, i) => (
             <motion.div 
               key={route.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
             >
                <div className="p-8">
                   <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                            <Truck className="w-8 h-8" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Route Identifier</p>
                            <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">{route.id}</h3>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border ${
                            route.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            route.status === 'Delayed' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                         }`}>
                            {route.status}
                         </div>
                         <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                            <MoreVertical className="w-5 h-5" />
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                      <div className="space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                               <User className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Assigned Driver</p>
                               <p className="font-black text-slate-900 uppercase italic tracking-tighter">{route.driver}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                               <Package className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Shipments Loaded</p>
                               <p className="font-black text-slate-900 uppercase italic tracking-tighter">{route.shipments.length} Active Parcels</p>
                            </div>
                         </div>
                      </div>

                      <div className="md:col-span-2 space-y-6">
                         <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                               <MapPin className="w-3.5 h-3.5 text-blue-500" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{route.origin}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{route.destination}</span>
                               <Navigation className="w-3.5 h-3.5 text-[var(--brand-orange)]" />
                            </div>
                         </div>
                         <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${route.progress}%` }}
                              className="absolute left-0 top-0 h-full bg-[var(--brand-orange)] rounded-full shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                            />
                         </div>
                         <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Efficiency Service: <span className="text-slate-900">Priority Ground</span></p>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
                               <Clock className="w-3 h-3 text-slate-400" />
                               <span className="text-[10px] font-black text-slate-900">ETA: {route.eta}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Shipment Details Toggle */}
                <div className="bg-slate-50/50 border-t border-slate-100 p-6">
                   <button 
                     onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                     className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
                   >
                      <span>View Detailed Manifest & Parcel Status</span>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedRoute === route.id ? 'rotate-90' : ''}`} />
                   </button>

                   <AnimatePresence>
                      {expandedRoute === route.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                           <div className="pt-8 space-y-4">
                              {route.shipments.map((shipment) => (
                                <div key={shipment.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                   <div className="flex items-center gap-6">
                                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black text-xs">
                                         {shipment.id.split('-')[1]}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">{shipment.id}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shipment.customer}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-6">
                                      <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${
                                         shipment.status === 'In Transit' ? 'text-blue-500' : 
                                         shipment.status === 'Picked Up' ? 'text-orange-500' : 'text-slate-400'
                                      }`}>
                                         <div className={`w-1.5 h-1.5 rounded-full ${
                                            shipment.status === 'In Transit' ? 'bg-blue-500 animate-pulse' : 
                                            shipment.status === 'Picked Up' ? 'bg-orange-500' : 'bg-slate-400'
                                         }`} />
                                         {shipment.status}
                                      </div>
                                      <button className="text-slate-300 hover:text-blue-500 transition-colors">
                                         <ArrowRight className="w-4 h-4" />
                                      </button>
                                   </div>
                                </div>
                              ))}
                              <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                 <Plus className="w-4 h-4" /> Assign New Shipment to this Route
                              </button>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </motion.div>
           ))}
        </div>
      </main>
    </div>
  );
}
