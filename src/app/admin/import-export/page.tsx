'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Upload, Download, FileText, AlertCircle, CheckCircle2, Layers,
  ArrowRight, FileSpreadsheet, XCircle, X, Users, Package,
  Book, Printer, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';

type UploadStatus = 'idle' | 'processing' | 'success' | 'error';
type ImportTab = 'shipments' | 'contacts' | 'users' | 'zones' | 'rates';

// ── Column definitions ────────────────────────────────────────
const SHIPMENT_COLS = [
  { key: 'id',               label: 'Shipment ID',      on: true  },
  { key: 'customer',         label: 'Customer',          on: true  },
  { key: 'origin',           label: 'Origin',            on: false },
  { key: 'destination',      label: 'Destination',       on: true  },
  { key: 'type',             label: 'Item Type',         on: true  },
  { key: 'weight',           label: 'Weight',            on: true  },
  { key: 'status',           label: 'Status',            on: true  },
  { key: 'date',             label: 'Date',              on: true  },
  { key: 'service_type',     label: 'Service Type',      on: false },
  { key: 'pieces',           label: 'Pieces',            on: false },
  { key: 'declared_value',   label: 'Declared Value',    on: false },
  { key: 'receiver_name',    label: 'Receiver Name',     on: false },
  { key: 'delivery_address', label: 'Delivery Address',  on: false },
  { key: 'notes',            label: 'Notes',             on: false },
];

