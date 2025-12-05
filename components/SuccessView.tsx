import React from 'react';
import { CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { BookingFormData, Service } from '../types';

interface SuccessViewProps {
  formData: BookingFormData;
  selectedDate: string;
  service: Service | null;
  onHome: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ formData, selectedDate, service, onHome }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center animate-in zoom-in duration-300">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <div className="bg-green-100 p-4 rounded-full animate-bounce">
             <CheckCircle size={40} className="text-green-600" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Cita Reservada!</h2>
      <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
        Tu cita ha sido confirmada correctamente. Hemos reservado tu espacio.
      </p>
      
      <div className="bg-gray-50 p-6 rounded-2xl w-full max-w-xs mb-8 text-left border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
        
        <div className="mb-4 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{service?.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center"><Calendar size={14} className="mr-1 text-teal-500"/> {selectedDate}</div>
                <div className="flex items-center"><Clock size={14} className="mr-1 text-teal-500"/> {formData.time}</div>
            </div>
        </div>

        <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Cliente</p>
            <p className="font-medium text-gray-800 mb-3">{formData.name}</p>
            
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Contacto</p>
            <p className="font-medium text-gray-800 mb-3">{formData.phone}</p>
            
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Dirección Visita</p>
            <div className="flex items-start font-medium text-gray-800">
                <MapPin size={14} className="mr-1 mt-1 text-teal-500 flex-shrink-0" />
                <span className="text-sm">{formData.address}, {formData.city}</span>
            </div>
        </div>
      </div>

      <button 
        onClick={onHome}
        className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all w-full max-w-xs"
      >
        Volver al inicio
      </button>
    </div>
  );
};