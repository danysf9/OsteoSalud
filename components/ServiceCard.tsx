import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onClick: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  return (
    <div 
      onClick={() => onClick(service)}
      className={`relative group border-l-[6px] rounded-r-xl p-5 shadow-sm bg-white cursor-pointer transform transition-all duration-200 hover:shadow-md hover:translate-x-1 active:scale-[0.98] ${service.color}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-black transition-colors">
            {service.title}
        </h3>
        <span className="bg-gray-900 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
          {service.price}€
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-3 pr-4 leading-relaxed">{service.desc}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-gray-400 text-xs font-medium">
            <Clock size={14} className="mr-1" />
            {service.duration} min
        </div>
        <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
            <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};
