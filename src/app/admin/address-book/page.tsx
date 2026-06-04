'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Users, Search, Plus, MoreHorizontal, MapPin, Phone, Mail,
  Edit, Trash2, X, Save, ShoppingCart, Send, PackageCheck, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  type?: 'sender' | 'receiver';
  user_id?: string;
}

type Tab = 'sender' | 'receiver';

const EMPTY = (tab: Tab): Omit<Contact, 'id'> => ({
  name: '', phone: '', email: '', address: '', city: '',
  country: tab === 'sender' ? 'United Kingdom' : 'Dominican Republic',
  notes: '', type: tab,
});

export default function AddressBookPage() {
  const router = useRouter();
  const [tab, setTab]               = useState<Tab>('receiver');
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Contact | null>(null);
  const [form, setForm]             = useState<Omit<Contact, 'id'>>(EMPTY('receiver'));
  const [saving, setSaving]         = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data } = await supabase.from('address_book').select('*').order('name');
    if (data) setContacts(data as Contact[]);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY(tab));
    setShowModal(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, city: c.city, country: c.country, notes: c.notes, type: c.type });
    setShowModal(true);
    setOpenMenuId(null);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name || !form.address) return;
    setSaving(true);
    const payload = { ...form, type: form.type || tab };
    if (editing) {
      await supabase.from('address_book').update(payload).eq('id', editing.id);
      setContacts(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c));
    } else {
      const id = `ADDR-${Date.now().toString().slice(-4)}`;
      await supabase.from('address_book').insert({ id, ...payload });
      setContacts(prev => [{ id, ...payload }, ...prev]);
    }
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    setOpenMenuId(null);
    if (!confirm('Delete this contact?')) return;
    await supabase.from('address_book').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleCreateOrder = (contact: Contact) => {
    setOpenMenuId(null);
    const params = new URLSearchParams({
      neworder: '1', name: contact.name,
      phone: contact.phone || '', email: contact.email || '',
      address: [contact.address, contact.city, contact.country].filter(Boolean).join(', '),
    });
    router.push(`/admin/materials?${params.toString()}`);
  };

  // For a sender contact with no type, treat as receiver for backwards compat
  const tabContacts = contacts.filter(c => {
    const cType = c.type ?? 'receiver';
    return cType === tab;
  });

  const filtered = tabContacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabConfig = {
    sender:   { label: 'Senders',   icon: Send,         color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-600',   desc: 'UK-based shippers' },
    receiver: { label: 'Receivers', icon: PackageCheck, color: 'bg-orange-500', light: 'bg-orange-50 text-orange-600', desc: 'Dominican Republic consignees' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-8">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Address <span className="text-[var(--brand-orange)] font-black">Book</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Shipping contacts directory</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Search contacts..."
                className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all shadow-inner"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white rounded-2xl font-black italic uppercase tracking-tighter hover:bg-[var(--brand-orange)] transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> New {tabConfig[tab].label.replace(/s$/, '')}
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-3">
          {(['sender', 'receiver'] as Tab[]).map(t => {
            const cfg = tabConfig[t];
            const count = contacts.filter(c => (c.type ?? 'receiver') === t).length;
            const Icon = cfg.icon;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter transition-all border-2 ${tab === t ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
              >
                <Icon className="w-4 h-4" />
                {cfg.label}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${tab === t ? 'bg-white/20 text-white' : cfg.light}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" ref={menuRef}>
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-2 bg-white rounded-[2.5rem] p-12 text-center text-slate-400 font-bold border border-slate-100">Loading contacts...</div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">No {tabConfig[tab].label.toLowerCase()} found</p>
                <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest mb-6">{tabConfig[tab].desc}</p>
                <button onClick={openAdd} className="btn-primary py-3 px-8 rounded-xl text-xs font-black uppercase">Add First {tabConfig[tab].label.replace(/s$/, '')}</button>
              </motion.div>
            ) : filtered.map((contact, i) => (
              <motion.div
                layout key={contact.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-visible"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner shadow-black/5 ${tab === 'sender' ? 'bg-blue-50 text-[var(--brand-blue)]' : 'bg-orange-50 text-[var(--brand-orange)]'}`}>
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-grow pt-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">{contact.name}</h3>
                      {contact.user_id && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          <UserCheck className="w-3 h-3" /> User Linked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--brand-blue)] font-bold text-xs mt-1">
                      <MapPin className="w-3 h-3" /> {contact.city}, {contact.country}
                    </div>
                  </div>

                  {/* Three-dot dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === contact.id ? null : contact.id)}
                      className="p-3 bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded-2xl transition-all border border-slate-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {openMenuId === contact.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden min-w-[180px]"
                        >
                          <button onClick={() => handleCreateOrder(contact)} className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-[var(--brand-orange)] hover:bg-orange-50 transition-colors">
                              <ShoppingCart className="w-3.5 h-3.5" /> Create Order
                            </button>
                          <button onClick={() => openEdit(contact)} className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors border-t border-slate-50">
                            <Edit className="w-3.5 h-3.5" /> Edit Contact
                          </button>
                          <button onClick={() => handleDelete(contact.id)} className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><MapPin className="w-4 h-4" /></div>
                      <span className="text-xs font-bold text-slate-600 line-clamp-1">{contact.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-4 h-4" /></div>
                      <span className="text-xs font-bold text-slate-600">{contact.phone || '—'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-4 h-4" /></div>
                      <span className="text-xs font-bold text-slate-600 line-clamp-1">{contact.email || '—'}</span>
                    </div>
                    {contact.notes && <p className="text-xs text-slate-400 italic pl-2">{contact.notes}</p>}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={() => openEdit(contact)} className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleCreateOrder(contact)} className="flex-grow flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-orange)] hover:text-white transition-all">
                    <ShoppingCart className="w-3.5 h-3.5" /> Order
                  </button>
                  <button onClick={() => handleDelete(contact.id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative z-10 p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">
                  {editing ? 'Edit' : 'New'} <span className="text-[var(--brand-orange)]">{tabConfig[tab].label.replace(/s$/, '')}</span>
                </h2>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Type toggle in modal */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                {(['sender', 'receiver'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(form.type ?? tab) === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {tabConfig[t].label.replace(/s$/, '')}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {([
                  { key: 'name',    label: 'Full Name *',  placeholder: 'Carlos Ruiz' },
                  { key: 'phone',   label: 'Phone',        placeholder: '+44 7700 000000' },
                  { key: 'email',   label: 'Email',        placeholder: 'contact@email.com' },
                  { key: 'address', label: 'Address *',    placeholder: '67-69 Nathan Way, SE28 0BQ' },
                  { key: 'city',    label: 'City',         placeholder: 'Santo Domingo' },
                  { key: 'country', label: 'Country',      placeholder: 'Dominican Republic' },
                  { key: 'notes',   label: 'Notes',        placeholder: 'Additional info...' },
                ] as { key: keyof typeof form; label: string; placeholder: string }[]).map(field => (
                  field.key !== 'type' && (
                    <div key={field.key}>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{field.label}</label>
                      <input
                        type="text"
                        value={form[field.key] as string}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all"
                      />
                    </div>
                  )
                ))}
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.address}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : editing ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
