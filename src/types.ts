import { Timestamp } from 'firebase/firestore';

export interface Service {
  id: number;
  title: string;
  desc: string;
  price: number;
  duration: number;
  color: string;
  icon?: string;
}

export interface Booking {
  id?: string;
  serviceId: number;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  createdAt: Timestamp;
  userId?: string;
  status: 'confirmed' | 'cancelled'; // Nuevo campo para gestionar el estado
}

export interface BusinessInfo {
  name: string;
  phone: string;
  address: string;
  scheduleStart: number;
  scheduleEnd: number;
  breakStart?: number; // Hora inicio descanso
  breakEnd?: number;   // Hora fin descanso
}

export type ViewState = 'home' | 'booking' | 'success' | 'admin' | 'admin-login' | 'client-bookings';

export interface BookingFormData {
  name: string;
  phone: string;
  time: string;
  address: string;
  city: string;
}