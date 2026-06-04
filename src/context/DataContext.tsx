'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface Shipment {
  id: string;
  customer: string;
  destination: string;
  origin?: string;
  type: string;
  weight: string;
  status: string;
  date: string;
  notes?: string;
  status_note?: string;
  metadata?: Record<string, any>;
  items?: Array<{ type: string; qty: number; unitPrice: number; total: number }>;
}

export interface Booking {
  id: string;
  customer: string;
  route: string;
  date: string;
  status: string;
  type: string;
}

export interface Container {
  id: string;
  vessel: string;
  flight: string;
  destination: string;
  status: string;
  count: number;
  date: string;
  type: string;
}

export interface Quote {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  weight: string;
  service: string;
  status: string;
  date: string;
  driver_id?: string | null;
  driver_name?: string | null;
}

interface DataContextType {
  shipments: Shipment[];
  bookings: Booking[];
  containers: Container[];
  quotes: Quote[];
  isLoading: boolean;
  deleteShipment: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  addShipment: (shipment: Shipment) => Promise<void>;
  addContainer: (container: Container) => Promise<void>;
  addBooking: (booking: Booking) => Promise<void>;
  updateShipment: (id: string, updates: Partial<Omit<Shipment, 'id'>>) => Promise<void>;
  updateShipmentStatus: (id: string, status: string, note?: string) => Promise<void>;
  updateContainer: (id: string, updates: Partial<Omit<Container, 'id'>>) => Promise<void>;
  updateQuote: (id: string, updates: Partial<Omit<Quote, 'id'>>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Omit<Booking, 'id'>>) => Promise<void>;
  addNotification: (userId: string, type: string, title: string, message: string, data?: Record<string, any>) => Promise<void>;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

async function fetchAll() {
  const [s, b, c, q] = await Promise.all([
    supabase.from('shipments').select('*').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
    supabase.from('containers').select('*').order('created_at', { ascending: false }),
    supabase.from('quotes').select('*').order('created_at', { ascending: false }),
  ]);
  return {
    shipments: (s.data ?? []) as Shipment[],
    bookings: (b.data ?? []) as Booking[],
    containers: (c.data ?? []) as Container[],
    quotes: (q.data ?? []) as Quote[],
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = async () => {
    setIsLoading(true);
    const data = await fetchAll();
    setShipments(data.shipments);
    setBookings(data.bookings);
    setContainers(data.containers);
    setQuotes(data.quotes);
    setIsLoading(false);
  };

  useEffect(() => {
    refetch();

    const channel = supabase
      .channel('db-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'containers' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, refetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const deleteShipment = async (id: string) => {
    await supabase.from('shipments').delete().eq('id', id);
    setShipments(prev => prev.filter(s => s.id !== id));
  };

  const deleteBooking = async (id: string) => {
    await supabase.from('bookings').delete().eq('id', id);
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const deleteContainer = async (id: string) => {
    await supabase.from('containers').delete().eq('id', id);
    setContainers(prev => prev.filter(c => c.id !== id));
  };

  const deleteQuote = async (id: string) => {
    await supabase.from('quotes').delete().eq('id', id);
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const addShipment = async (shipment: Shipment) => {
    const { data } = await supabase.from('shipments').insert(shipment).select().single();
    if (data) setShipments(prev => [data as Shipment, ...prev]);

    // Look up the rate for this shipment's service type to get a real amount
    const serviceType = shipment.metadata?.service_type || shipment.type || '';
    const { data: rateRow } = await supabase
      .from('rates')
      .select('rate')
      .ilike('item', `%${serviceType.split(' ')[0]}%`)
      .eq('status', 'Active')
      .limit(1)
      .single();

    const amount = shipment.metadata?.declared_value
      ? `£${shipment.metadata.declared_value}`
      : rateRow?.rate
      ? rateRow.rate.split(' / ')[0]   // e.g. "£120" from "£120 / per barrel"
      : 'TBD';

    await supabase.from('invoices').insert({
      id:     `INV-SH${shipment.id.slice(-4)}`,
      client: shipment.customer,
      amount,
      status: 'Draft',
      date:   new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      due:    'On Collection',
    });
  };

  const addContainer = async (container: Container) => {
    const { data } = await supabase.from('containers').insert(container).select().single();
    if (data) setContainers(prev => [data as Container, ...prev]);
  };

  const addBooking = async (booking: Booking) => {
    const { data } = await supabase.from('bookings').insert(booking).select().single();
    if (data) setBookings(prev => [data as Booking, ...prev]);

    // Auto-create draft invoice for every booking
    const serviceType = booking.type || 'Booking';
    const { data: rateRow } = await supabase
      .from('rates')
      .select('rate')
      .ilike('item', `%${serviceType.split(' ')[0]}%`)
      .eq('status', 'Active')
      .limit(1)
      .single();

    const amount = rateRow?.rate ? rateRow.rate.split(' / ')[0] : 'TBD';

    await supabase.from('invoices').insert({
      id:     `INV-BK${booking.id.slice(-4)}`,
      client: booking.customer,
      amount,
      status: 'Draft',
      date:   new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      due:    'On Pickup',
    });
  };

  const updateShipment = async (id: string, updates: Partial<Omit<Shipment, 'id'>>) => {
    await supabase.from('shipments').update(updates).eq('id', id);
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updateShipmentStatus = async (id: string, status: string, note?: string) => {
    const shipment = shipments.find(s => s.id === id);
    const prev_history: Array<{ status: string; note: string; date: string }> =
      shipment?.metadata?.status_history ?? [];
    const new_entry = { status, note: note || '', date: new Date().toISOString() };
    const updatedMeta = { ...(shipment?.metadata || {}), status_history: [...prev_history, new_entry] };
    await supabase.from('shipments').update({ status, status_note: note || null, metadata: updatedMeta }).eq('id', id);
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status, status_note: note, metadata: updatedMeta } : s));
  };

  const updateContainer = async (id: string, updates: Partial<Omit<Container, 'id'>>) => {
    await supabase.from('containers').update(updates).eq('id', id);
    setContainers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateQuote = async (id: string, updates: Partial<Omit<Quote, 'id'>>) => {
    await supabase.from('quotes').update(updates).eq('id', id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateBooking = async (id: string, updates: Partial<Omit<Booking, 'id'>>) => {
    await supabase.from('bookings').update(updates).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addNotification = async (userId: string, type: string, title: string, message: string, data: Record<string, any> = {}) => {
    await supabase.from('notifications').insert({ user_id: userId, type, title, message, data });
  };

  return (
    <DataContext.Provider value={{
      shipments, bookings, containers, quotes, isLoading,
      deleteShipment, deleteBooking, deleteContainer, deleteQuote,
      addShipment, addContainer, addBooking,
      updateShipment, updateShipmentStatus, updateContainer, updateQuote, updateBooking,
      addNotification,
      refetch,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
}
