'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Save, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface FaqItem {
  id: string;
  q: string;
  a: string;
  sort_order: number;
}

export default function FaqManagement() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchFaqs(); }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    if (data) setFaqs(data as FaqItem[]);
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addFaq = async () => {
    const id = `FAQ-${Date.now().toString().slice(-6)}`;
    const item: FaqItem = { id, q: 'New Question?', a: 'Answer goes here...', sort_order: faqs.length + 1 };
    const { error } = await supabase.from('faqs').insert(item);
    if (error) { showMessage('error', error.message); return; }
    setFaqs(prev => [...prev, item]);
    showMessage('success', 'FAQ added.');
  };

  const updateItem = (id: string, field: keyof FaqItem, value: string | number) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const saveItem = async (item: FaqItem) => {
    setSaving(item.id);
    const { error } = await supabase.from('faqs').upsert(item);
    setSaving(null);
    if (error) showMessage('error', error.message);
    else showMessage('success', 'Saved successfully!');
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await supabase.from('faqs').delete().eq('id', id);
    setFaqs(prev => prev.filter(f => f.id !== id));
    showMessage('success', 'Deleted.');
  };

  if (!user || (user.role !== 'ADMIN' && !user.permissions.canAccessSettings)) {
    return <div className="p-12 text-center font-bold text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-4">
            <HelpCircle className="w-10 h-10 text-[var(--brand-orange)]" /> FAQ <span className="text-[var(--brand-orange)]">Management</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Manage the "Common Questions" section on the Home Page</p>
        </div>
        <button onClick={addFaq} className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl text-sm">
          <Plus className="w-5 h-5" /> Add Question
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((item, idx) => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-grow space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Question {idx + 1}</label>
                    <input type="text" value={item.q} onChange={e => updateItem(item.id, 'q', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Answer</label>
                    <textarea value={item.a} onChange={e => updateItem(item.id, 'a', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm h-20 resize-none outline-none focus:bg-white transition-all" />
                  </div>
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors self-start"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => saveItem(item)} disabled={saving === item.id} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[var(--brand-blue)] transition-all disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /> {saving === item.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
