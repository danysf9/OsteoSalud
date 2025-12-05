import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Phone, AlertCircle, ListChecks, RefreshCw } from 'lucide-react';
import { 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { SERVICES, BUSINESS_INFO } from './constants';
import { Service, ViewState, Booking, BookingFormData } from './types';

// Components
import { ServiceCard } from './components/ServiceCard';
import { BookingForm } from './components/BookingForm';
import { SuccessView } from './components/SuccessView';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { ClientBookings } from './components/ClientBookings';

// Declare global var for initial token if present (from server context)
declare global {
    var __initial_auth_token: string | undefined;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({ 
    name: '', 
    phone: '', 
    time: '',
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Estado para el acceso secreto (contador de clics)
  const [adminTapCount, setAdminTapCount] = useState(0);

  // 1. Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth initialization failed", error);
        // Si falla la autenticación real, mostramos error y pasamos a demo.
        setAuthError(true);
        setIsDemo(true);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
            setUser(u);
            setIsDemo(false);
            setAuthError(false);
        }
    });
    return () => unsubscribe();
  }, []);

  // 2. Load Bookings (Real-time or Demo)
  useEffect(() => {
    // Si estamos en modo demo puro (sin conexión), cargamos datos falsos
    if (isDemo) {
        if (bookings.length === 0) {
            setBookings([
                {
                    id: 'demo-1',
                    serviceId: 1,
                    serviceName: "Osteopatía General",
                    price: 60,
                    date: new Date().toISOString().split('T')[0],
                    time: "10:00",
                    clientName: "Usuario Demo",
                    clientPhone: "600123456",
                    clientAddress: "Calle Mayor 1, 2A",
                    clientCity: "Madrid",
                    createdAt: Timestamp.now(),
                    userId: 'demo-other',
                    status: 'confirmed'
                }
            ]);
        }
        return;
    }

    // CONEXIÓN REAL: Usamos la colección raíz 'appointments'
    const appointmentsRef = collection(db, 'appointments');
    
    // Si esta conexión falla (ej: permisos denegados), entonces sí saltamos a Demo
    const unsubscribe = onSnapshot(appointmentsRef, (snapshot) => {
      const loadedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(loadedBookings);
      // Si logramos leer datos, confirmamos que NO estamos en demo
      setIsDemo(false);
      setAuthError(false);
    }, (error) => {
      console.error("Error loading appointments (Permission or Network):", error);
      setIsDemo(true); // AQUÍ es donde decidimos caer al modo demo si la BD falla
      // No marcamos authError aquí necesariamente, puede ser solo permisos
    });

    return () => unsubscribe();
  }, [isDemo]); 

  // Handlers
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setView('booking');
    setFormData({ ...formData, time: '' });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time || !formData.name || !formData.phone || !formData.address || !formData.city || !selectedService) return;
    setLoading(true);

    try {
        const userId = user ? user.uid : 'guest';
        
        const newBookingData = {
            serviceId: selectedService.id,
            serviceName: selectedService.title,
            price: selectedService.price,
            date: selectedDate,
            time: formData.time,
            clientName: formData.name,
            clientPhone: formData.phone,
            clientAddress: formData.address,
            clientCity: formData.city,
            createdAt: Timestamp.now(),
            userId: userId,
            status: 'confirmed' as const
        };

        if (isDemo) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setBookings(prev => [...prev, { ...newBookingData, id: `demo-${Date.now()}` }]);
        } else {
            // Guardar en colección raíz
            await addDoc(collection(db, 'appointments'), newBookingData);
        }
      
      setView('success');
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Hubo un error al conectar con la base de datos. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!bookingId) return;
    
    setBookings(currentBookings => 
        currentBookings.map(b => 
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
    );

    try {
        if (!isDemo) {
            const bookingRef = doc(db, 'appointments', bookingId);
            await updateDoc(bookingRef, { status: 'cancelled' });
        }
    } catch (error) {
        console.error("Error cancelling booking:", error);
    }
  };

  const handleUpdateBooking = async (bookingId: string, newDate: string, newTime: string) => {
      setBookings(currentBookings => 
          currentBookings.map(b => 
              b.id === bookingId ? { ...b, date: newDate, time: newTime } : b
          )
      );

      try {
          if(!isDemo) {
              const bookingRef = doc(db, 'appointments', bookingId);
              await updateDoc(bookingRef, { date: newDate, time: newTime });
          }
      } catch (error) {
          console.error("Error updating booking", error);
          alert("Error de conexión al actualizar la cita.");
      }
  };

  const handleHomeReset = () => {
    setView('home');
    setSelectedService(null);
    setFormData({ name: '', phone: '', time: '', address: '', city: '' });
  };

  // Logic for Secret Admin Access
  const handleTitleClick = () => {
      const newCount = adminTapCount + 1;
      setAdminTapCount(newCount);
      if (newCount >= 5) {
          setView('admin-login');
          setAdminTapCount(0);
      }
  };

  // Render Helpers
  const renderHome = () => (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="relative text-white p-8 pb-10 rounded-b-[2.5rem] shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-end">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" 
                alt="Osteopathy massage background" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/95 via-teal-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
            <h1 
                onClick={handleTitleClick}
                className="text-3xl font-bold mb-2 tracking-tight shadow-sm text-shadow select-none active:scale-95 transition-transform cursor-default"
                title="OsteoSalud"
            >
                {BUSINESS_INFO.name}
            </h1>
            <p className="text-teal-50 text-sm mb-6 font-light shadow-sm">Bienestar integral y osteopatía profesional</p>
            
            <div className="flex items-center space-x-3 text-xs bg-white/10 backdrop-blur-md p-3 rounded-xl w-fit border border-white/20 shadow-lg">
            <MapPin size={16} className="text-teal-200" />
            <span className="font-medium tracking-wide">{BUSINESS_INFO.address}</span>
            </div>
        </div>
      </header>

      <div className="px-5 -mt-4 relative z-10">
        <div className="flex justify-between items-end mb-5 px-1">
          <h2 className="text-xl font-bold text-gray-800">Tratamientos</h2>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Selecciona uno</span>
        </div>
        
        <div className="space-y-4">
          {SERVICES.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onClick={handleServiceSelect} 
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-gray-900 bg-gray-100 min-h-screen flex justify-center items-center">
        {/* Mobile App Container */}
        <div className="w-full h-screen sm:h-[850px] sm:max-w-[400px] bg-gray-50 sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col sm:border-[8px] sm:border-gray-800 ring-1 ring-gray-900/5">
            
            <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-50"></div>

            {/* Aviso de Modo Demo / Error de Auth */}
            {isDemo && (
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-amber-100 text-amber-800 text-[10px] py-1 text-center font-semibold sm:mt-6 sticky top-0 z-40 flex justify-center items-center px-4 hover:bg-amber-200 transition-colors"
                >
                    {authError ? <AlertCircle size={10} className="mr-1 flex-shrink-0" /> : <RefreshCw size={10} className="mr-1 flex-shrink-0" />}
                    <span>
                        {authError 
                            ? "ERROR AUTENTICACIÓN. Toca para recargar." 
                            : "MODO DEMO (Sin conexión). Toca para conectar."}
                    </span>
                </button>
            )}

            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative bg-gray-50">
                {view === 'home' && renderHome()}
                
                {view === 'booking' && selectedService && (
                <BookingForm 
                    service={selectedService}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    formData={formData}
                    onFormChange={setFormData}
                    onSubmit={handleSubmitBooking}
                    onCancel={() => setView('home')}
                    existingBookings={bookings}
                    loading={loading}
                />
                )}
                
                {view === 'success' && (
                <SuccessView 
                    formData={formData}
                    selectedDate={selectedDate}
                    service={selectedService}
                    onHome={handleHomeReset}
                />
                )}
                
                {view === 'admin-login' && (
                    <AdminLogin 
                        onLoginSuccess={() => setView('admin')}
                        onCancel={() => setView('home')}
                    />
                )}

                {view === 'admin' && (
                <AdminPanel 
                    bookings={bookings}
                    onBack={() => setView('home')}
                    onUpdateBooking={handleUpdateBooking}
                />
                )}

                {view === 'client-bookings' && (
                    <ClientBookings 
                        bookings={bookings}
                        currentUserId={user?.uid}
                        onCancelBooking={handleCancelBooking}
                        onBack={() => setView('home')}
                    />
                )}
            </div>

            {(view === 'home' || view === 'client-bookings') && (
                <div className="bg-white border-t border-gray-100 p-3 pb-6 flex justify-around text-[10px] font-bold text-gray-400 sticky bottom-0 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-30">
                
                <button 
                    onClick={() => setView('home')}
                    className={`flex flex-col items-center transition-colors cursor-pointer ${view === 'home' ? 'text-teal-600' : 'hover:text-teal-600'}`}
                >
                    <Calendar size={22} className="mb-1" strokeWidth={2.5} />
                    <span>RESERVAR</span>
                </button>
                
                <button 
                    onClick={() => setView('client-bookings')}
                    className={`flex flex-col items-center transition-colors cursor-pointer ${view === 'client-bookings' ? 'text-teal-600' : 'hover:text-teal-600'}`}
                >
                    <ListChecks size={22} className="mb-1" strokeWidth={2.5} />
                    <span>TUS CITAS</span>
                </button>

                <button 
                    className="flex flex-col items-center hover:text-teal-600 transition-colors cursor-pointer group" 
                    onClick={() => window.location.href = `tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`}
                >
                    <div className="group-hover:animate-wiggle">
                        <Phone size={22} className="mb-1" strokeWidth={2.5} />
                    </div>
                    <span>LLAMAR</span>
                </button>
                </div>
            )}
        </div>
    </div>
  );
}