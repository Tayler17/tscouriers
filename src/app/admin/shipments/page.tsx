'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Truck, Search, Plus, ChevronRight, PackageCheck, MoreVertical,
  Layers, QrCode, FileText, X, Save, Edit3, Container, UserCheck,
  Filter, Calendar, Handshake, ScanLine
} from 'lucide-react';
import QRScannerModal from '@/components/QRScannerModal';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useData, Shipment } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';

const STATUSES = ['Pending', 'Pickup', 'In Warehouse', 'Ready to Ship', 'In Transit', 'Pending Customs', 'At Port', 'Customs Clearance', 'Delivered'];
const SERVICE_TYPES = ['Sea Freight', 'Air Cargo', 'London Courier', 'Full Container', 'Express'];
const ITEM_TYPES = ['Barrel', 'Box', 'Box x2', 'Box x3', 'Barrel x2', 'Electronics', 'Furniture', 'Clothing', 'Food Items', 'Documents', 'Mixed', 'Other'];

interface PackageItem { type: string; qty: number; weight: string; }

interface ShipmentForm {
  customer: string; sender_phone: string; origin: string;
  sender_id_type: string; sender_id_number: string;
  receiver_name: string; receiver_phone: string; destination: string; delivery_address: string;
  receiver_id_type: string; receiver_id_number: string;
  service_type: string; packages: PackageItem[];
  dimensions: string; declared_value: string; status: string; date: string; notes: string;
}

const ID_TYPES = ['Passport', 'National ID', 'Driver Licence', 'Residence Card', 'Other'];

const EMPTY: ShipmentForm = {
  customer: '', sender_phone: '', origin: '',
  sender_id_type: 'Passport', sender_id_number: '',
  receiver_name: '', receiver_phone: '', destination: '', delivery_address: '',
  receiver_id_type: 'Passport', receiver_id_number: '',
  service_type: 'Sea Freight', packages: [{ type: 'Barrel', qty: 1, weight: '' }],
  dimensions: '', declared_value: '', status: 'Pending',
  date: new Date().toISOString().split('T')[0], notes: '',
};

const EMPTY_CONT = { vessel: '', destination: 'SDQ - Haina', type: '40ft', date: new Date().toISOString().split('T')[0] };

interface AddressContact { id: string; name: string; phone: string; email: string; address: string; city: string; country: string; }
interface DriverProfile { id: string; name: string; phone: string; vehicle: string; zone: string; status: string; email?: string; }
interface PartnerRecord { id: string; name: string; type: string; city: string; country: string; contact_name: string; status: string; }

