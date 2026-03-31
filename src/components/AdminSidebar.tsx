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
  Layers
} from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Routes', icon: Route, href: '/admin/routes' },
    { name: 'Drivers', icon: UserCheck, href: '/admin/drivers' },
    { name: 'Branches', icon: Building2, href: '/admin/branches' },
    { name: 'Address Book', icon: Users, href: '/admin/address-book' },
    { name: 'Import/Export', icon: Layers, href: '/admin/import-export' },
    { name: 'Rates', icon: DollarSign, href: '/admin/rates' },
    { name: 'Shipments', icon: Truck, href: '/admin/shipments' },
    { name: 'Containers', icon: Package, href: '/admin/containers' },
    { name: 'Quotes', icon: FileText, href: '/admin/quotes' },
    { name: 'Materials', icon: Package, href: '/admin/materials' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { name: 'Accounting', icon: DollarSign, href: '/admin/accounting' },
    { name: 'HR Management', icon: Users, href: '/admin/hr' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-slate-950 text-slate-400 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-72'}`}>
      
      {/* Brand Header */}
      <div className="p-8 flex items-center justify-between border-b border-white/5">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[var(--brand-orange)] flex items-center justify-center text-white shadow-lg">
                <Truck className="w-5 h-5" />
             </div>
             <span className="text-lg font-black text-white tracking-tighter uppercase italic">Admin <span className="text-[var(--brand-orange)]">TS</span></span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          {isCollapsed ? <Menu className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2 mt-6">
        {menuItems.map((item) => {
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
         <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-500">
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-bold tracking-tight">Logout</span>}
         </button>
      </div>
    </aside>
  );
}
