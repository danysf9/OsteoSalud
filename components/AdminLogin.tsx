import React, { useState, useEffect } from 'react';
import { Lock, Delete, ChevronLeft, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  // CÓDIGO DE ACCESO DE SARA
  const SECRET_PIN = '2580';

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === SECRET_PIN) {
        // Pequeño delay para UX
        setTimeout(() => {
            onLoginSuccess();
        }, 200);
      } else {
        setError(true);
        setTimeout(() => {
            setPin('');
            setError(false);
        }, 600);
      }
    }
  }, [pin, onLoginSuccess]);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white animate-in zoom-in duration-300">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button 
          onClick={onCancel}
          className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-10">
        <div className="bg-gray-800 p-4 rounded-full mb-6 shadow-lg shadow-teal-500/10">
            <Lock size={32} className="text-teal-400" />
        </div>
        
        <h2 className="text-xl font-medium mb-2">Acceso Profesional</h2>
        <p className="text-gray-400 text-sm mb-8">Introduce el código de seguridad</p>

        {/* PIN Display */}
        <div className="flex space-x-4 mb-10 h-4">
            {[0, 1, 2, 3].map((i) => (
                <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        pin.length > i 
                            ? 'bg-teal-400 scale-125' 
                            : 'bg-gray-700'
                    } ${error ? 'bg-red-500 animate-pulse' : ''}`}
                />
            ))}
        </div>

        {error && (
            <div className="absolute top-2/3 mt-[-180px] text-red-400 text-xs font-bold flex items-center animate-bounce">
                <AlertCircle size={12} className="mr-1" />
                Código incorrecto
            </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                    key={num}
                    onClick={() => handleNumClick(num.toString())}
                    className="w-16 h-16 rounded-full bg-gray-800 text-2xl font-light hover:bg-gray-700 active:bg-teal-600 active:text-white transition-all duration-100 flex items-center justify-center shadow-sm"
                >
                    {num}
                </button>
            ))}
            <div className="w-16 h-16"></div> {/* Empty slot for alignment */}
            <button
                onClick={() => handleNumClick('0')}
                className="w-16 h-16 rounded-full bg-gray-800 text-2xl font-light hover:bg-gray-700 active:bg-teal-600 active:text-white transition-all duration-100 flex items-center justify-center shadow-sm"
            >
                0
            </button>
            <button
                onClick={handleDelete}
                className="w-16 h-16 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/50 flex items-center justify-center transition-colors"
            >
                <Delete size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};