import React, { useState } from 'react';
import { Calendar, MapPin, XCircle, AlertTriangle, Check, X } from 'lucide-react';
import { Booking } from '../types';

interface ClientBookingsProps {
  bookings: Booking[];
  currentUserId: string | undefined;
  onCancelBooking: (bookingId: string) => void;
  onBack: () => void;
}

export const ClientBookings: React.FC<ClientBookingsProps> = ({ 
  bookings, 
  currentUserId, 
  onCancelBooking,
  onBack 
}) => {
  // Estado para controlar qué cita se está intentando borrar
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Filtrar citas del usuario actual que NO estén canceladas
  const myBookings = bookings
    .filter(b => b.userId === currentUserId && b.status !== 'cancelled')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const handleConfirmCancel = (bookingId: string) => {
      onCancelBooking(bookingId);
      setConfirmId(null);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col animate-in fade-in duration-300">
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Mis Citas</h2>
        <p className="text-sm text-gray-400">Gestiona tus próximas visitas</p>
      </div>

      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
        {myBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-gray-600 font-medium mb-1">No tienes citas activas</h3>
            <p className="text-gray-400 text-sm mb-6">¿Necesitas un tratamiento?</p>
            <button 
                onClick={onBack}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-teal-700 transition-colors"
            >
                Reservar ahora
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-gray-800">{booking.serviceName}</h3>
                        <div className="flex items-center text-sm text-teal-600 font-medium mt-1">
                            <Calendar size={14} className="mr-1" />
                            {new Date(booking.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-lg">
                        {booking.time}
                    </span>
                </div>

                <div className="flex items-start text-xs text-gray-500 bg-gray-50 p-2 rounded-lg mb-4">
                    <MapPin size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>{booking.clientAddress}, {booking.clientCity}</span>
                </div>

                {/* Lógica de Confirmación Visual Sin Alertas de Navegador */}
                {confirmId === booking.id ? (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 animate-in zoom-in duration-200">
                        <p className="text-xs font-bold text-red-800 mb-2 text-center">¿Seguro que quieres anular?</p>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setConfirmId(null)}
                                className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-gray-50"
                            >
                                <X size={14} className="mr-1" />
                                No, volver
                            </button>
                            <button 
                                onClick={() => booking.id && handleConfirmCancel(booking.id)}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold flex items-center justify-center shadow-sm hover:bg-red-700 active:scale-95 transition-all"
                            >
                                <Check size={14} className="mr-1" />
                                Sí, anular
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setConfirmId(booking.id || null)}
                        className="w-full py-2 border border-red-100 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center"
                    >
                        <XCircle size={16} className="mr-2" />
                        Anular Cita
                    </button>
                )}
              </div>
            ))}
            
            <div className="mt-8 bg-blue-50 p-4 rounded-xl flex items-start text-blue-700 text-xs leading-relaxed">
                <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>
                    Recuerda que si anulas la cita, el hueco quedará libre automáticamente para otros pacientes.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};