function ContactCombobox({ label, nameValue, onNameChange, placeholder, onSelect }: {
  label: string; nameValue: string; onNameChange: (v: string) => void;
  placeholder: string; onSelect: (c: AddressContact) => void;
}) {
  const [contacts, setContacts] = useState<AddressContact[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.from('address_book').select('id,name,phone,email,address,city,country').order('name')
      .then(({ data }) => { if (data) setContacts(data as AddressContact[]); });
  }, []);

  const matches = nameValue.trim().length >= 1
    ? contacts.filter(c =>
        c.name.toLowerCase().includes(nameValue.toLowerCase()) ||
        (c.phone && c.phone.includes(nameValue))
      ).slice(0, 6)
    : [];

  const inputCls = "w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all";
  const labelCls = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block";

  return (
    <div className="relative col-span-2">
      <label className={labelCls}>{label}</label>
      <input
        type="text" value={nameValue}
        onChange={e => { onNameChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={inputCls}
      />
      {open && matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-48 overflow-y-auto">
          {matches.map(c => (
            <button key={c.id} type="button"
              onMouseDown={() => { onSelect(c); setOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--brand-blue)] flex items-center justify-center font-black text-xs flex-shrink-0">{c.name.charAt(0)}</div>
              <div>
                <p className="text-xs font-black text-slate-900">{c.name}</p>
                <p className="text-[10px] font-bold text-slate-400">{[c.city, c.country].filter(Boolean).join(', ')}{c.phone ? ` · ${c.phone}` : ''}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ShipmentFormFields({ form, setForm }: { form: ShipmentForm; setForm: (f: ShipmentForm) => void }) {
  const set = (key: keyof ShipmentForm, val: string | PackageItem[]) => setForm({ ...form, [key]: val });
  const inputCls = "w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all";
  const labelCls = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block";

  const updatePkg = (i: number, field: keyof PackageItem, value: string | number) => {
    set('packages', form.packages.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };
  const addPkg = () => set('packages', [...form.packages, { type: 'Barrel', qty: 1, weight: '' }]);
  const removePkg = (i: number) => set('packages', form.packages.filter((_, idx) => idx !== i));

  return (
    <div className="overflow-y-auto max-h-[68vh] pr-1 space-y-6">

      {/* Sender */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-orange)] mb-4 flex items-center gap-2">
          <span className="w-5 h-5 bg-[var(--brand-orange)]/10 rounded-lg flex items-center justify-center text-[10px]">1</span>
          Sender Information
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ContactCombobox
            label="Sender / Customer Name *"
            nameValue={form.customer}
            onNameChange={v => set('customer', v)}
            placeholder="Search address book or type name..."
            onSelect={c => setForm({ ...form, customer: c.name, sender_phone: c.phone || '', origin: [c.address, c.city].filter(Boolean).join(', ') })}
          />
          <div>
            <label className={labelCls}>Sender Phone</label>
            <input value={form.sender_phone} onChange={e => set('sender_phone', e.target.value)} placeholder="+44 7700 000000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Collection Address</label>
            <input value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="London, SE1 1AA" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sender ID Type</label>
            <select value={form.sender_id_type} onChange={e => set('sender_id_type', e.target.value)} className={inputCls}>
              {ID_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sender ID Number</label>
            <input value={form.sender_id_number} onChange={e => set('sender_id_number', e.target.value)} placeholder="e.g. AB123456" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Receiver */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-blue)] mb-4 flex items-center gap-2">
          <span className="w-5 h-5 bg-[var(--brand-blue)]/10 rounded-lg flex items-center justify-center text-[10px]">2</span>
          Receiver Information
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ContactCombobox
            label="Receiver Name"
            nameValue={form.receiver_name}
            onNameChange={v => set('receiver_name', v)}
            placeholder="Search address book or type name..."
            onSelect={c => setForm({ ...form, receiver_name: c.name, receiver_phone: c.phone || '', destination: c.city || c.country || '', delivery_address: [c.address, c.city, c.country].filter(Boolean).join(', ') })}
          />
          <div>
            <label className={labelCls}>Receiver Phone</label>
            <input value={form.receiver_phone} onChange={e => set('receiver_phone', e.target.value)} placeholder="+1 000 000 0000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Destination City *</label>
            <input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="City" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Delivery Address</label>
            <input value={form.delivery_address} onChange={e => set('delivery_address', e.target.value)} placeholder="Street, City, Postcode" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Receiver ID Type</label>
            <select value={form.receiver_id_type} onChange={e => set('receiver_id_type', e.target.value)} className={inputCls}>
              {ID_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Receiver ID Number</label>
            <input value={form.receiver_id_number} onChange={e => set('receiver_id_number', e.target.value)} placeholder="e.g. AB123456" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Packages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="w-5 h-5 bg-slate-100 rounded-lg flex items-center justify-center text-[10px]">3</span>
            Packages
          </p>
          <button type="button" onClick={addPkg} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Type
          </button>
        </div>
        <div className="space-y-2">
          {form.packages.map((pkg, i) => (
            <div key={i} className="grid gap-2 items-end" style={{ gridTemplateColumns: '1fr 120px 90px' + (form.packages.length > 1 ? ' 36px' : '') }}>
              <div>
                {i === 0 && <label className={labelCls}>Item Type</label>}
                <input
                  list="item-types-list"
                  value={pkg.type}
                  onChange={e => updatePkg(i, 'type', e.target.value)}
                  placeholder="Barrel, Box..."
                  className={inputCls}
                />
              </div>
              <div>
                {i === 0 && <label className={labelCls}>Qty</label>}
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => updatePkg(i, 'qty', Math.max(1, pkg.qty - 1))} className="px-3 py-3 text-slate-500 hover:bg-slate-200 font-black transition-colors text-sm">−</button>
                  <span className="flex-1 text-center text-sm font-black text-slate-900">{pkg.qty}</span>
                  <button type="button" onClick={() => updatePkg(i, 'qty', pkg.qty + 1)} className="px-3 py-3 text-slate-500 hover:bg-slate-200 font-black transition-colors text-sm">+</button>
                </div>
              </div>
              <div>
                {i === 0 && <label className={labelCls}>Weight</label>}
                <input value={pkg.weight} onChange={e => updatePkg(i, 'weight', e.target.value)} placeholder="25kg" className={inputCls} />
              </div>
              {form.packages.length > 1 && (
                <button type="button" onClick={() => removePkg(i)} className={`${i === 0 ? 'mt-5' : ''} w-9 h-10 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <datalist id="item-types-list">
            {ITEM_TYPES.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
      </div>

      {/* Service & Status */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <span className="w-5 h-5 bg-slate-100 rounded-lg flex items-center justify-center text-[10px]">4</span>
          Logistics & Status
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Service Type</label>
            <select value={form.service_type} onChange={e => set('service_type', e.target.value)} className={inputCls}>
              {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Dimensions (L×W×H cm)</label>
            <input value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="50×40×30" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Declared Value (£)</label>
            <input value={form.declared_value} onChange={e => set('declared_value', e.target.value)} placeholder="£150.00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ship Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Notes / Special Instructions</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Fragile items, customs..." rows={2} className={inputCls + ' resize-none'} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShipmentsPage() {
  const { shipments, containers, deleteShipment, addShipment, updateShipment, updateShipmentStatus, addContainer, updateContainer } = useData();
  const [selected, setSelected]              = useState<{ id: string; qty: number }[]>([]);
  const [searchTerm, setSearchTerm]          = useState('');
  const [statusFilter, setStatusFilter]      = useState('');
  const [zoneFilter, setZoneFilter]          = useState('');
  const [dateFrom, setDateFrom]              = useState('');
  const [dateTo, setDateTo]                  = useState('');
  const [showFilters, setShowFilters]        = useState(false);
  const [showScanner, setShowScanner]        = useState(false);
  const [scanHighlight, setScanHighlight]    = useState('');

  // Status + note modal
  const [pendingStatus, setPendingStatus]    = useState<{ id: string; status: string } | null>(null);
  const [statusNote, setStatusNote]          = useState('');
  const [activeActionId, setActiveActionId]  = useState<string | null>(null);
  const [showEdit, setShowEdit]              = useState(false);
  const [editingId, setEditingId]            = useState<string | null>(null);
  const [editForm, setEditForm]              = useState<ShipmentForm>(EMPTY);
  const [showAdd, setShowAdd]                = useState(false);
  const [addForm, setAddForm]                = useState<ShipmentForm>(EMPTY);
  const [showConsolidate, setShowConsolidate] = useState(false);
  const [contMode, setContMode]              = useState<'new' | 'existing'>('new');
  const [existingContId, setExistingContId]  = useState('');
  const [contForm, setContForm]              = useState(EMPTY_CONT);
  const [saving, setSaving]                  = useState(false);
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [assignShipmentId, setAssignShipmentId] = useState<string | null>(null);
  const [drivers, setDrivers]                   = useState<DriverProfile[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignType, setAssignType]             = useState<'pickup' | 'delivery' | 'both'>('pickup');
  const [loadingDrivers, setLoadingDrivers]     = useState(false);

  // Partner subcontract
  const [showAssignPartner, setShowAssignPartner]     = useState(false);
  const [partnerShipmentId, setPartnerShipmentId]     = useState<string | null>(null);
  const [partners, setPartners]                       = useState<PartnerRecord[]>([]);
  const [selectedPartnerId, setSelectedPartnerId]     = useState('');
  const [partnerRef, setPartnerRef]                   = useState('');
  const [loadingPartners, setLoadingPartners]         = useState(false);

  const formToShipment = (f: ShipmentForm) => ({
    customer: f.customer,
    destination: f.destination,
    origin: f.origin,
    type: f.packages.map(p => `${p.qty}x ${p.type}`).join(', '),
    weight: f.packages.map(p => p.weight).filter(Boolean).join(' + ') || '',
    status: f.status,
    date: f.date,
    notes: f.notes,
    metadata: {
      sender_phone:      f.sender_phone,
      sender_id_type:    f.sender_id_type,
      sender_id_number:  f.sender_id_number,
      receiver_name:     f.receiver_name,
      receiver_phone:    f.receiver_phone,
      receiver_id_type:  f.receiver_id_type,
      receiver_id_number: f.receiver_id_number,
      delivery_address:  f.delivery_address,
      service_type:      f.service_type,
      packages:          f.packages,
      pieces:            String(f.packages.reduce((sum, p) => sum + p.qty, 0)),
      dimensions:        f.dimensions,
      declared_value:    f.declared_value,
    },
  });

  const openEdit = (s: Shipment) => {
    setEditingId(s.id);
    const pkgs = s.metadata?.packages as PackageItem[] | undefined;
    setEditForm({
      customer:           s.customer,
      sender_phone:       s.metadata?.sender_phone      || '',
      sender_id_type:     s.metadata?.sender_id_type    || 'Passport',
      sender_id_number:   s.metadata?.sender_id_number  || '',
      origin:             s.origin                      || '',
      receiver_name:      s.metadata?.receiver_name     || '',
      receiver_phone:     s.metadata?.receiver_phone    || '',
      receiver_id_type:   s.metadata?.receiver_id_type  || 'Passport',
      receiver_id_number: s.metadata?.receiver_id_number || '',
      destination:        s.destination,
      delivery_address:   s.metadata?.delivery_address  || '',
      service_type:       s.metadata?.service_type      || 'Sea Freight',
      packages:           pkgs && pkgs.length > 0 ? pkgs : [{ type: s.type, qty: parseInt(s.metadata?.pieces || '1'), weight: s.weight }],
      dimensions:         s.metadata?.dimensions        || '',
      declared_value:     s.metadata?.declared_value    || '',
      status:             s.status,
      date:               s.date,
      notes:              s.notes                       || '',
    });
    setShowEdit(true);
    setActiveActionId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.customer) return;
    setSaving(true);
    const sh = shipments.find(s => s.id === editingId);
    const data = formToShipment(editForm);
    await updateShipment(editingId, { ...data, metadata: { ...(sh?.metadata || {}), ...data.metadata } });
    setShowEdit(false);
    setEditingId(null);
    setSaving(false);
  };

  const handleSaveAdd = async () => {
    if (!addForm.customer) return;
    setSaving(true);
    const id = `TS-${Date.now().toString().slice(-4)}`;
    await addShipment({ id, ...formToShipment(addForm) } as Shipment);
    setAddForm(EMPTY);
    setShowAdd(false);
    setSaving(false);
  };

  const handleConsolidate = async () => {
    if (!contForm.vessel) return;
    setSaving(true);
    const id = `CONT-${Date.now().toString().slice(-4)}`;
    await addContainer({ id, vessel: contForm.vessel, flight: '-', destination: contForm.destination, status: 'Loading', count: selected.length, date: contForm.date, type: contForm.type });
    await Promise.all(selected.map(async s => {
      const sh = shipments.find(sh => sh.id === s.id);
      await updateShipment(s.id, { status: 'Ready to Ship', metadata: { ...(sh?.metadata || {}), container_id: id } });
    }));
    setSelected([]);
    setShowConsolidate(false);
    setContForm(EMPTY_CONT);
    setSaving(false);
  };

  const handleAddToExisting = async () => {
    if (!existingContId) return;
    setSaving(true);
    const cont = containers.find(c => c.id === existingContId);
    if (cont) {
      await updateContainer(existingContId, { count: cont.count + selected.length });
      await Promise.all(selected.map(async s => {
        const sh = shipments.find(sh => sh.id === s.id);
        await updateShipment(s.id, { status: 'Ready to Ship', metadata: { ...(sh?.metadata || {}), container_id: existingContId } });
      }));
    }
    setSelected([]);
    setShowConsolidate(false);
    setExistingContId('');
    setSaving(false);
  };

  const handleDeleteOne = (id: string) => {
    if (confirm('Cancel this shipment?')) { deleteShipment(id); setActiveActionId(null); }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.length} shipments?`)) return;
    selected.forEach(s => deleteShipment(s.id));
    setSelected([]);
  };

  const openAssignDriver = async (shipmentId: string) => {
    setAssignShipmentId(shipmentId);
    setSelectedDriverId('');
    setAssignType('pickup');
    setShowAssignDriver(true);
    setActiveActionId(null);
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
    if (!assignShipmentId || !selectedDriverId) return;
    setSaving(true);
    const shipment = shipments.find(s => s.id === assignShipmentId);
    const driver = drivers.find(d => d.id === selectedDriverId);

    // Resolve the driver's auth profile UUID so the driver portal filter
    // (s.metadata?.pickup_driver_id === user.id) matches correctly.
    // user.id is a Supabase auth UUID; selectedDriverId is the drivers table TEXT id.
    let profileId: string | null = null;
    if (driver?.email) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', driver.email).single();
      if (profile) profileId = profile.id;
    }
    // Use UUID if available (so driver portal filter works), otherwise fall back
    const driverId = profileId || selectedDriverId;

    const meta = { ...(shipment?.metadata || {}) };
    if (assignType === 'pickup' || assignType === 'both') { meta.pickup_driver_id = driverId; meta.pickup_driver_name = driver?.name || ''; }
    if (assignType === 'delivery' || assignType === 'both') { meta.delivery_driver_id = driverId; meta.delivery_driver_name = driver?.name || ''; }
    await updateShipment(assignShipmentId, { metadata: meta });

    // Notify driver (only possible if they have an auth profile)
    if (profileId) {
      const typeLabel = assignType === 'both' ? 'Pickup & Delivery' : assignType === 'pickup' ? 'Pickup' : 'Delivery';
      await supabase.from('notifications').insert({
        user_id: profileId, type: 'assignment', title: `${typeLabel} Assigned`,
        message: `Shipment ${assignShipmentId} — ${shipment?.customer || ''} → ${shipment?.destination || ''} has been added to your route.`,
        data: { shipment_id: assignShipmentId, assign_type: assignType },
      });
    }
    setShowAssignDriver(false);
    setAssignShipmentId(null);
    setSaving(false);
  };

  const openAssignPartner = async (shipmentId: string) => {
    setPartnerShipmentId(shipmentId);
    setSelectedPartnerId('');
    setPartnerRef('');
    setShowAssignPartner(true);
    setActiveActionId(null);
    setLoadingPartners(true);
    const { data } = await supabase.from('partners').select('id, name, type, city, country, contact_name, status').eq('status', 'Active').order('name');
    setPartners((data || []) as PartnerRecord[]);
    setLoadingPartners(false);
  };

  const handleAssignPartner = async () => {
    if (!partnerShipmentId || !selectedPartnerId) return;
    setSaving(true);
    const partner = partners.find(p => p.id === selectedPartnerId);
    const shipment = shipments.find(s => s.id === partnerShipmentId);
    await updateShipment(partnerShipmentId, {
      metadata: {
        ...(shipment?.metadata || {}),
        partner_id:   selectedPartnerId,
        partner_name: partner?.name || '',
        partner_ref:  partnerRef,
      }
    });
    setShowAssignPartner(false);
    setPartnerShipmentId(null);
    setSaving(false);
  };

  const updateQty = (id: string, qty: number) =>
    setSelected(prev => prev.map(s => s.id === id ? { ...s, qty: Math.max(1, qty) } : s));

  const toggleSelect = (id: string) => setSelected(prev => {
    const exists = prev.find(s => s.id === id);
    return exists ? prev.filter(s => s.id !== id) : [...prev, { id, qty: 1 }];
  });

  const detectZone = (destination: string): string => {
    const d = destination.toLowerCase();
    if (/dominican|sdq|haina|puerto plata|santiago|santo domingo|la vega|samana|bavaro|punta cana/i.test(d)) return 'Dominican Republic';
    if (/spain|españa|madrid|barcelona|europe|eu|paris|lisbon|portugal|france|germany|italy|netherlands/i.test(d)) return 'Spain & Europe';
    if (/london|uk|england|manchester|birmingham|glasgow|leeds|bristol|liverpool|sheffield/i.test(d)) return 'UK Local';
    if (/usa|united states|miami|new york|ny|nj|boston|canada|toronto|montreal/i.test(d)) return 'USA & Canada';
    return 'Other';
  };

  const ZONES = ['Dominican Republic', 'Spain & Europe', 'UK Local', 'USA & Canada', 'Other'];

  const filtered = shipments.filter(s => {
    if (searchTerm && !s.id.toLowerCase().includes(searchTerm.toLowerCase()) && !s.customer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    if (zoneFilter && detectZone(s.destination) !== zoneFilter) return false;
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(s => selected.some(sel => sel.id === s.id));
  const someSelected = !allSelected && filtered.some(s => selected.some(sel => sel.id === s.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(prev => prev.filter(sel => !filtered.some(s => s.id === sel.id)));
    } else {
      const newSels = filtered.filter(s => !selected.some(sel => sel.id === s.id)).map(s => ({ id: s.id, qty: 1 }));
      setSelected(prev => [...prev, ...newSels]);
    }
  };

  const activeContainers = containers.filter(c => c.status !== 'Delivered');

  const statusBadge = (status: string) => {
    if (status === 'Pending')       return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    if (status === 'Pickup')        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    if (status === 'Ready to Ship') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (status === 'Delivered')     return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AnimatePresence>
        {showScanner && (
          <QRScannerModal
            title="Scan Shipment Label"
            onClose={() => setShowScanner(false)}
            onResult={(id) => {
              setShowScanner(false);
              setSearchTerm(id);
              setScanHighlight(id);
              setTimeout(() => setScanHighlight(''), 3000);
            }}
          />
        )}
      </AnimatePresence>

      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-6">

        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Shipment <span className="text-[var(--brand-orange)] font-black">Management</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">International Logistics Pool</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-orange-50 text-[var(--brand-orange)] hover:bg-[var(--brand-orange)] hover:text-white border border-orange-100 font-black text-xs uppercase tracking-widest transition-all"
              title="Scan shipment label"
            >
              <ScanLine className="w-4 h-4" /> Scan
            </button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search Shipments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none w-64 font-bold text-sm focus:bg-white transition-all" />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest ${showFilters || statusFilter || zoneFilter || dateFrom || dateTo ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
            >
              <Filter className="w-4 h-4" /> Filter {(statusFilter || zoneFilter || dateFrom || dateTo) && <span className="w-2 h-2 rounded-full bg-[var(--brand-orange)] -mr-1" />}
            </button>
            <button onClick={() => { setAddForm(EMPTY); setShowAdd(true); }} className="btn-primary py-3 px-6 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Shipment
            </button>
          </div>
        </header>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 space-y-5">
                {/* Status chips */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Status</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setStatusFilter('')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!statusFilter ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-slate-300'}`}>All</button>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                {/* Zone chips */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Zone</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setZoneFilter('')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!zoneFilter ? 'bg-[var(--brand-blue)] text-white' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-slate-300'}`}>All Zones</button>
                    {ZONES.map(z => (
                      <button key={z} onClick={() => setZoneFilter(zoneFilter === z ? '' : z)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${zoneFilter === z ? 'bg-[var(--brand-blue)] text-white border-[var(--brand-blue)]' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}>{z}</button>
                    ))}
                  </div>
                </div>
                {/* Date range */}
                <div className="flex items-end gap-4">
                  <Calendar className="w-4 h-4 text-slate-400 mb-3 flex-shrink-0" />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  <span className="text-slate-300 font-bold mb-3">→</span>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="mb-3 text-[10px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors">Clear Dates</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection bar */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-8 z-50 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--brand-orange)] rounded-xl flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Selection</p>
                  <p className="text-sm font-black italic">{selected.length} <span className="text-slate-500 font-bold text-xs">Shipments selected</span></p>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex items-center gap-4">
                <button onClick={handleBulkDelete} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase italic tracking-tighter">Delete Selected</button>
                <button onClick={() => setShowConsolidate(true)} className="btn-primary py-3 px-8 rounded-xl flex items-center gap-3 text-sm font-black uppercase italic tracking-tight shadow-lg shadow-orange-500/20">
                  Consolidate <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shipments Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Warehouse <span className="text-[var(--brand-orange)] font-black">Stock</span></h3>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{filtered.length} {statusFilter || 'Total'}</div>
            </div>
            <Link href="/admin/import-export" className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
              <Layers className="w-3.5 h-3.5" /> Import / Export
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4 w-10">
                    <div className="cursor-pointer" onClick={toggleSelectAll}>
                      {allSelected ? (
                        <div className="w-5 h-5 rounded bg-[var(--brand-blue)] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="3"/></svg>
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded border-2 ${someSelected ? 'bg-blue-100 border-blue-300' : 'border-slate-200 hover:border-slate-400'}`}>
                          {someSelected && <div className="w-2 h-2 rounded-sm bg-blue-400 mx-auto mt-0.5" />}
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-8 py-4">Shipment ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Destination</th>
                  <th className="px-8 py-4">Type / Weight</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No shipments found</td></tr>
                ) : filtered.map(item => {
                  const isSelected = selected.some(s => s.id === item.id);
                  const selItem = selected.find(s => s.id === item.id);
                  return (
                    <tr key={item.id} onClick={() => toggleSelect(item.id)} className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${isSelected ? 'bg-blue-50/30' : ''} ${scanHighlight && item.id === scanHighlight ? 'bg-orange-50 ring-2 ring-[var(--brand-orange)] ring-inset' : ''}`}>
                      <td className="px-8 py-6">
                        {isSelected ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 bg-[var(--brand-blue)] text-white rounded-lg flex items-center justify-center"><PackageCheck className="w-3.5 h-3.5" /></div>
                            <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
                              <span className="text-[8px] font-black text-slate-400 uppercase">Qty</span>
                              <input type="number" value={selItem?.qty || 1} onChange={e => updateQty(item.id, parseInt(e.target.value))} className="w-10 h-7 bg-white border border-slate-200 rounded text-center text-[10px] font-black outline-none focus:border-[var(--brand-orange)]" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-slate-100 rounded-lg border-2 border-slate-200" />
                        )}
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900">{item.id}</td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{item.customer}</p>
                          {item.metadata?.service_type && <p className="text-[10px] font-bold text-[var(--brand-orange)] uppercase tracking-widest">{item.metadata.service_type}</p>}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 rounded-md"><Truck className="w-3 h-3 text-blue-500" /></div>
                          <span className="text-[10px] font-black text-[var(--brand-blue)] uppercase italic tracking-tighter">{item.destination}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-700 uppercase italic tracking-tighter">{item.type}</span>
                        {item.weight && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.weight}</div>}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${statusBadge(item.status)}`}>{item.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <Link href={`/admin/shipments/label?id=${item.id}`} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[var(--brand-orange)] hover:text-white transition-all" title="Print Label"><QrCode className="w-4 h-4" /></Link>
                          <Link href={`/admin/shipments/invoice?id=${item.id}`} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[var(--brand-blue)] hover:text-white transition-all" title="Invoice"><FileText className="w-4 h-4" /></Link>
                          <div className="relative">
                            <button onClick={e => { e.stopPropagation(); setActiveActionId(activeActionId === item.id ? null : item.id); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all outline-none">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {activeActionId === item.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveActionId(null)} />
                                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden text-left">
                                    <div className="p-2 space-y-1">
                                      <p className="px-4 pt-2 pb-1 text-[9px] font-black text-slate-300 uppercase tracking-widest">Update Status</p>
                                      {STATUSES.map(s => (
                                        <button key={s} onClick={() => { setPendingStatus({ id: item.id, status: s }); setStatusNote(''); setActiveActionId(null); }} className={`w-full text-left px-4 py-1.5 text-xs font-bold rounded-xl transition-all uppercase italic tracking-tighter ${item.status === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)]'}`}>{s}</button>
                                      ))}
                                      <div className="h-px bg-slate-100 my-1" />
                                      <button onClick={() => openEdit(item)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)] rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2">
                                        <Edit3 className="w-3 h-3" /> Edit Shipment
                                      </button>
                                      <button onClick={() => openAssignDriver(item.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-orange)] rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2">
                                        <UserCheck className="w-3 h-3" /> Assign Driver
                                      </button>
                                      <button onClick={() => openAssignPartner(item.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-blue)] rounded-xl transition-all uppercase italic tracking-tighter flex items-center gap-2">
                                        <Handshake className="w-3 h-3" /> Subcontract Partner
                                      </button>
                                      <button onClick={() => handleDeleteOne(item.id)} className="w-full text-left px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase italic tracking-tighter">Cancel Shipment</button>
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEdit(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">Edit <span className="text-[var(--brand-orange)]">Shipment</span></h2>
                <button onClick={() => setShowEdit(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <ShipmentFormFields form={editForm} setForm={setEditForm} />
              <button onClick={handleSaveEdit} disabled={saving || !editForm.customer} className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">New <span className="text-[var(--brand-orange)]">Shipment</span></h2>
                <button onClick={() => setShowAdd(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <ShipmentFormFields form={addForm} setForm={setAddForm} />
              <button onClick={handleSaveAdd} disabled={saving || !addForm.customer} className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Add Shipment'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Driver Modal */}
      <AnimatePresence>
        {showAssignDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignDriver(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black italic uppercase">Assign <span className="text-[var(--brand-orange)]">Driver</span></h2>
                <button onClick={() => setShowAssignDriver(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                {(['pickup', 'delivery', 'both'] as const).map(t => (
                  <button key={t} onClick={() => setAssignType(t)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all capitalize ${assignType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {t === 'both' ? 'Both' : t}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-6">
                {loadingDrivers ? (
                  <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-widest">Loading drivers...</div>
                ) : drivers.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 font-bold text-xs uppercase tracking-widest">No drivers found</div>
                ) : drivers.map(d => (
                  <button key={d.id} onClick={() => setSelectedDriverId(d.id)} className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${selectedDriverId === d.id ? 'border-[var(--brand-orange)] bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm">{d.name.charAt(0)}</div>
                      <div>
                        <p className="font-black text-slate-900 text-sm uppercase italic">{d.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{d.vehicle || 'No vehicle'} · {d.zone}</p>
                      </div>
                      <span className={`ml-auto text-[9px] font-black uppercase px-2 py-1 rounded-full ${d.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>{d.status}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={handleAssignDriver} disabled={saving || !selectedDriverId} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <UserCheck className="w-4 h-4" /> {saving ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Consolidate Modal */}
      <AnimatePresence>
        {showConsolidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConsolidate(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black italic uppercase">Consolidate <span className="text-[var(--brand-orange)]">Container</span></h2>
                <button onClick={() => setShowConsolidate(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                {(['new', 'existing'] as const).map(mode => (
                  <button key={mode} onClick={() => setContMode(mode)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${contMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    {mode === 'new' ? 'New Container' : 'Add to Existing'}
                  </button>
                ))}
              </div>
              <div className="mb-4 p-4 bg-blue-50 rounded-2xl">
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{selected.length} shipments selected</p>
                <p className="text-[10px] font-bold text-blue-400 mt-1">Selected shipments will be marked "Ready to Ship"</p>
              </div>
              {contMode === 'new' && (
                <div className="space-y-4">
                  {([
                    { key: 'vessel' as const, label: 'Vessel / Flight Name *', ph: 'MSC FABIENNE' },
                    { key: 'destination' as const, label: 'Destination Port', ph: 'SDQ - Haina' },
                  ] as { key: keyof typeof contForm; label: string; ph: string }[]).map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{f.label}</label>
                      <input type="text" value={contForm[f.key]} onChange={e => setContForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Container Type</label>
                      <select value={contForm.type} onChange={e => setContForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold">
                        {['20ft', '40ft', '40ft HC', 'Air Cargo', 'Van'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Departure Date</label>
                      <input type="date" value={contForm.date} onChange={e => setContForm(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold" />
                    </div>
                  </div>
                  <button onClick={handleConsolidate} disabled={saving || !contForm.vessel} className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    <Container className="w-4 h-4" /> {saving ? 'Creating...' : 'Create & Assign'}
                  </button>
                </div>
              )}
              {contMode === 'existing' && (
                <div className="space-y-3">
                  {activeContainers.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">No active containers found.</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {activeContainers.map(cont => (
                        <button key={cont.id} onClick={() => setExistingContId(cont.id)} className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${existingContId === cont.id ? 'border-[var(--brand-orange)] bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-black text-slate-900 text-sm uppercase italic">{cont.vessel || cont.id}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cont.destination} · {cont.type}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${cont.status === 'Loading' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>{cont.status}</span>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">{cont.count} items</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={handleAddToExisting} disabled={saving || !existingContId} className="w-full py-4 mt-2 bg-[var(--brand-blue)] text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    <Layers className="w-4 h-4" /> {saving ? 'Adding...' : 'Add to Container'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Partner Modal */}
      <AnimatePresence>
        {showAssignPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignPartner(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black italic uppercase">Subcontract <span className="text-[var(--brand-blue)]">Partner</span></h2>
                <button onClick={() => setShowAssignPartner(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>

              {partnerShipmentId && (() => { const s = shipments.find(x => x.id === partnerShipmentId); return s ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-2xl">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{s.id} · {s.customer}</p>
                  <p className="text-[10px] font-bold text-blue-400 mt-1">{s.origin || '?'} → {s.destination} · {s.type}</p>
                </div>
              ) : null; })()}

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-4">
                {loadingPartners ? (
                  <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-widest">Loading partners...</div>
                ) : partners.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 font-bold text-xs uppercase tracking-widest">No active partners found</div>
                ) : partners.map(p => (
                  <button key={p.id} onClick={() => setSelectedPartnerId(p.id)} className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${selectedPartnerId === p.id ? 'border-[var(--brand-blue)] bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm">{p.name.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-sm uppercase italic">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{p.type} · {[p.city, p.country].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Partner Reference / AWB / PO# (optional)</label>
                <input value={partnerRef} onChange={e => setPartnerRef(e.target.value)} placeholder="e.g. AWB-2024-001" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all" />
              </div>

              <button onClick={handleAssignPartner} disabled={saving || !selectedPartnerId} className="w-full py-4 bg-[var(--brand-blue)] text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <Handshake className="w-4 h-4" /> {saving ? 'Assigning...' : 'Confirm Subcontract'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status + Note Modal */}
      <AnimatePresence>
        {pendingStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPendingStatus(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl z-10 p-10 relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Changing status to</p>
                  <h2 className="text-xl font-black italic uppercase text-slate-900">{pendingStatus.status}</h2>
                </div>
                <button onClick={() => setPendingStatus(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Note for customer <span className="text-slate-300 normal-case font-bold">(optional)</span></label>
                <textarea
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Your shipment has arrived at our London warehouse and is being processed."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold focus:bg-white transition-all resize-none"
                />
              </div>
              <button
                onClick={async () => {
                  await updateShipmentStatus(pendingStatus.id, pendingStatus.status, statusNote || undefined);
                  setPendingStatus(null);
                  setStatusNote('');
                }}
                disabled={saving}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight text-sm hover:bg-[var(--brand-orange)] transition-all flex items-center justify-center gap-3"
              >
                <Save className="w-4 h-4" /> Confirm Update
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
