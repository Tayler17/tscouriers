'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { Plus, Trash2, Save, Newspaper, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface NewsItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  more_info: string;
  urgent: boolean;
}

const EMPTY: Omit<NewsItem, 'id'> = { tag: 'NEW UPDATE', title: '', description: '', more_info: '', urgent: false };

export default function NewsManagement() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data as NewsItem[]);
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addNews = async () => {
    const id = `NEWS-${Date.now().toString().slice(-6)}`;
    const item: NewsItem = { id, ...EMPTY };
    const { error } = await supabase.from('news').insert(item);
    if (error) { showMessage('error', error.message); return; }
    setNews(prev => [item, ...prev]);
    showMessage('success', 'News item added.');
  };

  const updateItem = (id: string, field: keyof NewsItem, value: string | boolean) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const saveItem = async (item: NewsItem) => {
    setSaving(item.id);
    const { error } = await supabase.from('news').upsert(item);
    setSaving(null);
    if (error) showMessage('error', error.message);
    else showMessage('success', 'Saved successfully!');
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this news item?')) return;
    await supabase.from('news').delete().eq('id', id);
    setNews(prev => prev.filter(n => n.id !== id));
    showMessage('success', 'Deleted.');
  };

  if (!user || (user.role !== 'ADMIN' && !user.permissions.canAccessSettings)) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar />
        <main className="flex-grow ml-72 flex items-center justify-center">
          <div className="p-12 text-center font-bold text-red-500">Access Denied</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10">
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-4">
            <Newspaper className="w-10 h-10 text-[var(--brand-orange)]" /> News <span className="text-[var(--brand-orange)]">Management</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Manage the "Latest Updates" section on the Home Page</p>
        </div>
        <button onClick={addNews} className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl text-sm">
          <Plus className="w-5 h-5" /> Add News
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
        <div className="grid grid-cols-1 gap-6">
          {news.map(item => (
            <motion.div key={item.id} layout className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Tag / Category</label>
                    <input type="text" value={item.tag} onChange={e => updateItem(item.id, 'tag', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Title</label>
                    <input type="text" value={item.title} onChange={e => updateItem(item.id, 'title', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:bg-white transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => updateItem(item.id, 'urgent', !item.urgent)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${item.urgent ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {item.urgent ? 'Urgent' : 'Standard'}
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors self-end"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Short Description</label>
                <textarea value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm h-20 resize-none outline-none focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">More Info (shown when expanded)</label>
                <textarea value={item.more_info} onChange={e => updateItem(item.id, 'more_info', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm h-20 resize-none outline-none focus:bg-white transition-all" />
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={() => saveItem(item)} disabled={saving === item.id} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-[var(--brand-blue)] transition-all disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving === item.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
      </main>
    </div>
  );
}
