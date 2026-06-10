'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Truck, MapPin, Phone, Calendar, Plus, Search, Trash2, X, Save,
  Edit3, Mail, Package, Navigation, ChevronRight, Car, Route
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  plate: string;
  zone: string;
  status: string;
  shipments_count: number;
  joined_at: string;
}

interface ShipmentRow {
  id: string;
  customer: string;
  destination: string;
  status: string;
  metadata: Record<string, any> | null;
}

const STATUSES = ['Available', 'On Route', 'Off Duty'];
const EMPTY: Omit<Driver, 'id' | 'shipments_count'> = {
  name: '', phone: '', email: '', vehicle: '', plate: '',
  zone: 'London North', status: 'Available',
  joined_at: new Date().toISOString().split('T')[0],
};

const labelCls = 'text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block';
const inputCls = 'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all';

export default function DriversPage() {
  const [drivers, setDrivers]           = useState<Driver[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');

  // Add driver modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState(EMPTY);
  const [saving, setSaving]             = useState(false);

  // Driver detail panel
  const [selected, setSelected]         = useState<Driver | null>(null);
  const [editing, setEditing]           = useState(false);
  const [editForm, setEditForm]         = useState(EMPTY);
  const [driverShipments, setDriverShipments] = useState<ShipmentRow[]>([]);
  const [allShipments, setAllShipments] = useState<ShipmentRow[]>([]);
  const [shipmentTab, setShipmentTab]   = useState<'all' | 'pickup' | 'delivery'>('all');
  const [loadingShipments, setLoadingShipments] = useState(false);

  // Assign modal
  const [showAssign, setShowAssign]     = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignType, setAssignType]     = useState<'pickup' | 'delivery'>('pickup');

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    setLoading(true);

    // Load manually created drivers from the drivers table
    const { data: driverRows } = await supabase.from('drivers').select('*').order('name');
    const fromTable: Driver[] = (driverRows || []) as Driver[];

    // Load auth DRIVER users from profiles (created via User Management)
    const { data: profileRows } = await supabase.from('profiles').select('id, name, email').eq('role', 'DRIVER');
    const tableEmails = new Set(fromTable.map(d => d.email).filter(Boolean));

    // Compute real shipment counts from metadata for all drivers
    const { data: shipmentMeta } = await supabase.from('shipments').select('metadata');
    const counts: Record<string, number> = {};
    (shipmentMeta || []).forEach(s => {
      const p = s.metadata?.pickup_driver_id;
      const d = s.metadata?.delivery_driver_id;
      if (p) counts[p] = (counts[p] || 0) + 1;
      if (d && d !== p) counts[d] = (counts[d] || 0) + 1;
    });

    const fromProfiles: Driver[] = (profileRows || [])
      .filter(p => !tableEmails.has(p.email)) // don't duplicate by email
      .map(p => ({
        id: p.id,
        name: p.name || p.email || 'Driver',
        phone: '', email: p.email || '',
        vehicle: '', plate: '', zone: '—',
        status: 'Available',
        shipments_count: counts[p.id] || 0,  // real count from metadata
        joined_at: new Date().toISOString().split('T')[0],
      }));

    // Also update counts for table drivers using metadata (more accurate than stored count)
    const mergedTable = fromTable.map(d => ({
      ...d,
      shipments_count: counts[d.id] || d.shipments_count || 0,
    }));

    setDrivers([...mergedTable, ...fromProfiles]);
    setLoading(false);
  };

  // Returns true if driver was created via User Management (auth UUID, not DRV-xxx)
  const isAuthDriver = (id: string) =>
    id.length === 36 && id.split('-').length === 5;

  // Resolves the auth UUID for any driver (DRV-xxx or UUID)
  const resolveAuthId = async (driver: Driver): Promise<string | null> => {
    if (isAuthDriver(driver.id)) return driver.id;
    if (!driver.email) return null;
    const { data } = await supabase.from('profiles').select('id').eq('email', driver.email).single();
    return data?.id ?? null;
  };

  const openDriver = async (driver: Driver) => {
    setSelected(driver);
    setEditForm({ name: driver.name, phone: driver.phone, email: driver.email, vehicle: driver.vehicle, plate: driver.plate, zone: driver.zone, status: driver.status, joined_at: driver.joined_at });
    setEditing(false);
    setShipmentTab('all');
    setLoadingShipments(true);

    const authId = await resolveAuthId(driver);

    const { data } = await supabase.from('shipments').select('id, customer, destination, status, metadata');
    if (data) {
      const rows = data as ShipmentRow[];
      setAllShipments(rows);
      // Match by driver table ID OR auth UUID (handles both assignment methods)
      const matched = rows.filter(s => {
        const p = s.metadata?.pickup_driver_id;
        const d = s.metadata?.delivery_driver_id;
        return p === driver.id || d === driver.id ||
               (authId && (p === authId || d === authId));
      });
      setDriverShipments(matched);
      // Update the card count to reflect the real number
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, shipments_count: matched.length } : d));
    }
    setLoadingShipments(false);
  };

  const saveDriverEdit = async () => {
    if (!selected) return;
    setSaving(true);
    if (!isAuthDriver(selected.id)) {
      await supabase.from('drivers').update(editForm).eq('id', selected.id);
    }
    setDrivers(prev => prev.map(d => d.id === selected.id ? { ...d, ...editForm } : d));
    setSelected({ ...selected, ...editForm });
    setEditing(false);
    setSaving(false);
  };

  const updateStatus = async (driverId: string, status: string) => {
    if (!isAuthDriver(driverId)) {
      await supabase.from('drivers').update({ status }).eq('id', driverId);
    }
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status } : d));
    if (selected?.id === driverId) setSelected(prev => prev ? { ...prev, status } : prev);
  };

  const handleAddDriver = async () => {
    if (!addForm.name) return;
    setSaving(true);
    const id = `DRV-${Date.now().toString().slice(-3)}`;
    const record = { id, ...addForm, shipments_count: 0 };
    await supabase.from('drivers').insert(record);
    setDrivers(prev => [...prev, record]);
    setAddForm(EMPTY);
    setShowAddModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this driver from the fleet?')) return;
    await supabase.from('drivers').delete().eq('id', id);
    setDrivers(prev => prev.filter(d => d.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const assignShipment = async (shipment: ShipmentRow) => {
    if (!selected) return;
    setSaving(true);

    // Always save the auth UUID so driver portal can find the shipment
    const authId = await resolveAuthId(selected);
    const assignId = authId || selected.id;

    const field      = assignType === 'pickup'   ? 'pickup_driver_id'   : 'delivery_driver_id';
    const nameField  = assignType === 'pickup'   ? 'pickup_driver_name' : 'delivery_driver_name';
    const newMeta = { ...(shipment.metadata || {}), [field]: assignId, [nameField]: selected.name };

    const { error } = await supabase.from('shipments').update({ metadata: newMeta }).eq('id', shipment.id);
    setSaving(false);
    if (error) { alert('Could not save assignment: ' + error.message); return; }

    const updated = { ...shipment, metadata: newMeta };
    setAllShipments(prev => prev.map(s => s.id === shipment.id ? updated : s));
    setDriverShipments(prev => {
      const exists = prev.find(s => s.id === shipment.id);
      return exists ? prev.map(s => s.id === shipment.id ? updated : s) : [...prev, updated];
    });
    setShowAssign(false);
    setAssignSearch('');
  };

  const unassignShipment = async (shipment: ShipmentRow, type: 'pickup' | 'delivery') => {
    if (!selected) return;
    const field = type === 'pickup' ? 'pickup_driver_id' : 'delivery_driver_id';
    const newMeta = { ...(shipment.metadata || {}) };
    delete newMeta[field];
    await supabase.from('shipments').update({ metadata: newMeta }).eq('id', shipment.id);
    const updated = { ...shipment, metadata: newMeta };
    setAllShipments(prev => prev.map(s => s.id === shipment.id ? updated : s));
    setDriverShipments(prev => {
      const stillAssigned = updated.metadata?.pickup_driver_id === selected.id || updated.metadata?.delivery_driver_id === selected.id;
      return stillAssigned ? prev.map(s => s.id === shipment.id ? updated : s) : prev.filter(s => s.id !== shipment.id);
    });
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const statusColor = (s: string) => s === 'Available' ? 'text-emerald-500' : s === 'On Route' ? 'text-blue-500' : 'text-slate-400';
  const statusDot   = (s: string) => s === 'Available' ? 'bg-emerald-500' : s === 'On Route' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400';
  const statusBg    = (s: string) => s === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s === 'On Route' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200';
  const avatarBg    = (s: string) => s === 'Available' ? 'bg-emerald-50 text-emerald-600' : s === 'On Route' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500';

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const matchesDriver = (val: string | undefined) =>
    !!selected && (val === selected.id);

  const pickupCount   = driverShipments.filter(s => matchesDriver(s.metadata?.pickup_driver_id)).length;
  const deliveryCount = driverShipments.filter(s => matchesDriver(s.metadata?.delivery_driver_id)).length;

  const displayedShipments = driverShipments.filter(s => {
    if (shipmentTab === 'pickup')   return matchesDriver(s.metadata?.pickup_driver_id);
    if (shipmentTab === 'delivery') return matchesDriver(s.metadata?.delivery_driver_id);
    return true; // 'all' tab shows everything
  });

  const assignableShipments = allShipments.filter(s => {
    const field = assignType === 'pickup' ? 'pickup_driver_id' : 'delivery_driver_id';
    if (s.metadata?.[field]) return false; // already has a driver for this type
    if (!assignSearch) return true;
    const q = assignSearch.toLowerCase();
    return s.customer?.toLowerCase().includes(q) ||
           s.id.toLowerCase().includes(q) ||
           s.destination?.toLowerCase().includes(q) ||
           (s.metadata?.delivery_address || '').toLowerCase().includes(q);
  }).slice(0, 20);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Driver <span className="text-[var(--brand-orange)] font-black">Fleet</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel & Route Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search driver or zone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm" />
            </div>
            <button onClick={() => { setAddForm(EMPTY); setShowAddModal(true); }} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-slate-900">{drivers.length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Total Drivers</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-emerald-500">{drivers.filter(d => d.status === 'Available').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Available</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <h3 className="text-3xl font-black text-blue-500">{drivers.filter(d => d.status === 'On Route').length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">On Route</p>
          </div>
        </div>

        {/* Driver Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 bg-white rounded-[2.5rem] p-12 text-center text-slate-400 font-bold border border-slate-100">Loading fleet...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200">
              <Truck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No drivers found</p>
            </div>
          ) : filtered.map((driver, i) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              onClick={() => openDriver(driver)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-orange)] to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-[2.5rem]" />

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${avatarBg(driver.status)}`}>
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{driver.name}</h3>
                    <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mt-0.5 ${statusColor(driver.status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusDot(driver.status)}`} />
                      {driver.status}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--brand-orange)] transition-colors mt-1" />
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5"><Truck className="w-3.5 h-3.5 text-slate-400" /><span className="text-[10px] font-black text-slate-500 uppercase">Vehicle</span></div>
                  <span className="text-[10px] font-black text-slate-900 uppercase">{driver.vehicle || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /><span className="text-[10px] font-black text-slate-500 uppercase">Zone</span></div>
                  <span className="text-[10px] font-black text-slate-900 uppercase">{driver.zone}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shipments</p>
                  <p className="font-black text-[var(--brand-blue)] italic text-xl">{driver.shipments_count}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  {driver.phone && (
                    <a href={`tel:${driver.phone}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors block">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── Driver Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl z-10 relative overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center font-black text-3xl ${avatarBg(selected.status)}`}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{selected.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{selected.id} · {selected.zone}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      {isAuthDriver(selected.id) && (
                        <span className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl text-[9px] font-black uppercase tracking-widest">Auth User</span>
                      )}
                      <select
                        value={selected.status}
                        onChange={e => updateStatus(selected.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border cursor-pointer outline-none ${statusBg(selected.status)}`}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">
                          <Phone className="w-3 h-3" /> {selected.phone}
                        </a>
                      )}
                      {selected.email && (
                        <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
                      <button onClick={saveDriverEdit} disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-[var(--brand-orange)] transition-all">
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Driver
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="flex flex-grow min-h-0 gap-0 overflow-hidden">

                {/* Left — Driver info */}
                <div className="w-72 flex-shrink-0 p-8 border-r border-slate-100 overflow-y-auto space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Profile</p>

                  {editing ? (
                    <div className="space-y-3">
                      {([
                        { key: 'name',    label: 'Full Name',    ph: 'James Wright' },
                        { key: 'phone',   label: 'Phone',        ph: '+44 7700 000000' },
                        { key: 'email',   label: 'Email',        ph: 'driver@tscouriers.com' },
                        { key: 'vehicle', label: 'Vehicle',      ph: 'Ford Transit' },
                        { key: 'plate',   label: 'Plate No.',    ph: 'LK71 ABC' },
                        { key: 'zone',    label: 'Zone',         ph: 'London North' },
                      ] as { key: keyof typeof EMPTY; label: string; ph: string }[]).map(f => (
                        <div key={f.key}>
                          <label className={labelCls}>{f.label}</label>
                          <input type="text" value={editForm[f.key] as string} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className={inputCls} />
                        </div>
                      ))}
                      <div>
                        <label className={labelCls}>Status</label>
                        <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {[
                        { icon: Phone,    label: 'Phone',   value: selected.phone    || '—' },
                        { icon: Mail,     label: 'Email',   value: selected.email    || '—' },
                        { icon: Truck,    label: 'Vehicle', value: selected.vehicle  || '—' },
                        { icon: Car,      label: 'Plate',   value: selected.plate    || '—' },
                        { icon: MapPin,   label: 'Zone',    value: selected.zone },
                        { icon: Calendar, label: 'Joined',  value: selected.joined_at },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                            <p className="text-xs font-black text-slate-800 truncate">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAuthDriver(selected.id) ? (
                    <p className="text-[9px] font-bold text-slate-400 text-center mt-6 px-2">
                      Auth user — manage from <strong>User Management</strong> page
                    </p>
                  ) : (
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all mt-6"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Driver
                    </button>
                  )}
                </div>

                {/* Right — Route & shipments */}
                <div className="flex-grow flex flex-col min-w-0 p-8">

                  {/* Route stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-[1.5rem] text-center">
                      <p className="text-2xl font-black text-amber-600">{pickupCount}</p>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                        <Navigation className="w-3 h-3" /> Pickups
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-[1.5rem] text-center">
                      <p className="text-2xl font-black text-blue-600">{deliveryCount}</p>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" /> Deliveries
                      </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-[1.5rem] text-center">
                      <p className="text-2xl font-black text-white">{selected.shipments_count}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Done</p>
                    </div>
                  </div>

                  {/* Route map — shows all assigned stop addresses */}
                  {driverShipments.length > 0 && (() => {
                    const stops = driverShipments.map(s => s.metadata?.delivery_address || s.destination).filter(Boolean);
                    const WAREHOUSE = '67-69 Nathan Way London SE28 0BQ';
                    const routeUrl = `https://www.google.com/maps/dir/${encodeURIComponent(WAREHOUSE)}/${stops.map(s => encodeURIComponent(s)).join('/')}/${encodeURIComponent(WAREHOUSE)}`;
                    const firstStop = stops[0] || WAREHOUSE;
                    return (
                      <div className="mb-4 rounded-[1.5rem] overflow-hidden border border-slate-100 bg-slate-50">
                        <div style={{ height: 180 }}>
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(firstStop)}&output=embed&z=13`}
                            width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Driver route"
                          />
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stops.length} stop{stops.length !== 1 ? 's' : ''} assigned</p>
                            <p className="text-[10px] font-bold text-slate-700 truncate max-w-[200px]">{firstStop}</p>
                          </div>
                          <a href={routeUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 transition-all">
                            <Navigation className="w-3 h-3" /> Full Route
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tabs + Assign button */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                      {([['all', `All (${driverShipments.length})`], ['pickup', `Pickups (${pickupCount})`], ['delivery', `Deliveries (${deliveryCount})`]] as const).map(([t, label]) => (
                        <button key={t} onClick={() => setShipmentTab(t)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${shipmentTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { setShowAssign(true); setAssignSearch(''); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-orange)] text-white rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Assign Shipment
                    </button>
                  </div>

                  {/* Shipment list */}
                  <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                    {loadingShipments ? (
                      <div className="flex items-center justify-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">Loading route...</div>
                    ) : displayedShipments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Route className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No shipments assigned</p>
                        <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest mt-1">Use "Assign Shipment" to build this driver's route</p>
                      </div>
                    ) : displayedShipments.map(s => {
                      const isPickup   = s.metadata?.pickup_driver_id   === selected.id;
                      const isDelivery = s.metadata?.delivery_driver_id === selected.id;
                      const both = isPickup && isDelivery;
                      return (
                        <div key={s.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${both ? 'bg-purple-100' : isPickup ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            {both       ? <Package   className="w-4 h-4 text-purple-600" />
                            : isPickup  ? <Navigation className="w-4 h-4 text-amber-600" />
                            :             <MapPin    className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{s.customer}</p>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${both ? 'bg-purple-50 text-purple-600' : isPickup ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                {both ? 'Pickup + Delivery' : isPickup ? 'Pickup' : 'Delivery'}
                              </span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${s.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{s.metadata?.delivery_address || s.destination}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase mt-0.5">{s.id}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isPickup && (
                              <button onClick={() => unassignShipment(s, 'pickup')} title="Remove pickup" className="p-1.5 bg-amber-50 text-amber-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all text-[9px] font-black">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                            {isDelivery && (
                              <button onClick={() => unassignShipment(s, 'delivery')} title="Remove delivery" className="p-1.5 bg-blue-50 text-blue-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all text-[9px] font-black">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Assign Shipment Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showAssign && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssign(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl z-10 p-8 relative max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black italic uppercase">Assign <span className="text-[var(--brand-orange)]">Shipment</span></h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">To: {selected?.name}</p>
                </div>
                <button onClick={() => setShowAssign(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
                <button onClick={() => setAssignType('pickup')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${assignType === 'pickup' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Navigation className="w-3 h-3" /> Pickup Driver
                </button>
                <button onClick={() => setAssignType('delivery')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${assignType === 'delivery' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  <MapPin className="w-3 h-3" /> Delivery Driver
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by customer, ID or destination..." value={assignSearch} onChange={e => setAssignSearch(e.target.value)} className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" autoFocus />
              </div>

              {/* List */}
              <div className="flex-grow overflow-y-auto space-y-2">
                {assignableShipments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    {assignSearch ? 'No shipments match your search' : `All shipments already have a ${assignType} driver assigned`}
                  </div>
                ) : assignableShipments.map(s => (
                  <button key={s.id} onClick={() => assignShipment(s)} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[var(--brand-orange)] hover:bg-orange-50/30 transition-all text-left group">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200 flex-shrink-0 group-hover:bg-orange-50 group-hover:border-orange-200 transition-all">
                      <Package className="w-4 h-4 text-slate-400 group-hover:text-[var(--brand-orange)]" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{s.customer}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">{s.metadata?.delivery_address || s.destination}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[9px] font-black text-slate-400 uppercase">{s.id}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${s.status === 'Delivered' ? 'bg-emerald-50 text-emerald-500' : s.status === 'In Transit' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Driver Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Add <span className="text-[var(--brand-orange)]">Driver</span></h2>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {([
                  { key: 'name',    label: 'Full Name *',  ph: 'James Wright' },
                  { key: 'phone',   label: 'Phone',        ph: '+44 7700 000000' },
                  { key: 'email',   label: 'Email',        ph: 'driver@tscouriers.com' },
                  { key: 'vehicle', label: 'Vehicle',      ph: 'Ford Transit' },
                  { key: 'plate',   label: 'Plate Number', ph: 'LK71 ABC' },
                  { key: 'zone',    label: 'Zone',         ph: 'London North' },
                ] as { key: keyof typeof EMPTY; label: string; ph: string }[]).map(f => (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input type="text" value={addForm[f.key] as string} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={addForm.status} onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={handleAddDriver} disabled={saving || !addForm.name} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Add Driver'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
