'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Phone, 
  Mail,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_CONTACTS = [
  { id: 1, name: 'Carlos Ruiz', role: 'SENDER', city: 'London', address: '67–69 Nathan Way, SE28 0BQ', phone: '+44 7712345678', email: 'carlos.ruiz@email.com', lastShipment: '28 Mar 2026' },
  { id: 2, name: 'Maria Rodriguez', role: 'RECEIVER', city: 'Santo Domingo', address: 'Av. Winston Churchill 15', phone: '+1 809 555 0123', email: 'm.rodriguez@email.com', lastShipment: '15 Mar 2026' },
  { id: 3, name: 'Elena Gomez', role: 'SENDER', city: 'Madrid', address: 'Calle de Velázquez, 24', phone: '+34 612 345 678', email: 'elena.g@email.com', lastShipment: '02 Mar 2026' },
  { id: 4, name: 'Juan Valdez', role: 'RECEIVER', city: 'Santiago', address: 'Calle del Sol, Edif. Azul', phone: '+1 809 222 3333', email: 'juan.v@email.com', lastShipment: 'N/A' },
  { id: 5, name: 'Sofia Loren', role: 'SENDER', city: 'London', address: '12 Kensington High St', phone: '+44 7822334455', email: 'sofia.l@email.com', lastShipment: '20 Mar 2026' },
  { id: 6, name: 'Miguel Angel', role: 'RECEIVER', city: 'La Vega', address: 'C. Restauración No. 8', phone: '+1 829 444 5555', email: 'miguel.a@email.com', lastShipment: '10 Mar 2026' },
];

export default function AddressBookPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'SENDER' | 'RECEIVER'>('ALL');

  const filteredContacts = MOCK_CONTACTS.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         contact.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || contact.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                    <Users className="w-4 h-4" />
                 </div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Address <span className="text-[var(--brand-orange)] font-black">Book</span></h1>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-11">Manage frequent shipping contacts</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search contacts..." 
                   className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all shadow-inner"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white rounded-2xl font-black italic uppercase tracking-tighter hover:bg-[var(--brand-orange)] transition-all shadow-lg shadow-blue-500/20">
                 <Plus className="w-4 h-4" /> New Contact
              </button>
           </div>
        </header>

        {/* Filters */}
        <div className="flex gap-4">
           {['ALL', 'SENDER', 'RECEIVER'].map((role) => (
             <button
               key={role}
               onClick={() => setFilterRole(role as any)}
               className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filterRole === role ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
             >
               {role}
             </button>
           ))}
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact, i) => (
                <motion.div
                  layout
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                >
                   {/* Role Badge */}
                   <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${contact.role === 'SENDER' ? 'bg-orange-50 text-[var(--brand-orange)]' : 'bg-blue-50 text-[var(--brand-blue)]'}`}>
                      {contact.role}
                   </div>

                   <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner shadow-black/5 ${contact.role === 'SENDER' ? 'bg-orange-50 text-[var(--brand-orange)]' : 'bg-blue-50 text-[var(--brand-blue)]'}`}>
                         {contact.name.charAt(0)}
                      </div>
                      <div className="flex-grow pt-1">
                         <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">{contact.name}</h3>
                         <div className="flex items-center gap-2 text-[var(--brand-blue)] font-bold text-xs mt-1">
                            <MapPin className="w-3 h-3" /> {contact.city}
                         </div>
                      </div>
                      <button className="p-3 bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded-2xl transition-all border border-slate-100">
                         <MoreHorizontal className="w-5 h-5" />
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-50">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                               <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 line-clamp-1">{contact.address}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                               <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{contact.phone}</span>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                               <Mail className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 line-clamp-1">{contact.email}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                               <ExternalLink className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Shipment</p>
                               <span className="text-[11px] font-black text-slate-800 italic uppercase">{contact.lastShipment}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 flex gap-3">
                      <button className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                         <Edit className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                      <Link href="/admin/shipments" className="flex-grow flex items-center justify-center gap-2 py-3 bg-blue-50 text-[var(--brand-blue)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-blue)] hover:text-white transition-all group/btn">
                         Create Shipment <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {filteredContacts.length === 0 && (
           <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Users className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No contacts found matching your search</p>
           </div>
        )}

      </main>
    </div>
  );
}
