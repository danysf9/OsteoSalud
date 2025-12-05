import React, { useMemo } from 'react';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';
import { Service, BookingFormData, Booking } from '../types';
import { BUSINESS_INFO } from '../constants';

interface BookingFormProps {
  service: Service;
  selectedDate: string;
  onDateChange: (date: string) => void;
  formData: BookingFormData;
  onFormChange: (data: BookingFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  existingBookings: Booking[];
  loading: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  service,
  selectedDate,
  onDateChange,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  existingBookings,
  loading
}) => {
  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    // Only count bookings that are NOT cancelled
    const takenTimes = existingBookings
      .filter(b => b.date === selectedDate && b.status !== 'cancelled')
      .map(b => b.time);

    for (let i = BUSINESS_INFO.scheduleStart; i < BUSINESS_INFO.scheduleEnd; i++) {
      // Logic for Breaks (Lunch time)
      if (BUSINESS_INFO.breakStart && BUSINESS_INFO.breakEnd) {
          if (i >= BUSINESS_INFO.breakStart && i < BUSINESS_INFO.breakEnd) {
              continue; // Skip this hour
          }
      }

      const timeLabel = `${i}:00`;
      if (!takenTimes.includes(timeLabel)) {
        slots.push(timeLabel);
      }
    }
    return slots;
  }, [selectedDate, existingBookings]);

  const today = new Date().toISOString().split('T')[0];

  // Validate that all fields are filled
  const isFormValid = 
    formData.time !== '' && 
    formData.name.trim() !== '' && 
    formData.phone.trim() !== '' && 
    formData.address.trim() !== '' && 
    formData.city.trim() !== '';

  return (
    <div className="h-full flex flex-col bg-gray-50 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header Sticky */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center border-b border-gray-100">
        <button 
          onClick={onCancel}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="ml-2 overflow-hidden">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Reservando</p>
            <h2 className="font-bold text-gray-800 text-lg truncate leading-tight">{service.title}</h2>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
        <form onSubmit={onSubmit} className="space-y-6 pb-6">
          
          {/* Selector de Fecha */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar size={16} className="mr-2 text-teal-600" />
              Selecciona el día <span className="text-red-500 ml-1">*</span>
            </label>
            <input 
              type="date" 
              required
              min={today}
              value={selectedDate}
              onChange={(e) => {
                onDateChange(e.target.value);
                onFormChange({...formData, time: ''});
              }}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Selector de Hora */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Clock size={16} className="mr-2 text-teal-600" />
              Horas disponibles <span className="text-red-500 ml-1">*</span>
            </label>
            
            {availableSlots.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No hay huecos libres para esta fecha.</p>
                <p className="text-teal-600 text-xs font-medium mt-1 cursor-pointer" onClick={() => onDateChange('')}>Prueba otro día</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onFormChange({...formData, time})}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.time === time 
                        ? 'bg-teal-600 text-white shadow-md transform scale-105 ring-2 ring-teal-300 ring-offset-1' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
            
            {/* Disclaimer Horario */}
            <div className="mt-3 text-[10px] text-gray-400 text-center">
                Horario: {BUSINESS_INFO.scheduleStart}:00 - {BUSINESS_INFO.scheduleEnd}:00 
                {BUSINESS_INFO.breakStart && ` (Descanso ${BUSINESS_INFO.breakStart}:00-${BUSINESS_INFO.breakEnd}:00)`}
            </div>
          </div>

          {/* Datos Personales */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Tus datos de contacto</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. María García"
                  value={formData.name}
                  onChange={(e) => onFormChange({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">
                  Teléfono móvil <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="600 000 000"
                  value={formData.phone}
                  onChange={(e) => onFormChange({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Dirección de visita</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">
                  Dirección completa <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Calle, número, piso, letra..."
                  value={formData.address}
                  onChange={(e) => onFormChange({...formData, address: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">
                  Población <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Alcalá de Henares, Torrejón..."
                  value={formData.city}
                  onChange={(e) => onFormChange({...formData, city: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Resumen Precio */}
          <div className="flex justify-between items-end px-2 pt-2 pb-4">
            <div className="text-gray-500 text-sm">
                <p>Total a pagar</p>
                <p className="text-xs text-gray-400">(en consulta)</p>
            </div>
            <span className="text-3xl font-bold text-teal-700 tracking-tight">{service.price}€</span>
          </div>

          {/* Botón Submit */}
          <button 
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex justify-center items-center transition-all duration-300 ${
              !isFormValid || loading 
                ? 'bg-gray-300 cursor-not-allowed transform-none shadow-none' 
                : 'bg-teal-600 hover:bg-teal-700 active:scale-95 shadow-teal-200'
            }`}
          >
            {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirmando...
                </span>
            ) : 'Confirmar Reserva'}
          </button>
        </form>
      </div>
    </div>
  );
};