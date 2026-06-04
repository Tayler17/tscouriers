'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Truck, 
  Settings, 
  Users, 
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Route,
  UserCheck,
  Building2,
  DollarSign,
  Layers,
  ShieldCheck,
  Newspaper,
  HelpCircle,
  Inbox,
  Handshake
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, UserPermissions } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', permission: null },
    { name: 'Shipments', icon: Truck, href: '/admin/shipments', permission: 'canAccessShipments' },
    { name: 'Containers', icon: Package, href: '/admin/containers', permission: 'canAccessContainers' },
    { name: 'Routes', icon: Route, href: '/admin/routes', permission: 'canAccessShipments' },
    { name: 'Drivers', icon: UserCheck, href: '/admin/drivers', permission: 'canAccessShipments' },
    { name: 'Partners', icon: Handshake, href: '/admin/partners', permission: 'canAccessShipments' },
    { name: 'Branches', icon: Building2, href: '/admin/branches', permission: 'canAccessSettings' },
    { name: 'Address Book', icon: Users, href: '/admin/address-book', permission: 'canAccessShipments' },
    { name: 'Import/Export', icon: Layers, href: '/admin/import-export', permission: 'canAccessShipments' },
    { name: 'Rates', icon: DollarSign, href: '/admin/rates', permission: 'canAccessAccounting' },
    { name: 'Quotes', icon: FileText, href: '/admin/quotes', permission: 'canAccessShipments' },
    { name: 'Materials', icon: Package, href: '/admin/materials', permission: 'canAccessShipments' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics', permission: 'canAccessAnalytics' },
    { name: 'Accounting', icon: DollarSign, href: '/admin/accounting', permission: 'canAccessAccounting' },
    { name: 'HR Management', icon: Users, href: '/admin/hr', permission: 'canAccessHR' },
    { name: 'User Management', icon: ShieldCheck, href: '/admin/users', permission: 'canAccessUsers' },
    { name: 'News Updates', icon: Newspaper, href: '/admin/settings/news', permission: 'canAccessSettings' },
    { name: 'Common FAQs', icon: HelpCircle, href: '/admin/settings/faqs', permission: 'canAccessSettings' },
    { name: 'Service Plans', icon: DollarSign, href: '/admin/settings/plans', permission: 'canAccessSettings' },
    { name: 'Messages', icon: Inbox, href: '/admin/messages', permission: 'canAccessSettings' },
    { name: 'Settings', icon: Settings, href: '/admin/settings', permission: 'canAccessSettings' },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (!item.permission) return true;
    if (!user) return false;
    if (user.role === 'ADMIN') return true; // ADMIN always sees everything
    return user.permissions[item.permission as keyof UserPermissions];
  });

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-slate-950 text-slate-400 transition-all duration-300 z-50 flex flex-col overflow-hidden ${isCollapsed ? 'w-20' : 'w-72'}`}>

      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" title="Go to Home">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-orange)] flex items-center justify-center text-white shadow-lg">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white tracking-tighter uppercase italic">Admin <span className="text-[var(--brand-orange)]">TS</span></span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="w-10 h-10 flex items-center justify-center bg-[var(--brand-orange)]/10 hover:bg-[var(--brand-orange)] rounded-xl transition-all text-[var(--brand-orange)] hover:text-white" title="Go to Home">
            <Truck className="w-5 h-5" />
          </Link>
        )}
        {/* Toggle button — wide enough to click easily */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center bg-white/5 hover:bg-[var(--brand-orange)] hover:text-white rounded-xl transition-all text-slate-400 ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Visible edge tab when collapsed — extra click target */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-20 bg-[var(--brand-orange)] rounded-r-xl flex items-center justify-center hover:w-8 transition-all z-10"
          title="Expand menu"
        >
          <ChevronLeft className="w-3 h-3 text-white rotate-180" />
        </button>
      )}

      {/* Navigation - Force Scroll */}
      <nav className="flex-grow h-0 px-3 py-2 space-y-0.5 overflow-y-scroll custom-scrollbar-dark">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${isActive ? 'bg-[var(--brand-orange)] text-white shadow-xl shadow-orange-500/10' : 'hover:bg-white/5 hover:text-white'}`}
            >
               <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
               {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="p-6 border-t border-white/5">
         <div className="mb-4 px-4">
            {!isCollapsed && user && (
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.role}</p>
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
               </div>
            )}
         </div>
         <button 
           onClick={handleLogout}
           className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-500"
         >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-bold tracking-tight">Logout</span>}
         </button>
      </div>

      <style jsx>{`
        .custom-scrollbar-dark { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.25) transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: var(--brand-orange); }
      `}</style>
    </aside>
  );
}
