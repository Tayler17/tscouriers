'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Plus, Minus, AlertTriangle, ShoppingBag, Archive, X, Save, Trash2,
  ShoppingCart, ChevronDown, ChevronUp, UserCheck, MapPin, Package,
  Receipt, Truck, CheckCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────────
interface Material {
  id: string;
  name: string;
  stock: number;
  min_required: number;
  price: string;
  category: string;
}

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unit_price: number;
  total: number;
}

interface MaterialOrder {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  items: OrderItem[];
  total: string;
  status: string;
  driver_id: string | null;
  driver_name: string | null;
  notes: string;
  created_at: string;
}

interface DriverProfile { id: string; name: string; phone: string; vehicle: string; zone: string; status: string; email?: string; }

// ── Constants ────────────────────────────────────────────────────
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'];

const statusStyle = (s: string) => {
  if (s === 'Delivered')  return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (s === 'Cancelled')  return 'bg-red-50 text-red-500 border-red-100';
  if (s === 'Assigned' || s === 'In Transit') return 'bg-blue-50 text-blue-600 border-blue-100';
  if (s === 'Confirmed')  return 'bg-purple-50 text-purple-600 border-purple-100';
  return 'bg-orange-50 text-orange-500 border-orange-100';
};

const EMPTY_MAT = { name: '', stock: 0, min_required: 10, price: '', category: 'Supplies' };

