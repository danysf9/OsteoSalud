import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, Phone, Calendar as CalendarIcon, 
  MapPin, AlertTriangle, List, LayoutGrid, 
  TrendingUp, ChevronRight, Euro, Edit2, X, Save, Clock, ChevronDown
} from 'lucide-react';
import { Booking } from '../types';
import { BUSINESS_INFO } from '../constants';

interface AdminPanelProps {
  bookings: Booking[];
  onBack: () => void;
  onUpdateBooking: (bookingId: string, newDate: string, newTime: string) => Promise<void>;
}

type AdminTab = 'list' | 'calendar' | 'revenue';

export const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, onBack, onUpdateBooking }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  // --- UI STATE ---
  // Cambiamos de colapsar ciudades a colapsar fechas
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // --- EDITING STATE ---
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // --- DATA PROCESSING ---
  const validBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    return bookings.filter(b => {
        if (!b || !b.date || !b.time) return false;
        const d = new Date(b.date);
        return !isNaN(d.getTime());
    });
  }, [bookings]);

  const sortedBookings = useMemo(() => {
    return [...validBookings].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [validBookings]);

  const activeBookings = sortedBookings.filter(b => b.status !== 'cancelled');
  const cancelledBookings = sortedBookings.filter(b => b.status === 'cancelled');

  // Filter for the main "Agenda" view: Only Today and Future
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return activeBookings.filter(b => {
        const d = new Date(b.date);
        return d >= now;
    });
  }, [activeBookings]);

  // AGRUPACIÓN POR FECHA PARA ORDEN CRONOLÓGICO
  const bookingsByDate = useMemo(() => {
    const groups: Record<string, Booking[]> = {};
    upcomingBookings.forEach(booking => {
        const dateKey = booking.date;
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(booking);
    });
    return groups;
  }, [upcomingBookings]);

  const revenueStats = useMemo(() => {
    const stats: Record<string, number> = {};
    activeBookings.forEach(b => {
      try {
          const dateObj = new Date(b.date);
          if (isNaN(dateObj.getTime())) return;
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const monthKey = `${year}-${month}`;
          stats[monthKey] = (stats[monthKey] || 0) + (Number(b.price) || 0);
      } catch (e) {
          console.warn("Invalid date for revenue calc", b);
      }
    });
    return stats;
  }, [activeBookings]);

  const totalRevenue = activeBookings.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  // --- ACTIONS ---
  const toggleDateCollapse = (date: string) => {
      setCollapsedDates(prev => ({
          ...prev,
          [date]: !prev[date]
      }));
  };

  const handleEditClick = (booking: Booking) => {
      setEditingBooking(booking);
      setEditDate(booking.date);
      setEditTime(booking.time);
  };

  const handleSaveEdit = async () => {
      if (!editingBooking?.id || !editDate || !editTime) return;
      setIsSaving(true);
      try {
          await onUpdateBooking(editingBooking.id, editDate, editTime);
          setEditingBooking(null); // Close modal
      } catch (error) {
          console.error("Failed to update", error);
          alert("Error al actualizar la cita");
      } finally {
          setIsSaving(false);
      }
  };

  const availableSlotsForEdit = useMemo(() => {
      if (!editDate) return [];
      
      const takenTimes = activeBookings
          .filter(b => b.date === editDate && b.id !== editingBooking?.id)
          .map(b => b.time);

      const slots: string[] = [];
      for (let i = BUSINESS_INFO.scheduleStart; i < BUSINESS_INFO.scheduleEnd; i++) {
          if (BUSINESS_INFO.breakStart && BUSINESS_INFO.breakEnd) {
             if (i >= BUSINESS_INFO.breakStart && i < BUSINESS_INFO.breakEnd) continue;
          }
          const timeLabel = `${i}:00`;
          slots.push(timeLabel); 
      }
      
      return slots.map(time => ({
          time,
          isTaken: takenTimes.includes(time)
      }));
  }, [editDate, activeBookings, editingBooking]);


  // --- HELPERS ---
  const renderBookingCard = (cita: Booking, compact: boolean = false) => {
      try {
        const dateObj = new Date(cita.date);
        if (isNaN(dateObj.getTime())) return null;
        
        return (
            <div key={cita.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-teal-500 mb-3 relative overflow-hidden animate-in fade-in duration-300 group">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-start">
                {!compact && (
                    <div className="bg-gray-100 p-2 rounded-lg text-center min-w-[3.5rem] mr-3">
                            <span className="block text-xs font-bold text-gray-500 uppercase">{dateObj.toLocaleDateString('es-ES', { month: 'short' })}</span>
                            <span className="block text-xl font-bold text-gray-800">{dateObj.getDate()}</span>
                    </div>
                )}
                <div>
                    <p className="text-teal-700 font-bold text-lg flex items-center">
                        <CalendarIcon size={14} className="mr-1 opacity-75" />
                        {compact ? `${dateObj.getDate()}/${dateObj.getMonth()+1} - ` : ''}{cita.time}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">{cita.serviceName}</p>
                </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded text-sm">{cita.price}€</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(cita); }}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded-md hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        title="Modificar cita"
                    >
                        <Edit2 size={14} />
                    </button>
                </div>
            </div>
            
            {!compact && <hr className="my-2 border-gray-100"/>}
            
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm font-bold text-gray-800">{cita.clientName}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Phone size={12} className="mr-1" />
                        <a href={`tel:${cita.clientPhone}`} className="hover:text-teal-600 underline decoration-teal-600/50">
                            {cita.clientPhone}
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-start text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <MapPin size={14} className="mr-1 mt-0.5 text-teal-500 flex-shrink-0" />
                    <span className="font-medium">{cita.clientAddress}, {cita.clientCity}</span>
                </div>
            </div>
            </div>
        );
      } catch (e) {
          return null; 
      }
  };

  // --- TABS CONTENT ---
  const renderListTab = () => {
    // Sort dates ascending (String YYYY-MM-DD sorts correctly alphabetically)
    const dates = Object.keys(bookingsByDate).sort();

    // Helper to format date header
    const formatDateHeader = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Reset hours for accurate comparison
        today.setHours(0,0,0,0);
        tomorrow.setHours(0,0,0,0);
        const dComp = new Date(d);
        dComp.setHours(0,0,0,0);

        // Formato corto para el paréntesis (ej: 24/10)
        const shortDate = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

        if (dComp.getTime() === today.getTime()) return `Hoy (${shortDate})`;
        if (dComp.getTime() === tomorrow.getTime()) return `Mañana (${shortDate})`;
        
        return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
    <div className="pb-24">
       {/* SECCIÓN CANCELADAS (Detallada) */}
       {cancelledBookings.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 mx-4 mt-4 animate-in slide-in-from-right-4">
                <div className="flex items-center mb-4">
                    <AlertTriangle size={20} className="text-red-500 mr-2" />
                    <h3 className="font-bold text-red-800 text-sm">Canceladas Recientemente</h3>
                </div>
                <div className="space-y-3">
                    {cancelledBookings.slice(0, 3).map(b => {
                        const dateObj = new Date(b.date);
                        return (
                        <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400 relative overflow-hidden opacity-90">
                            {/* Cabecera Cancelada */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start">
                                    <div className="bg-red-50 p-2 rounded-lg text-center min-w-[3.5rem] mr-3">
                                            <span className="block text-xs font-bold text-red-400 uppercase">{dateObj.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                            <span className="block text-xl font-bold text-red-700">{dateObj.getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="text-red-700 font-bold text-lg flex items-center line-through decoration-red-400 decoration-2">
                                            {b.time}
                                        </p>
                                        <p className="text-xs text-red-400 font-medium">{b.serviceName}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold uppercase tracking-wide">Anulada</span>
                            </div>
                            
                            <hr className="my-2 border-red-50"/>
                            
                            {/* Datos Cliente */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{b.clientName}</p>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Phone size={12} className="mr-1" />
                                        <span>{b.clientPhone}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded text-sm line-through">{b.price}€</span>
                            </div>
                            
                            {/* Dirección */}
                            <div className="mt-2 pt-2 border-t border-gray-50">
                                <div className="flex items-start text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    <MapPin size={14} className="mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                                    <span className="font-medium">{b.clientAddress}, {b.clientCity}</span>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="px-4 animate-in fade-in duration-500">
             <div className="flex justify-between items-end mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Agenda Próxima</h3>
                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-md font-medium">
                    {upcomingBookings.length} citas futuras
                </span>
             </div>
             
             {upcomingBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    <p>No hay citas próximas.</p>
                    <p className="text-xs text-gray-300 mt-2">El historial está en el Calendario.</p>
                </div>
             ) : (
                dates.map(date => {
                    const isCollapsed = collapsedDates[date];
                    const count = bookingsByDate[date].length;
                    const formattedDate = formatDateHeader(date);

                    return (
                        <div key={date} className="mb-4">
                            {/* Collapsible Header by Date */}
                            <button 
                                onClick={() => toggleDateCollapse(date)}
                                className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-2 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <CalendarIcon size={18} className="text-teal-600 mr-2" />
                                    <h4 className="font-bold text-gray-800 text-base capitalize">
                                        {formattedDate} <span className="text-gray-400 font-normal ml-1">({count})</span>
                                    </h4>
                                </div>
                                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                            </button>

                            {/* List Content */}
                            <div className={`space-y-3 pl-2 transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
                                {bookingsByDate[date].map(b => renderBookingCard(b, true))} 
                                {/* Usamos 'compact=true' porque la fecha ya está en el header */}
                            </div>
                        </div>
                    );
                })
             )}
        </div>

        <div className="mt-8 mx-4">
             <div className="bg-teal-700 text-white rounded-xl p-4 shadow-md mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                    <Euro size={64} />
                </div>
                <p className="text-teal-100 text-xs uppercase font-semibold tracking-wider mb-1">Total Ingresos Estimados</p>
                <div className="flex items-center relative z-10">
                    <span className="text-3xl font-bold tracking-tight">{totalRevenue}</span>
                    <Euro size={28} className="text-teal-300 ml-1" />
                </div>
            </div>
        </div>
    </div>
    );
  };

  const renderCalendarTab = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const changeMonth = (offset: number) => {
        setCalendarDate(new Date(year, month + offset, 1));
        setSelectedDay(1); 
    };

    const isToday = (d: number) => {
        const today = new Date();
        return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const getDayBookings = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return activeBookings.filter(b => b.date === dateStr);
    };

    const selectedDayBookings = getDayBookings(selectedDay);

    return (
        <div className="pb-24 animate-in fade-in duration-300">
            <div className="bg-white p-4 pb-6 rounded-b-3xl shadow-sm mb-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ChevronLeft size={20}/></button>
                    <h3 className="font-bold text-xl text-gray-800 capitalize">{monthNames[month]} {year}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ChevronRight size={20}/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                        <span key={d} className="text-xs text-gray-400 font-bold">{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayBookings = getDayBookings(day);
                        const hasBookings = dayBookings.length > 0;
                        const isSelected = selectedDay === day;
                        return (
                            <button 
                                key={day} 
                                onClick={() => setSelectedDay(day)}
                                className={`
                                    h-10 w-10 rounded-full flex flex-col items-center justify-center relative transition-all
                                    ${isSelected ? 'bg-teal-600 text-white shadow-lg scale-110' : 'text-gray-700 hover:bg-gray-50'}
                                    ${isToday(day) && !isSelected ? 'border border-teal-500 text-teal-600 font-bold' : ''}
                                `}
                            >
                                <span className="text-sm">{day}</span>
                                {hasBookings && (
                                    <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-teal-500'}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="px-4">
                <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Citas del {selectedDay} de {monthNames[month]}
                </h4>
                {selectedDayBookings.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No hay citas para este día.</p>
                ) : (
                    selectedDayBookings.map(b => renderBookingCard(b, true))
                )}
            </div>
        </div>
    );
  };

  const renderRevenueTab = () => {
      const monthKeys = Object.keys(revenueStats).sort().reverse();
      const maxRevenue = Math.max(...Object.values(revenueStats), 1);
      return (
        <div className="px-4 pt-4 pb-24 animate-in fade-in duration-300">
            <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                <p className="text-teal-200 text-sm font-medium mb-1">Ingresos Totales (Histórico)</p>
                <div className="flex items-center relative z-10">
                    <Euro size={36} className="text-teal-300 mr-1" />
                    <h2 className="text-4xl font-bold tracking-tight">{totalRevenue}</h2>
                </div>
            </div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp size={18} className="mr-2 text-teal-600"/>
                Evolución Mensual
            </h3>
            <div className="space-y-6">
                {monthKeys.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay datos suficientes aún.</p>
                ) : (
                    monthKeys.map(key => {
                        const parts = key.split('-');
                        if(parts.length < 2) return null;
                        const y = parseInt(parts[0]);
                        const m = parseInt(parts[1]);
                        const date = new Date(y, m - 1, 15);
                        if(isNaN(date.getTime())) return null;
                        const amount = revenueStats[key];
                        const percentage = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
                        return (
                            <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-gray-700 capitalize">
                                        {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="font-mono font-medium text-gray-900">{amount}€</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="bg-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      );
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* EDIT MODAL */}
      {editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingBooking(null)}></div>
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200">
                  <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold text-lg flex items-center">
                          <Edit2 size={18} className="mr-2" />
                          Modificar Cita
                      </h3>
                      <button onClick={() => setEditingBooking(null)} className="p-1 hover:bg-white/20 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-5 space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold">Cliente</p>
                          <p className="font-bold text-gray-800">{editingBooking.clientName}</p>
                          <p className="text-xs text-teal-600">{editingBooking.serviceName}</p>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Fecha</label>
                          <input 
                              type="date" 
                              value={editDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => { setEditDate(e.target.value); setEditTime(''); }}
                              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevo Horario</label>
                          {editDate ? (
                             <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                {availableSlotsForEdit.map(({time, isTaken}) => (
                                    <button
                                        key={time}
                                        disabled={isTaken}
                                        onClick={() => setEditTime(time)}
                                        className={`
                                            py-2 text-xs font-bold rounded-lg transition-all
                                            ${editTime === time 
                                                ? 'bg-teal-600 text-white shadow-md' 
                                                : isTaken 
                                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice line-through' 
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
                                            }
                                        `}
                                    >
                                        {time}
                                    </button>
                                ))}
                             </div>
                          ) : (
                              <p className="text-gray-400 text-xs italic">Selecciona una fecha primero</p>
                          )}
                      </div>

                      <div className="pt-2 flex gap-3">
                          <button 
                             onClick={() => setEditingBooking(null)}
                             className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                          >
                              Cancelar
                          </button>
                          <button 
                             onClick={handleSaveEdit}
                             disabled={!editTime || isSaving}
                             className={`flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg flex justify-center items-center ${(!editTime || isSaving) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'}`}
                          >
                              {isSaving ? <Clock size={18} className="animate-spin" /> : <><Save size={18} className="mr-2" /> Guardar</>}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Top Bar */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-20 flex justify-between items-center border-b border-gray-100">
         <div className="flex items-center">
            <button 
                onClick={onBack} 
                className="mr-2 p-2 -ml-2 text-gray-400 hover:text-gray-800 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>
            <h2 className="font-bold text-lg text-gray-800">
                {activeTab === 'list' && 'Agenda'}
                {activeTab === 'calendar' && 'Calendario'}
                {activeTab === 'revenue' && 'Finanzas'}
            </h2>
         </div>
         <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold text-xs">
            SD
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'list' && renderListTab()}
          {activeTab === 'calendar' && renderCalendarTab()}
          {activeTab === 'revenue' && renderRevenueTab()}
      </div>

      {/* Bottom Navigation for Admin */}
      <div className="bg-white border-t border-gray-200 p-2 pb-6 flex justify-around sticky bottom-0 z-30 shadow-lg">
        <button 
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all w-20 ${activeTab === 'list' ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
            <List size={22} strokeWidth={activeTab === 'list' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1">Citas</span>
        </button>

        <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all w-20 ${activeTab === 'calendar' ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
            <LayoutGrid size={22} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1">Calendario</span>
        </button>

        <button 
            onClick={() => setActiveTab('revenue')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all w-20 ${activeTab === 'revenue' ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
            <TrendingUp size={22} strokeWidth={activeTab === 'revenue' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-1">Ingresos</span>
        </button>
      </div>
    </div>
  );
};