const MANIFEST_COLS = [
  { key: 'id',          label: 'Container ID',    on: true  },
  { key: 'vessel',      label: 'Vessel Name',     on: true  },
  { key: 'flight',      label: 'Flight No.',      on: false },
  { key: 'destination', label: 'Destination Port',on: true  },
  { key: 'type',        label: 'Container Type',  on: true  },
  { key: 'status',      label: 'Status',          on: true  },
  { key: 'count',       label: 'No. of Pieces',   on: true  },
  { key: 'date',        label: 'Departure Date',  on: true  },
];

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, any>[], cols: { key: string; label: string }[]) {
  const header = cols.map(c => `"${c.label}"`).join(',');
  const body   = rows.map(r =>
    cols.map(c => {
      const v = c.key.includes('.') ? c.key.split('.').reduce((o: any, k) => o?.[k], r) : r[c.key] ?? r.metadata?.[c.key] ?? '';
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...body].join('\n');
}

function printPdf(title: string, rows: Record<string, any>[], cols: { key: string; label: string }[]) {
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;padding:24px;font-size:11px;color:#111}
  h1{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px}
  p.sub{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px}
  table{width:100%;border-collapse:collapse}
  th{background:#111;color:#fff;padding:8px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px}
  td{padding:7px 10px;border-bottom:1px solid #eee;font-size:10px}
  tr:nth-child(even) td{background:#f9f9f9}
  .print-btn{background:#111;color:#fff;border:none;padding:8px 20px;cursor:pointer;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;border-radius:4px}
  @media print{.print-btn{display:none}}
</style></head><body>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<h1>${title}</h1>
<p class="sub">Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit',month:'short',year:'numeric'})} · ${rows.length} records</p>
<table>
  <thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr>${cols.map(c => {
    const v = r[c.key] ?? r.metadata?.[c.key] ?? '';
    return `<td>${String(v)}</td>`;
  }).join('')}</tr>`).join('')}</tbody>
</table>
</body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

export default function ImportExportPage() {
  const { shipments, containers, refetch } = useData();

  // Import state
  const [importTab, setImportTab]     = useState<ImportTab>('shipments');
  const [dragActive, setDragActive]   = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [log, setLog]                 = useState<string[]>([]);

  // Export state
  const [shipColSel, setShipColSel]     = useState(SHIPMENT_COLS.map(c => ({ ...c })));
  const [manifColSel, setManifColSel]   = useState(MANIFEST_COLS.map(c => ({ ...c })));
  const [showShipCols, setShowShipCols] = useState(false);
  const [showManifCols, setShowManifCols] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo]     = useState('');

  // ── Import handlers ──────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    setUploadStatus('processing');
    setLog([`Reading: ${file.name}...`]);

    try {
      const text    = await file.text();
      const lines   = text.trim().split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        setLog(['Error: File is empty or has no data rows.']); setUploadStatus('error'); return;
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      setLog(prev => [...prev, `Detected columns: ${headers.join(', ')}`]);

      if (importTab === 'shipments') await importShipments(lines, headers);
      else if (importTab === 'contacts') await importContacts(lines, headers);
      else if (importTab === 'zones') await importZones(lines, headers);
      else if (importTab === 'rates') await importRates(lines, headers);
      else await importUsers(lines, headers);
    } catch (err) {
      setLog(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
      setUploadStatus('error');
    }
  };

  const parseRow = (line: string, headers: string[]) => {
    const vals: Record<string, string> = {};
    const raw = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    headers.forEach((h, i) => { vals[h] = raw[i] || ''; });
    return vals;
  };

  const importShipments = async (lines: string[], headers: string[]) => {
    const batchId = Date.now().toString().slice(-6);
    const records = lines.slice(1).map((line, idx) => {
      const v = parseRow(line, headers);
      return {
        id:          v.id || `TS-${batchId}-${idx + 1}`,
        customer:    v.customer || 'Unknown',
        destination: v.destination || '',
        origin:      v.origin || '',
        type:        v.type || 'Barrel',
        weight:      v.weight || '-',
        status:      v.status || 'In Warehouse',
        date:        v.date || new Date().toISOString().split('T')[0],
        notes:       v.notes || '',
        metadata: {
          service_type:     v.service_type || '',
          receiver_name:    v.receiver_name || '',
          receiver_phone:   v.receiver_phone || '',
          delivery_address: v.delivery_address || '',
          declared_value:   v.declared_value || '',
          pieces:           v.pieces || '1',
        },
      };
    });
    setLog(prev => [...prev, `Parsed ${records.length} shipments, inserting...`]);
    const { error } = await supabase.from('shipments').insert(records);
    if (error) { setLog(prev => [...prev, `Error: ${error.message}`]); setUploadStatus('error'); return; }
    await refetch();
    setLog(prev => [...prev, `Success: ${records.length} shipments imported.`]);
    setUploadStatus('success');
  };

  const importContacts = async (lines: string[], headers: string[]) => {
    const batchId = Date.now().toString().slice(-6);
    const records = lines.slice(1).map((line, idx) => {
      const v = parseRow(line, headers);
      return {
        id:      v.id || `ADDR-${batchId}-${idx + 1}`,
        name:    v.name || 'Unknown',
        phone:   v.phone || '',
        email:   v.email || '',
        address: v.address || '',
        city:    v.city || '',
        country: v.country || '',
        notes:   v.notes || '',
      };
    });
    setLog(prev => [...prev, `Parsed ${records.length} contacts, inserting...`]);
    const { error } = await supabase.from('address_book').insert(records);
    if (error) { setLog(prev => [...prev, `Error: ${error.message}`]); setUploadStatus('error'); return; }
    setLog(prev => [...prev, `Success: ${records.length} contacts imported.`]);
    setUploadStatus('success');
  };

  const importUsers = async (lines: string[], headers: string[]) => {
    setLog(prev => [...prev, 'Note: User import updates profile data for existing accounts only.']);
    const records = lines.slice(1).map(line => {
      const v = parseRow(line, headers);
      return { email: v.email, name: v.name || '', role: (v.role || 'CUSTOMER').toUpperCase() };
    }).filter(r => r.email);
    setLog(prev => [...prev, `Updating ${records.length} profiles...`]);
    let updated = 0;
    for (const r of records) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', r.email).single();
      if (profile) {
        await supabase.from('profiles').update({ name: r.name, role: r.role }).eq('id', profile.id);
        updated++;
      }
    }
    setLog(prev => [...prev, `Success: ${updated}/${records.length} profiles updated. Unmatched emails were skipped.`]);
    setUploadStatus('success');
  };

  const importZones = async (lines: string[], headers: string[]) => {
    const batchId = Date.now().toString().slice(-6);
    const records = lines.slice(1).map((line, idx) => {
      const v = parseRow(line, headers);
      return {
        id:               v.id || `ZONE-${batchId}-${idx + 1}`,
        name:             v.name || 'Unnamed Zone',
        origin_country:   v.origin_country || 'United Kingdom',
        origin_keywords:  v.origin_keywords || '',
        dest_country:     v.dest_country || 'Dominican Republic',
        dest_keywords:    v.dest_keywords || '',
      };
    });
    setLog(prev => [...prev, `Parsed ${records.length} zones, inserting...`]);
    const { error } = await supabase.from('rate_zones').insert(records);
    if (error) { setLog(prev => [...prev, `Error: ${error.message}`]); setUploadStatus('error'); return; }
    setLog(prev => [...prev, `Success: ${records.length} zones imported.`]);
    setUploadStatus('success');
  };

  const importRates = async (lines: string[], headers: string[]) => {
    const batchId = Date.now().toString().slice(-6);
    const records = lines.slice(1).map((line, idx) => {
      const v = parseRow(line, headers);
      return {
        id:          v.id || `RATE-${batchId}-${idx + 1}`,
        item:        v.item || v.name || 'Unnamed Rate',
        rate:        v.rate || '£0',
        category:    v.category || 'General',
        status:      v.status || 'Active',
        zone_ids:    v.zone_ids ? v.zone_ids.split(';').map((z: string) => z.trim()) : [],
      };
    });
    setLog(prev => [...prev, `Parsed ${records.length} rates, inserting...`]);
    const { error } = await supabase.from('rates').insert(records);
    if (error) { setLog(prev => [...prev, `Error: ${error.message}`]); setUploadStatus('error'); return; }
    setLog(prev => [...prev, `Success: ${records.length} rates imported.`]);
    setUploadStatus('success');
  };

  // ── Templates ────────────────────────────────────────────────
  const downloadTemplate = () => {
    const templates: Record<ImportTab, string> = {
      shipments: 'id,customer,origin,destination,type,weight,status,date,service_type,receiver_name,receiver_phone,delivery_address,declared_value,pieces,notes\n,John Doe,London SE28,Santo Domingo,Barrel,25kg,In Warehouse,2025-06-01,Sea Freight,Maria Doe,+1809000000,Calle Principal 1,,1,',
      contacts:  'id,name,phone,email,address,city,country,notes\n,Carlos Ruiz,+44 7700 000000,carlos@email.com,67-69 Nathan Way SE28 0BQ,London,United Kingdom,',
      users:     'email,name,role\njohn@example.com,John Smith,STAFF\nmaria@example.com,Maria Garcia,DRIVER',
      zones:     'id,name,origin_country,origin_keywords,dest_country,dest_keywords\n,London to SDQ,United Kingdom,"SE28,SE1,E1",Dominican Republic,"Santo Domingo,Santiago"',
      rates:     'id,item,rate,category,status,zone_ids\n,Barrel (40L),£95 / per barrel,Sea Freight,Active,ZONE-001;ZONE-002',
    };
    downloadFile(templates[importTab], `${importTab}-import-template.csv`, 'text/csv');
  };

  // ── Export handlers ──────────────────────────────────────────
  const activeCols = shipColSel.filter(c => c.on);

  const exportShipments = () => {
    let rows = statusFilter === 'All' ? shipments : shipments.filter(s => s.status === statusFilter);
    if (exportDateFrom) rows = rows.filter(s => s.date >= exportDateFrom);
    if (exportDateTo)   rows = rows.filter(s => s.date <= exportDateTo);
    if (exportFormat === 'csv') {
      downloadFile(toCsv(rows as any[], activeCols), `shipments-${Date.now()}.csv`, 'text/csv');
    } else {
      printPdf('Shipment Report', rows as any[], activeCols);
    }
  };

  const exportDriverReport = async () => {
    const { data: drivers } = await supabase.from('profiles').select('id,name,email').eq('role', 'DRIVER');
    if (!drivers || !drivers.length) return;
    const reportRows = drivers.flatMap((d: { id: string; name: string; email: string }) => {
      const pickups    = shipments.filter(s => s.metadata?.pickup_driver_id   === d.id);
      const deliveries = shipments.filter(s => s.metadata?.delivery_driver_id === d.id);
      return [
        ...pickups.map(s => ({ driver: d.name, email: d.email, shipment_id: s.id, customer: s.customer, destination: s.destination, assignment: 'Pickup', status: s.status, date: s.date })),
        ...deliveries.filter(s => s.metadata?.delivery_driver_id !== s.metadata?.pickup_driver_id || !pickups.some(p => p.id === s.id))
          .map(s => ({ driver: d.name, email: d.email, shipment_id: s.id, customer: s.customer, destination: s.destination, assignment: 'Delivery', status: s.status, date: s.date })),
      ];
    });
    const cols = [
      { key: 'driver', label: 'Driver' }, { key: 'email', label: 'Email' },
      { key: 'shipment_id', label: 'Shipment ID' }, { key: 'customer', label: 'Customer' },
      { key: 'destination', label: 'Destination' }, { key: 'assignment', label: 'Assignment' },
      { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' },
    ];
    if (exportFormat === 'csv') {
      downloadFile(toCsv(reportRows, cols), `driver-report-${Date.now()}.csv`, 'text/csv');
    } else {
      printPdf('Driver Assignment Report', reportRows, cols);
    }
  };

  const exportManifest = (contId?: string) => {
    const cols = manifColSel.filter(c => c.on);
    const rows = contId ? containers.filter(c => c.id === contId) : containers;
    if (exportFormat === 'csv') {
      downloadFile(toCsv(rows as any[], cols), `container-manifest-${Date.now()}.csv`, 'text/csv');
    } else {
      printPdf('Container Manifest', rows as any[], cols);
    }
  };

  const exportAddressBook = async () => {
    const { data } = await supabase.from('address_book').select('*').order('name');
    if (!data) return;
    const cols = [
      { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' }, { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' }, { key: 'country', label: 'Country' },
    ];
    if (exportFormat === 'csv') {
      downloadFile(toCsv(data, cols), `address-book-${Date.now()}.csv`, 'text/csv');
    } else {
      printPdf('Address Book', data, cols);
    }
  };

  const STATUSES = ['All', 'Pending', 'Pickup', 'In Warehouse', 'Ready to Ship', 'In Transit', 'Delivered', 'Pending Customs'];

  const importTabMeta: Record<ImportTab, { icon: React.ReactNode; label: string; hint: string }> = {
    shipments: { icon: <Package className="w-4 h-4" />,          label: 'Shipments', hint: 'customer, origin, destination, type, weight…' },
    contacts:  { icon: <Book className="w-4 h-4" />,             label: 'Contacts',  hint: 'name, phone, email, address, city, country' },
    users:     { icon: <Users className="w-4 h-4" />,            label: 'Users',     hint: 'email, name, role (updates existing accounts)' },
    zones:     { icon: <SlidersHorizontal className="w-4 h-4" />,label: 'Zones',     hint: 'name, origin_country, origin_keywords, dest_country, dest_keywords' },
    rates:     { icon: <FileText className="w-4 h-4" />,         label: 'Rates',     hint: 'item, rate, category, status, zone_ids (semicolon-separated)' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-grow ml-72 p-10 space-y-10">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Import / <span className="text-[var(--brand-orange)] font-black">Export</span></h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Bulk Manifest & Data Logistics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Format toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              {(['csv', 'pdf'] as const).map(f => (
                <button key={f} onClick={() => setExportFormat(f)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${exportFormat === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={downloadTemplate} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              <Download className="w-4 h-4" /> Template
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── LEFT: Import ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Import tabs */}
            <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
              {(Object.entries(importTabMeta) as [ImportTab, typeof importTabMeta[ImportTab]][]).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => { setImportTab(key); setUploadStatus('idle'); setLog([]); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${importTab === key ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {meta.icon} {meta.label}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag} onDragOver={handleDrag}
              onDragLeave={handleDrag} onDrop={handleDrop}
              className={`relative h-[420px] border-4 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center bg-white group ${dragActive ? 'border-[var(--brand-orange)] bg-orange-50/50' : 'border-slate-100'}`}
            >
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Upload className={`w-9 h-9 ${dragActive ? 'text-[var(--brand-orange)]' : 'text-slate-300'}`} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-1">Drop CSV / Excel Here</h2>
              <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] mb-2 uppercase">{importTabMeta[importTab].hint}</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-6">Importing: <span className="text-slate-500">{importTabMeta[importTab].label}</span></p>

              <label className="btn-primary py-3 px-8 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest italic shadow-xl shadow-orange-500/20">
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
                Choose File
              </label>

              <AnimatePresence>
                {uploadStatus !== 'idle' && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center p-10 z-10">
                    {uploadStatus === 'processing' && (
                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-[var(--brand-orange)] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="font-black text-slate-900 uppercase tracking-widest italic text-sm">Processing...</p>
                      </div>
                    )}
                    {uploadStatus === 'success' && (
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 className="w-10 h-10" /></div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-900 italic uppercase">Import Complete</h3>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{log[log.length - 1]}</p>
                        </div>
                        <button onClick={() => { setUploadStatus('idle'); setLog([]); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase italic hover:bg-[var(--brand-orange)] transition-all">Done</button>
                      </div>
                    )}
                    {uploadStatus === 'error' && (
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><XCircle className="w-10 h-10" /></div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-900 italic uppercase">Import Failed</h3>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{log[log.length - 1]}</p>
                        </div>
                        <button onClick={() => { setUploadStatus('idle'); setLog([]); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase italic hover:bg-red-500 transition-all">Try Again</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Processing log */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[120px]">
              <h4 className="font-black text-xs uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> Processing Log
              </h4>
              <div className="space-y-2">
                {log.length === 0 ? (
                  <p className="text-slate-300 italic text-sm font-medium">No active processes...</p>
                ) : log.map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${line.startsWith('Error') ? 'bg-red-500' : line.startsWith('Success') ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                    <span className="text-xs font-bold text-slate-600 tracking-tight">{line}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Export ────────────────────────────────── */}
          <div className="space-y-6">
            <div className="bg-slate-950 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-[var(--brand-orange)]" />
                </div>
                <div>
                  <h3 className="font-black text-xl italic uppercase tracking-tight">Export Control</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Format: {exportFormat.toUpperCase()}</p>
                </div>
              </div>

              {/* Status filter for shipments */}
              <div className="relative z-10 space-y-3">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Filter Shipments by Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-[var(--brand-orange)] text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Date Range</p>
                  <input type="date" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold outline-none focus:bg-white/20 transition-all border border-white/10" />
                  <span className="text-white/30 text-xs">→</span>
                  <input type="date" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold outline-none focus:bg-white/20 transition-all border border-white/10" />
                  {(exportDateFrom || exportDateTo) && (
                    <button onClick={() => { setExportDateFrom(''); setExportDateTo(''); }} className="text-[9px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors">Clear</button>
                  )}
                </div>
              </div>

              <div className="space-y-3 relative z-10">

                {/* Shipments export */}
                <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="w-full p-5 flex items-center justify-between group transition-all hover:bg-white/10 cursor-pointer" onClick={exportShipments}>
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                      <div className="text-left">
                        <span className="font-black text-xs uppercase tracking-widest block">
                          Shipments {statusFilter !== 'All' ? `— ${statusFilter}` : '(All)'}
                        </span>
                        <span className="text-[10px] text-white/30 font-bold">
                          {statusFilter === 'All' ? shipments.length : shipments.filter(s => s.status === statusFilter).length} records · {activeCols.length} columns
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setShowShipCols(v => !v); }}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Select columns"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-white/60" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  {/* Column selector */}
                  <AnimatePresence>
                    {showShipCols && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
                        <div className="p-5 grid grid-cols-2 gap-2">
                          {shipColSel.map((col, i) => (
                            <label key={col.key} className="flex items-center gap-2 cursor-pointer group/col">
                              <input type="checkbox" checked={col.on} onChange={() => setShipColSel(prev => prev.map((c, j) => j === i ? { ...c, on: !c.on } : c))} className="accent-[var(--brand-orange)] w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold text-white/60 group-hover/col:text-white/90 uppercase tracking-widest transition-colors">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Container manifest */}
                <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                  <div className="w-full p-5 flex items-center justify-between group transition-all hover:bg-white/10 cursor-pointer" onClick={() => exportManifest()}>
                    <div className="flex items-center gap-4">
                      <Layers className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                      <div className="text-left">
                        <span className="font-black text-xs uppercase tracking-widest block">Container Manifest (All)</span>
                        <span className="text-[10px] text-white/30 font-bold">{containers.length} containers · {manifColSel.filter(c => c.on).length} columns</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setShowManifCols(v => !v); }}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Select columns"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-white/60" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <AnimatePresence>
                    {showManifCols && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
                        <div className="p-5 grid grid-cols-2 gap-2">
                          {manifColSel.map((col, i) => (
                            <label key={col.key} className="flex items-center gap-2 cursor-pointer group/col">
                              <input type="checkbox" checked={col.on} onChange={() => setManifColSel(prev => prev.map((c, j) => j === i ? { ...c, on: !c.on } : c))} className="accent-[var(--brand-orange)] w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold text-white/60 group-hover/col:text-white/90 uppercase tracking-widest transition-colors">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Per-container manifests */}
                {containers.length > 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/5 p-4 space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">Individual Container Manifests</p>
                    {containers.map(c => (
                      <button key={c.id} onClick={() => exportManifest(c.id)} className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-left transition-all group">
                        <div>
                          <span className="text-[10px] font-black text-white/70 uppercase italic">{c.vessel || c.id}</span>
                          <span className="text-[9px] text-white/30 font-bold ml-2 uppercase">{c.destination} · {c.count} pcs</span>
                        </div>
                        <Printer className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Address book */}
                <button onClick={exportAddressBook} className="w-full bg-white/5 hover:bg-white/10 p-5 rounded-2xl flex items-center justify-between group transition-all border border-white/5">
                  <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    <div className="text-left">
                      <span className="font-black text-xs uppercase tracking-widest block">Address Book</span>
                      <span className="text-[10px] text-white/30 font-bold">name, phone, email, address, city, country</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                </button>

                {/* Driver report */}
                <button onClick={exportDriverReport} className="w-full bg-[var(--brand-orange)]/10 hover:bg-[var(--brand-orange)]/20 p-5 rounded-2xl flex items-center justify-between group transition-all border border-[var(--brand-orange)]/20">
                  <div className="flex items-center gap-4">
                    <Printer className="w-5 h-5 text-[var(--brand-orange)]" />
                    <div className="text-left">
                      <span className="font-black text-xs uppercase tracking-widest block text-[var(--brand-orange)]">Driver Report</span>
                      <span className="text-[10px] text-white/30 font-bold">driver, shipment assignments, status, dates</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--brand-orange)]/40 group-hover:text-[var(--brand-orange)] transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