// ── Component ────────────────────────────────────────────────────
function MaterialsPageInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'stock' | 'orders'>('stock');

  // Stock
  const [materials, setMaterials]     = useState<Material[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showMatModal, setShowMatModal] = useState(false);
  const [matForm, setMatForm]         = useState(EMPTY_MAT);
  const [savingMat, setSavingMat]     = useState(false);

  // Orders
  const [orders, setOrders]           = useState<MaterialOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // New / Edit order modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [savingOrder, setSavingOrder]       = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: '', email: '', phone: '', delivery_address: '', notes: '',
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Assign driver
  const [showAssign, setShowAssign]         = useState(false);
  const [assignOrderId, setAssignOrderId]   = useState<string | null>(null);
  const [drivers, setDrivers]               = useState<DriverProfile[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [assigningSave, setAssigningSave]   = useState(false);

  useEffect(() => { fetchMaterials(); fetchOrders(); }, []);

  // Pre-fill order from address-book redirect (?neworder=1&name=...&phone=...&email=...&address=...)
  useEffect(() => {
    if (searchParams.get('neworder') === '1') {
      setTab('orders');
      setOrderForm({
        customer_name:    searchParams.get('name')    || '',
        email:            searchParams.get('email')   || '',
        phone:            searchParams.get('phone')   || '',
        delivery_address: searchParams.get('address') || '',
        notes: '',
      });
      setOrderItems([]);
      setShowOrderModal(true);
    }
  }, [searchParams]);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchMaterials = async () => {
    setLoading(true);
    const { data } = await supabase.from('materials').select('*').order('id');
    if (data) setMaterials(data as Material[]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase.from('material_orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data as MaterialOrder[]);
    setOrdersLoading(false);
  };

  // ── Stock CRUD ─────────────────────────────────────────────────
  const adjustStock = async (id: string, delta: number) => {
    const item = materials.find(m => m.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    await supabase.from('materials').update({ stock: newStock }).eq('id', id);
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, stock: newStock } : m));
  };

  const handleSaveMat = async () => {
    if (!matForm.name || !matForm.price) return;
    setSavingMat(true);
    const id = `MAT-${Date.now().toString().slice(-4)}`;
    await supabase.from('materials').insert({ id, ...matForm });
    setMaterials(prev => [...prev, { id, ...matForm }]);
    setMatForm(EMPTY_MAT);
    setShowMatModal(false);
    setSavingMat(false);
  };

  const handleDeleteMat = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('materials').delete().eq('id', id);
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  // ── Order Creation ─────────────────────────────────────────────
  const openNewOrder = () => {
    setOrderForm({ customer_name: '', email: '', phone: '', delivery_address: '', notes: '' });
    setOrderItems([]);
    setShowOrderModal(true);
  };

  const addItemToOrder = (mat: Material) => {
    const unitPrice = parseFloat(mat.price.replace(/[^0-9.]/g, '')) || 0;
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === mat.id);
      if (existing) {
        return prev.map(i => i.id === mat.id ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * unitPrice } : i);
      }
      return [...prev, { id: mat.id, name: mat.name, qty: 1, unit_price: unitPrice, total: unitPrice }];
    });
  };

  const updateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems(prev => prev.filter(i => i.id !== id));
    } else {
      setOrderItems(prev => prev.map(i => i.id === id ? { ...i, qty, total: qty * i.unit_price } : i));
    }
  };

  const orderTotal = orderItems.reduce((s, i) => s + i.total, 0);

  const handleCreateOrder = async () => {
    if (!orderForm.customer_name || orderItems.length === 0) return;
    setSavingOrder(true);

    const id      = `MO-${Date.now().toString().slice(-6)}`;
    const total   = `£${orderTotal.toFixed(2)}`;
    const payload = {
      id,
      ...orderForm,
      items:      orderItems,
      total,
      status:     'Pending',
      driver_id:  null,
      driver_name: null,
    };

    await supabase.from('material_orders').insert(payload);
    setOrders(prev => [payload as unknown as MaterialOrder, ...prev]);

    // Auto-deduct stock for each item
    for (const item of orderItems) {
      const mat = materials.find(m => m.id === item.id);
      if (mat) {
        const newStock = Math.max(0, mat.stock - item.qty);
        await supabase.from('materials').update({ stock: newStock }).eq('id', item.id);
        setMaterials(prev => prev.map(m => m.id === item.id ? { ...m, stock: newStock } : m));
      }
    }

    // Auto-create draft invoice in accounting
    await supabase.from('invoices').insert({
      id:     `INV-MO${id.slice(-4)}`,
      client: orderForm.customer_name,
      amount: total,
      status: 'Draft',
      date:   new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      due:    'On Delivery',
    });

    setSavingOrder(false);
    setShowOrderModal(false);
  };

  // ── Order Status ───────────────────────────────────────────────
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('material_orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

    // Sync invoice when status changes
    const order = orders.find(o => o.id === id);
    if (order) {
      const invId = `INV-MO${id.slice(-4)}`;
      if (status === 'Confirmed') {
        await supabase.from('invoices').update({ status: 'Unpaid' }).eq('id', invId);
      } else if (status === 'Delivered') {
        await supabase.from('invoices').update({ status: 'Paid' }).eq('id', invId);
      } else if (status === 'Cancelled') {
        await supabase.from('invoices').update({ status: 'Void' }).eq('id', invId);
      }
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    await supabase.from('material_orders').delete().eq('id', id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // ── Assign Driver ──────────────────────────────────────────────
  const openAssignDriver = async (orderId: string) => {
    setAssignOrderId(orderId);
    setSelectedDriver('');
    setShowAssign(true);
    setLoadingDrivers(true);
    const { data } = await supabase
      .from('drivers')
      .select('id, name, phone, vehicle, zone, status, email')
      .neq('status', 'Off Duty')
      .order('name');
    setDrivers((data || []) as DriverProfile[]);
    setLoadingDrivers(false);
  };

  const handleAssignDriver = async () => {
    if (!assignOrderId || !selectedDriver) return;
    setAssigningSave(true);
    const driver = drivers.find(d => d.id === selectedDriver);
    const order  = orders.find(o => o.id === assignOrderId);

    await supabase.from('material_orders').update({ driver_id: selectedDriver, driver_name: driver?.name || '', status: 'Assigned' }).eq('id', assignOrderId);
    setOrders(prev => prev.map(o => o.id === assignOrderId ? { ...o, driver_id: selectedDriver, driver_name: driver?.name || '', status: 'Assigned' } : o));

    // Sync invoice to Unpaid when assigned
    await supabase.from('invoices').update({ status: 'Unpaid' }).eq('id', `INV-MO${assignOrderId.slice(-4)}`);

    // Notify driver if they have an auth profile (matched by email)
    if (driver?.email) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', driver.email).single();
      if (profile) {
        await supabase.from('notifications').insert({
          user_id: profile.id,
          type:    'assignment',
          title:   'Materials Order Assigned',
          message: `Order ${assignOrderId} for ${order?.customer_name} (${order?.total}) — deliver to: ${order?.delivery_address || 'TBC'}`,
          data:    { order_id: assignOrderId, type: 'material_order' },
        });
      }
    }

    setAssigningSave(false);
    setShowAssign(false);
    setAssignOrderId(null);
  };

  // ── Stats ──────────────────────────────────────────────────────
  const lowStockCount = materials.filter(m => m.stock < m.min_required).length;
  const totalValue    = materials.reduce((sum, m) => sum + (parseFloat(m.price.replace(/[^0-9.]/g, '')) || 0) * m.stock, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const inputCls = "w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all";
  const labelCls = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Warehouse <span className="text-[var(--brand-orange)] font-black">Stock</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Materials & Sales Orders</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button onClick={() => setTab('stock')} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'stock' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>
                Stock
              </button>
              <button onClick={() => setTab('orders')} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'orders' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>
                Orders {pendingOrders > 0 && <span className="w-4 h-4 bg-[var(--brand-orange)] text-white rounded-full text-[9px] flex items-center justify-center">{pendingOrders}</span>}
              </button>
            </div>
            {tab === 'stock' && (
              <button onClick={() => setShowMatModal(true)} className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
            {tab === 'orders' && (
              <button onClick={openNewOrder} className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> New Order
              </button>
            )}
          </div>
        </header>

        {/* ── ORDERS TAB ───────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="space-y-6">
            {/* Order stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Pending',    count: orders.filter(o => o.status === 'Pending').length,   color: 'bg-orange-50 text-orange-500' },
                { label: 'Assigned',   count: orders.filter(o => o.status === 'Assigned' || o.status === 'In Transit').length, color: 'bg-blue-50 text-blue-500' },
                { label: 'Delivered',  count: orders.filter(o => o.status === 'Delivered').length, color: 'bg-emerald-50 text-emerald-500' },
                { label: 'Total',      count: orders.length,                                        color: 'bg-slate-100 text-slate-600' },
              ].map(s => (
                <div key={s.label} className={`${s.color} p-5 rounded-[1.5rem] text-center`}>
                  <p className="text-2xl font-black italic">{s.count}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-[var(--brand-orange)]" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Sales <span className="text-[var(--brand-orange)]">Orders</span></h3>
              </div>

              {ordersLoading ? (
                <div className="p-12 text-center text-slate-400 font-bold">Loading orders…</div>
              ) : orders.length === 0 ? (
                <div className="p-16 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-300 font-bold italic text-sm">No orders yet. Create the first one.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-grow min-w-0">
                          {/* Top row */}
                          <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                            <span className="font-black text-slate-900 italic uppercase tracking-tighter">{order.customer_name}</span>
                            {order.phone && <span className="text-xs text-slate-400 font-bold">{order.phone}</span>}
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusStyle(order.status)}`}>{order.status}</span>
                            <span className="text-sm font-black text-[var(--brand-orange)] ml-auto">{order.total}</span>
                          </div>
                          {/* Second row */}
                          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{order.id}</span>
                            <span className="text-xs font-bold text-slate-500">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                            <span className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            {order.driver_name && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-lg">
                                <Truck className="w-2.5 h-2.5" /> {order.driver_name}
                              </span>
                            )}
                            {order.delivery_address && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <MapPin className="w-2.5 h-2.5" /> {order.delivery_address}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openAssignDriver(order.id)}
                            title="Assign Driver"
                            className="p-2.5 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-all"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs font-bold rounded-xl border border-slate-100 px-3 py-2 outline-none bg-slate-50"
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => deleteOrder(order.id)} className="p-2.5 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="p-2 text-slate-300">
                            {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded items */}
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="mt-4 bg-slate-50 rounded-2xl p-5 space-y-2">
                              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-200">
                                <span>Item</span><span>Qty</span><span>Unit</span><span>Total</span>
                              </div>
                              {(order.items || []).map((item, i) => (
                                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs font-bold text-slate-700">
                                  <span>{item.name}</span>
                                  <span className="text-center">{item.qty}</span>
                                  <span>£{item.unit_price?.toFixed(2) ?? item.unit_price}</span>
                                  <span className="font-black text-slate-900">£{item.total?.toFixed(2) ?? item.total}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
                                <span>Total</span><span className="text-[var(--brand-orange)]">{order.total}</span>
                              </div>
                              {order.notes && (
                                <p className="text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">Notes: {order.notes}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STOCK TAB ─────────────────────────────────────────── */}
        {tab === 'stock' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="w-14 h-14 bg-orange-50 text-[var(--brand-orange)] rounded-2xl flex items-center justify-center mb-6"><AlertTriangle className="w-7 h-7" /></div>
                <h4 className="text-xl font-black text-slate-900 italic uppercase mb-2 tracking-tighter">Low <span className="text-red-500">Stock</span></h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{lowStockCount > 0 ? `${lowStockCount} items need reorder.` : 'All items optimal.'}</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="w-14 h-14 bg-blue-50 text-[var(--brand-blue)] rounded-2xl flex items-center justify-center mb-6"><ShoppingBag className="w-7 h-7" /></div>
                <h4 className="text-xl font-black text-slate-900 italic uppercase mb-2 tracking-tighter">Total <span className="text-[var(--brand-blue)]">SKUs</span></h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{materials.length} products tracked.</p>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><Archive className="w-7 h-7" /></div>
                <h4 className="text-xl font-black italic uppercase mb-2 tracking-tighter">Inventory <span className="text-[var(--brand-orange)]">Value</span></h4>
                <p className="text-2xl font-black italic">£{totalValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 flex justify-between items-center border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Stock <span className="text-[var(--brand-orange)] font-black">Control</span></h3>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{materials.length} Items</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                      <th className="px-8 py-4">Item</th><th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Stock</th><th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Price</th><th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 italic">
                    {loading ? (
                      <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">Loading...</td></tr>
                    ) : materials.map((item, i) => (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="group hover:bg-slate-50/50 transition-colors font-bold">
                        <td className="px-8 py-6">
                          <span className="font-black text-slate-900 tracking-tight">{item.name}</span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.id}</p>
                        </td>
                        <td className="px-8 py-6 text-xs font-black text-slate-500 uppercase italic tracking-tighter">{item.category}</td>
                        <td className="px-8 py-6">
                          <span className={`text-lg font-black ${item.stock < item.min_required ? 'text-red-500' : 'text-slate-900'}`}>{item.stock}</span>
                          <span className="text-[9px] text-slate-400 ml-1 font-bold">/ min {item.min_required}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${item.stock < item.min_required ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {item.stock < item.min_required ? 'Reorder Soon' : 'Optimal'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-[var(--brand-blue)] font-black italic">{item.price}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => adjustStock(item.id, 1)}  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all"><Plus  className="w-4 h-4" /></button>
                            <button onClick={() => adjustStock(item.id, -1)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all"><Minus className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteMat(item.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Add Material Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showMatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMatModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Add <span className="text-[var(--brand-orange)]">Item</span></h2>
                <button onClick={() => setShowMatModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {([{ key: 'name', label: 'Item Name *', ph: 'Standard Barrel' }, { key: 'price', label: 'Unit Price *', ph: '£25.00' }] as { key: keyof typeof EMPTY_MAT; label: string; ph: string }[]).map(f => (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input type="text" value={matForm[f.key] as string} onChange={e => setMatForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className={inputCls} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Stock</label>
                    <input type="number" value={matForm.stock} onChange={e => setMatForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Min Required</label>
                    <input type="number" value={matForm.min_required} onChange={e => setMatForm(p => ({ ...p, min_required: parseInt(e.target.value) || 0 }))} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={matForm.category} onChange={e => setMatForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                    {['Containers', 'Boxes', 'Supplies', 'Packing', 'Equipment'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={handleSaveMat} disabled={savingMat || !matForm.name || !matForm.price} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {savingMat ? 'Saving...' : 'Add to Inventory'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── New Order Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl z-10 p-10 relative max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">New Sales <span className="text-[var(--brand-orange)]">Order</span></h2>
                <button onClick={() => setShowOrderModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-7">
                {/* Customer info */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-orange)] mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center text-[10px]">1</span>
                    Customer Info
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Customer Name *</label>
                      <input type="text" value={orderForm.customer_name} onChange={e => setOrderForm(p => ({ ...p, customer_name: e.target.value }))} placeholder="Full name" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="text" value={orderForm.phone} onChange={e => setOrderForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 000000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="text" value={orderForm.email} onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Delivery Address</label>
                      <input type="text" value={orderForm.delivery_address} onChange={e => setOrderForm(p => ({ ...p, delivery_address: e.target.value }))} placeholder="Full delivery address" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Item selector */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-orange)] mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center text-[10px]">2</span>
                    Select Items
                  </p>
                  {materials.length === 0 ? (
                    <p className="text-sm text-slate-400 font-bold italic">No materials in stock. Add items in the Stock tab first.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {materials.map(mat => {
                        const inOrder = orderItems.find(i => i.id === mat.id);
                        return (
                          <div key={mat.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${inOrder ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`} onClick={() => addItemToOrder(mat)}>
                            <div>
                              <p className={`text-xs font-black italic uppercase ${inOrder ? 'text-white' : 'text-slate-800'}`}>{mat.name}</p>
                              <p className={`text-[9px] font-bold ${inOrder ? 'text-white/50' : 'text-slate-400'}`}>{mat.price} · {mat.stock} in stock</p>
                            </div>
                            {inOrder ? (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <button onClick={() => updateItemQty(mat.id, inOrder.qty - 1)} className="w-6 h-6 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20"><Minus className="w-3 h-3" /></button>
                                <span className="text-white font-black text-sm w-5 text-center">{inOrder.qty}</span>
                                <button onClick={() => updateItemQty(mat.id, inOrder.qty + 1)} className="w-6 h-6 bg-[var(--brand-orange)] text-white rounded-lg flex items-center justify-center hover:bg-orange-600"><Plus className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Order summary */}
                {orderItems.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Order Summary</p>
                    {orderItems.map(item => (
                      <div key={item.id} className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-black">£{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-[var(--brand-orange)]">£{orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={orderForm.notes} onChange={e => setOrderForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any special instructions..." rows={2} className={inputCls + ' resize-none'} />
                </div>

                {/* Accounting note */}
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <Receipt className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-emerald-700">A draft invoice will be created automatically in Accounting. Stock will be deducted on save.</p>
                </div>

                <button onClick={handleCreateOrder} disabled={savingOrder || !orderForm.customer_name || orderItems.length === 0}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {savingOrder ? 'Creating…' : `Create Order · £${orderTotal.toFixed(2)}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Assign Driver Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssign(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Assign <span className="text-[var(--brand-orange)]">Driver</span></h2>
                <button onClick={() => setShowAssign(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Order <span className="text-slate-700">{assignOrderId}</span></p>

              {loadingDrivers ? (
                <div className="py-8 text-center text-slate-400 font-bold text-sm">Loading drivers…</div>
              ) : drivers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-bold text-sm">No drivers found. Create a driver account first.</div>
              ) : (
                <div className="space-y-2 mb-6">
                  {drivers.map(d => (
                    <div key={d.id} onClick={() => setSelectedDriver(d.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selectedDriver === d.id ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${selectedDriver === d.id ? 'bg-[var(--brand-orange)] text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-black text-sm ${selectedDriver === d.id ? 'text-white' : 'text-slate-800'}`}>{d.name}</p>
                        <p className={`text-[10px] ${selectedDriver === d.id ? 'text-white/50' : 'text-slate-400'}`}>{d.vehicle || 'No vehicle'} · {d.zone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleAssignDriver} disabled={assigningSave || !selectedDriver}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <UserCheck className="w-4 h-4" /> {assigningSave ? 'Assigning…' : 'Assign & Notify Driver'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={null}>
      <MaterialsPageInner />
    </Suspense>
  );
}
