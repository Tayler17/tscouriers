'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  ShieldCheck, 
  Search,
  Filter,
  MoreVertical,
  Mail,
  User as UserIcon,
  ShieldAlert,
  ChevronRight,
  Settings,
  Zap,
  Save,
  Check
} from 'lucide-react';
import { User, UserPermissions, Role } from '@/context/AuthContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF' as Role,
  });

  useEffect(() => {
    const savedDb = localStorage.getItem('ts_users_db');
    if (savedDb) {
      setUsers(JSON.parse(savedDb));
    }
  }, []);

  const saveToDb = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('ts_users_db', JSON.stringify(newUsers));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateUser = () => {
    const defaultPermissions: UserPermissions = {
      canAccessAccounting: false,
      canAccessHR: false,
      canAccessShipments: true,
      canAccessContainers: true,
      canAccessAnalytics: false,
      canAccessSettings: false,
      canAccessUsers: false,
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.role === 'ADMIN' ? {
        canAccessAccounting: true,
        canAccessHR: true,
        canAccessShipments: true,
        canAccessContainers: true,
        canAccessAnalytics: true,
        canAccessSettings: true,
        canAccessUsers: true,
      } : defaultPermissions
    };

    saveToDb([...users, newUser]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'STAFF' });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      saveToDb(users.filter(u => u.id !== id));
    }
  };

  const togglePermission = (userId: string, permission: keyof UserPermissions) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permission]: !u.permissions[permission]
          }
        };
      }
      return u;
    });
    saveToDb(updatedUsers);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissionKeys: (keyof UserPermissions)[] = [
    'canAccessShipments',
    'canAccessContainers',
    'canAccessAccounting',
    'canAccessHR',
    'canAccessAnalytics',
    'canAccessSettings',
    'canAccessUsers'
  ];

  return (
    <main className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-200">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--brand-orange)] font-black text-xs uppercase tracking-widest bg-orange-50 w-fit px-4 py-2 rounded-full border border-orange-100 shadow-sm">
                 <ShieldCheck className="w-4 h-4" /> Identity & Access
              </div>
              <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Global <br /><span className="text-[var(--brand-orange)]">User Database</span></h1>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-80">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[var(--brand-orange)] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search members..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-white border border-slate-200 pl-16 pr-6 py-5 rounded-3xl outline-none focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-600 shadow-sm"
                 />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary w-full sm:w-auto py-5 px-10 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-sm"
              >
                 <UserPlus className="w-5 h-5" /> New Member
              </button>
           </div>
        </div>

        {/* Users Table / Grid */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 italic">
                       <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Details</th>
                       <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Module Access Permissions</th>
                       <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/30 transition-colors">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                               <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black text-white shadow-xl ${user.role === 'ADMIN' ? 'bg-slate-900' : user.role === 'DRIVER' ? 'bg-[var(--brand-blue)]' : 'bg-[var(--brand-orange)]'}`}>
                                  {user.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="font-black text-slate-900 text-lg flex items-center gap-2 group-hover:text-[var(--brand-orange)] transition-colors">
                                     {user.name}
                                     {user.role === 'ADMIN' && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {user.email}
                                     </span>
                                     <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                     <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-slate-100 text-slate-900' : 'bg-blue-50 text-[var(--brand-blue)]'}`}>
                                        {user.role}
                                     </span>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                               {permissionKeys.map(pk => {
                                 const isActive = user.permissions[pk];
                                 const label = pk.replace('canAccess', '');
                                 return (
                                   <button 
                                     key={pk}
                                     onClick={() => togglePermission(user.id, pk)}
                                     disabled={user.role === 'ADMIN'}
                                     className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm shadow-emerald-500/5' : 'bg-white border-slate-100 text-slate-300'} ${user.role === 'ADMIN' ? 'cursor-not-allowed grayscale opacity-50' : 'hover:scale-105 active:scale-95'}`}
                                   >
                                      {label}
                                   </button>
                                 );
                               })}
                            </div>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'ADMIN'}
                              className={`p-4 rounded-2xl transition-all ${user.role === 'ADMIN' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-red-50 text-slate-300 hover:text-red-500 shadow-sm border border-transparent hover:border-red-100'}`}
                            >
                               <Trash2 className="w-5 h-5" />
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {filteredUsers.length === 0 && (
             <div className="p-20 text-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-slate-200 mx-auto" />
                <h3 className="text-xl font-black text-slate-400 uppercase italic">No identity matches found</h3>
                <p className="text-slate-300 text-sm font-bold uppercase tracking-widest italic">Clear filters or add a new team member.</p>
             </div>
           )}
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
           {isModalOpen && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6"
             >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden"
                >
                   <div className="p-10 space-y-10">
                      <div className="text-center space-y-4">
                         <div className="w-20 h-20 bg-orange-50 text-[var(--brand-orange)] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/5 rotate-6">
                            <UserPlus className="w-10 h-10" />
                         </div>
                         <h2 className="text-3xl font-black text-slate-900 italic uppercase underline decoration-[var(--brand-orange)] decoration-4 underline-offset-8">New Member <span className="text-[var(--brand-orange)]">Onboarding</span></h2>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Full Legal Name</label>
                            <input 
                              type="text" 
                              placeholder="Juan Perez"
                              value={formData.name}
                              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:bg-white outline-none transition-all" 
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Email Address</label>
                            <input 
                              type="email" 
                              placeholder="j.perez@tscouriers.com"
                              value={formData.email}
                              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold focus:bg-white outline-none transition-all" 
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Operational Role</label>
                            <div className="flex gap-4">
                               {['STAFF', 'DRIVER', 'ADMIN'].map(role => (
                                 <button 
                                   key={role}
                                   onClick={() => setFormData(p => ({ ...p, role: role as Role }))}
                                   className={`flex-grow py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role ? 'bg-slate-900 text-white shadow-xl rotate-0' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                                 >
                                    {role}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex gap-4 pt-4">
                         <button 
                           onClick={() => setIsModalOpen(false)}
                           className="flex-grow py-5 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors"
                         >
                            Discard
                         </button>
                         <button 
                           onClick={handleCreateUser}
                           className="flex-grow py-5 rounded-2xl bg-[var(--brand-orange)] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                         >
                            Authorize User
                         </button>
                      </div>
                   </div>
                </motion.div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Global Save Indicator */}
        <AnimatePresence>
           {saved && (
             <motion.div 
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 100 }}
               className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-10 py-5 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-4 z-[200]"
             >
                <Save className="w-5 h-5" />
                <span className="font-black uppercase italic tracking-tighter">Permissions Sync Successful!</span>
                <Check className="w-4 h-4 bg-white/20 rounded-full" />
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </main>
  );
}
