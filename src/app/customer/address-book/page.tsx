'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  PlusIcon,
  ChevronRight,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

const MOCK_CUSTOMER_CONTACTS = [
  { id: 1, name: 'Juan Manuel Perez', city: 'Santo Domingo', address: 'Calle 16, Los Prados', phone: '+1 809 123 4567', relationship: 'Family' },
  { id: 2, name: 'Rosa Rodriguez', city: 'Santiago', address: 'Res. El Sol, Apto 4B', phone: '+1 829 333 4444', relationship: 'Friend' },
  { id: 3, name: 'Derca Transportes', city: 'La Romana', address: 'Av. Libertad 45', phone: '+1 809 999 0000', relationship: 'Business' },
];

export default function CustomerAddressBook() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') router.push('/login');
  }, [user]);

  const filteredContacts = MOCK_CUSTOMER_CONTACTS.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 pt-32">
      <div className="container mx-auto max-w-5xl space-y-12">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100">
           <div className="flex items-center gap-6">
              <Link href="/customer" className="p-4 bg-slate-50 text-slate-400 hover:bg-[var(--brand-orange)] hover:text-white rounded-3xl transition-all shadow-sm">
                 <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Address <span className="text-[var(--brand-orange)] font-black">Book</span></h1>
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">Your saved shipping contacts</p>
              </div>
           </div>
           <button onClick={logout} className="p-5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-3xl transition-all">
              <LogOut className="w-6 h-6" />
           </button>
        </header>

        {/* Global Controls */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="relative flex-grow">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or city..." 
                className="w-full pl-16 pr-8 py-5 rounded-[2.5rem] bg-white border border-slate-100 outline-none text-sm font-bold shadow-sm focus:shadow-xl focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="flex items-center justify-center gap-3 px-10 py-5 bg-[var(--brand-blue)] text-white rounded-[2.5rem] font-black italic uppercase tracking-tighter hover:bg-[var(--brand-orange)] transition-all shadow-lg shadow-blue-500/20">
              <Plus className="w-5 h-5" /> Add New Contact
           </button>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <AnimatePresence mode="popLayout">
              {filteredContacts.map((contact, i) => (
                <motion.div
                  layout
                  key={contact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all hover:border-[var(--brand-blue)]/20"
                >
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-orange-50 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-[var(--brand-orange)] group-hover:text-white transition-all">
                         {contact.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="p-3 bg-slate-50 text-slate-300 hover:bg-blue-50 hover:text-[var(--brand-blue)] rounded-xl transition-all">
                            <Edit className="w-4 h-4" />
                         </button>
                         <button className="p-3 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none block mb-1">{contact.relationship}</span>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{contact.name}</h3>
                      </div>

                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-300" />
                            <p className="text-sm font-bold text-slate-600 italic uppercase italic tracking-tighter">{contact.address}, <span className="text-[var(--brand-blue)]">{contact.city}</span></p>
                         </div>
                         <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-300" />
                            <p className="text-sm font-bold text-slate-600 leading-none">{contact.phone}</p>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-slate-50 flex gap-4">
                         <Link href={`/booking?receiver=${contact.id}`} className="flex-grow flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] transition-all">
                            Quick Shipping <ChevronRight className="w-3.5 h-3.5" />
                         </Link>
                      </div>
                   </div>
                </motion.div>
              ))}
           </AnimatePresence>

           {filteredContacts.length === 0 && (
             <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                   <Users className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-300 italic uppercase">Your Address Book is Empty</h4>
                <p className="text-sm text-slate-400 mt-2">Start adding contacts to ship even faster!</p>
             </div>
           )}
        </div>

      </div>
    </main>
  );
}
