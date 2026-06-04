'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MapPin, Phone, Plus, Search, ArrowLeft,
  Edit, Trash2, ChevronRight, LogOut, X, Save, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: string;
  user_id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  relationship: string;
}

const EMPTY_FORM = { name: '', city: '', address: '', phone: '', relationship: 'Family' };
const RELATIONSHIPS = ['Family', 'Friend', 'Business', 'Other'];

export default function CustomerAddressBook() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{ open: boolean; contact: Contact | null }>({ open: false, contact: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') { router.push('/login'); return; }
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
    if (data) setContacts(data as Contact[]);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal({ open: true, contact: null });
  };

  const openEdit = (contact: Contact) => {
    setForm({ name: contact.name, city: contact.city, address: contact.address, phone: contact.phone, relationship: contact.relationship });
    setError('');
    setModal({ open: true, contact });
  };

  const closeModal = () => setModal({ open: false, contact: null });

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) { setError('Name and city are required.'); return; }
    if (!user) return;
    setSaving(true);
    setError('');

    if (modal.contact) {
      const { error: err } = await supabase
        .from('contacts')
        .update({ name: form.name, city: form.city, address: form.address, phone: form.phone, relationship: form.relationship })
        .eq('id', modal.contact.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from('contacts')
        .insert({ id: crypto.randomUUID(), user_id: user.id, name: form.name, city: form.city, address: form.address, phone: form.phone, relationship: form.relationship });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    await loadContacts();
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    setDeleteConfirm(null);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button onClick={() => { logout(); router.push('/'); }} className="p-5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-3xl transition-all">
            <LogOut className="w-6 h-6" />
          </button>
        </header>

        {/* Controls */}
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
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-[var(--brand-blue)] text-white rounded-[2.5rem] font-black italic uppercase tracking-tighter hover:bg-[var(--brand-orange)] transition-all shadow-lg shadow-blue-500/20"
          >
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
                transition={{ delay: i * 0.05 }}
                className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all hover:border-[var(--brand-blue)]/20"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-orange-50 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-[var(--brand-orange)] group-hover:text-white transition-all">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(contact)} className="p-3 bg-slate-50 text-slate-300 hover:bg-blue-50 hover:text-[var(--brand-blue)] rounded-xl transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(contact.id)} className="p-3 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {deleteConfirm === contact.id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-[3.5rem] z-10">
                    <p className="text-sm font-black text-slate-800 uppercase">Delete this contact?</p>
                    <div className="flex gap-3">
                      <button onClick={() => setDeleteConfirm(null)} className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-black uppercase">Cancel</button>
                      <button onClick={() => handleDelete(contact.id)} className="px-6 py-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase">Delete</button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none block mb-1">{contact.relationship}</span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{contact.name}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-600 italic uppercase tracking-tighter">{contact.address}{contact.address ? ', ' : ''}<span className="text-[var(--brand-blue)]">{contact.city}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-600">{contact.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-slate-50">
                    <Link href={`/booking?receiver=${contact.id}`} className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] transition-all">
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
              <p className="text-sm text-slate-400 mt-2">Add your first contact to ship faster!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-12 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">
                  {modal.contact ? 'Edit Contact' : 'New Contact'}
                </h3>
                <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:border-blue-300 transition-colors"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="City *"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:border-blue-300 transition-colors"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Full Address"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:border-blue-300 transition-colors"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:border-blue-300 transition-colors"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
                <select
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:border-blue-300 transition-colors"
                  value={form.relationship}
                  onChange={e => setForm({ ...form, relationship: e.target.value })}
                >
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={closeModal} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-[var(--brand-blue)] text-white text-sm font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
