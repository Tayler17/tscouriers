'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Mail, Trash2, ChevronDown, ChevronUp, Search, X, RefreshCw } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMessages(data as Message[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    setDeleteConfirm(null);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const filtered = messages.filter(m =>
    !searchTerm ||
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 ml-72 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
                Contact <span className="text-[var(--brand-orange)]">Messages</span>
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                {messages.length} message{messages.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <button
              onClick={load}
              className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md text-slate-400 hover:text-[var(--brand-blue)] transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or subject..."
              className="w-full pl-16 pr-8 py-5 rounded-[2.5rem] bg-white border border-slate-100 outline-none text-sm font-bold shadow-sm focus:shadow-xl focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Messages List */}
          {loading ? (
            <div className="py-32 text-center text-slate-400 font-bold">Loading messages…</div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-10 h-10 text-slate-200" />
              </div>
              <h4 className="text-xl font-black text-slate-300 italic uppercase">No Messages</h4>
              <p className="text-sm text-slate-400 mt-2">
                {searchTerm ? 'No messages match your search.' : 'When customers send a message, it will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                  >
                    {/* Row header */}
                    <div
                      className="flex items-center gap-6 px-8 py-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[var(--brand-blue)] flex items-center justify-center font-black text-lg shrink-0">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-black text-slate-900">{msg.name}</span>
                          <span className="text-xs font-bold text-slate-400">{msg.email}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{msg.subject}</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate mt-1">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs font-bold text-slate-400 hidden md:block">{formatDate(msg.created_at)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteConfirm(msg.id); }}
                          className="p-2 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded body */}
                    <AnimatePresence>
                      {expanded === msg.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2 bg-slate-50/50 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <a href={`mailto:${msg.email}`} className="text-sm font-bold text-[var(--brand-blue)] hover:underline">{msg.email}</a>
                              <span className="text-xs text-slate-400 ml-auto">{formatDate(msg.created_at)}</span>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-100">
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <a
                                href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[var(--brand-orange)] transition-all"
                              >
                                <Mail className="w-4 h-4" /> Reply via Email
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Delete confirm overlay */}
                    <AnimatePresence>
                      {deleteConfirm === msg.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10"
                        >
                          <p className="text-sm font-black text-slate-800 uppercase">Delete this message?</p>
                          <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-black uppercase">Cancel</button>
                            <button onClick={() => handleDelete(msg.id)} className="px-6 py-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase">Delete</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
