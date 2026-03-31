'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Save, Newspaper, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  id: string;
  tag: string;
  title: string;
  desc: string;
  urgent: boolean;
}

export default function NewsManagement() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const savedNews = localStorage.getItem('ts_news_db');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
    } else {
      // Default initial news
      const defaultNews = [
        { id: '1', tag: "MARCH 2026 DEPARTURES", title: "Vessel to Dominican Republic", desc: "Departing soon. Final collection day: Sunday 22nd March.", urgent: true },
        { id: '2', tag: "NEW EXPANDED UK ROUTES", title: "Regional Courier Service", desc: "Weekly routes now confirmed from London to Manchester and Birmingham.", urgent: false }
      ];
      setNews(defaultNews);
      localStorage.setItem('ts_news_db', JSON.stringify(defaultNews));
    }
    setLoading(false);
  }, []);

  const saveNews = (updatedNews: NewsItem[]) => {
    setNews(updatedNews);
    localStorage.setItem('ts_news_db', JSON.stringify(updatedNews));
    setMessage({ type: 'success', text: 'News updated successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const addNews = () => {
    const newItem: NewsItem = {
      id: Date.now().toString(),
      tag: 'NEW UPDATE',
      title: 'Update Title',
      desc: 'Description goes here...',
      urgent: false
    };
    saveNews([newItem, ...news]);
  };

  const deleteNews = (id: string) => {
    saveNews(news.filter(n => n.id !== id));
  };

  const updateItem = (id: string, field: keyof NewsItem, value: any) => {
    const updated = news.map(n => n.id === id ? { ...n, [field]: value } : n);
    setNews(updated);
  };

  if (!user || (user.role !== 'ADMIN' && !user.permissions.canAccessSettings)) {
    return <div className="p-12 text-center font-bold text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-4">
            <Newspaper className="w-10 h-10 text-[var(--brand-orange)]" /> News <span className="text-[var(--brand-orange)]">Management</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Manage the "Latest Updates" section on the Home Page</p>
        </div>
        <button onClick={addNews} className="btn-primary flex items-center gap-2 px-8">
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

      <div className="grid grid-cols-1 gap-6">
        {news.map((item) => (
          <motion.div key={item.id} layout className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
             <div className="flex justify-between items-start gap-4">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Tag / Category</label>
                      <input 
                        type="text" 
                        value={item.tag} 
                        onChange={(e) => updateItem(item.id, 'tag', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Title</label>
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm"
                      />
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                   <button onClick={() => updateItem(item.id, 'urgent', !item.urgent)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${item.urgent ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {item.urgent ? 'Urgent' : 'Standard'}
                   </button>
                   <button onClick={() => deleteNews(item.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors self-end"><Trash2 className="w-5 h-5" /></button>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                <textarea 
                  value={item.desc} 
                  onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm h-24 resize-none"
                />
             </div>
             <div className="flex justify-end pt-4">
                <button onClick={() => saveNews(news)} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-[var(--brand-blue)] transition-all">
                   <Save className="w-4 h-4" /> Save Changes
                </button>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
