
import React, { useState } from 'react';
import { Phone, Lock, MapPin, Truck, MapPinned, User as UserIcon, Eye, EyeOff, Navigation } from 'lucide-react';
import { Button, Card } from './Button';
import { getCurrentPosition } from '../services/geoService';
import { Coordinates, User, UserRole } from '../types';
import { DEFAULT_CENTER, NOTIFICATION_THRESHOLDS, HUANCAYO_ROUTES } from '../constants';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

type AuthStep = 'FORM' | 'OTP' | 'LOCATION';
type AuthMode = 'LOGIN' | 'REGISTER' | 'DRIVER_LOGIN';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<AuthStep>('FORM');
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState(''); // Para vecino (barrio) y conductor (ruta)
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---

  const handleAuthAction = () => {
    setError('');

    if (mode === 'REGISTER') {
      if (!name.trim()) return setError('Ingresa tu nombre.');
      if (phone.length < 9) return setError('Celular inválido.');
      if (password.length < 4) return setError('Contraseña muy corta.');
      if (password !== confirmPassword) return setError('Las contraseñas no coinciden.');
      if (!selectedRouteId) return setError('Selecciona tu barrio/ruta.');
      
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('OTP'); // Pasamos a validación de teléfono
      }, 1000);

    } else if (mode === 'LOGIN') {
      if (phone.length < 9) return setError('Celular inválido.');
      if (!password) return setError('Ingresa tu contraseña.');
      
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // En login exitoso, simulamos que recuperamos el perfil y pedimos confirmar ubicación
        setStep('LOCATION'); 
      }, 1000);
      
    } else if (mode === 'DRIVER_LOGIN') {
      if (!selectedRouteId) return setError('Debes seleccionar la ruta que vas a recorrer.');
      
      // Login directo del conductor
      const driverUser: User = {
        id: 'driver_' + Date.now(),
        name: 'Conductor EcoAlert',
        role: UserRole.DRIVER,
        location: DEFAULT_CENTER,
        routeId: selectedRouteId // La ruta que va a simular
      };
      onLoginSuccess(driverUser);
    }
  };

  const handleVerifyOtp = () => {
    // Simulación de código SMS
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('LOCATION');
    }, 1000);
  };

  const finishAuth = (coords: Coordinates, address: string) => {
    const finalName = mode === 'REGISTER' ? name : 'Usuario Huancayo'; 

    const newUser: User = {
      id: 'u_' + phone,
      name: finalName,
      phoneNumber: phone,
      role: UserRole.CITIZEN,
      location: coords,
      address: address,
      routeId: selectedRouteId || HUANCAYO_ROUTES[0].id, // Default si viene de login simple
      notificationSettings: {
        enabled: true,
        thresholdLong: NOTIFICATION_THRESHOLDS.LONG_RANGE,
        thresholdMedium: NOTIFICATION_THRESHOLDS.MEDIUM_RANGE,
        thresholdClose: NOTIFICATION_THRESHOLDS.ARRIVAL,
        silentHoursStart: 23,
        silentHoursEnd: 6
      }
    };
    onLoginSuccess(newUser);
  };

  // Captura de ubicación
  const handleGrantLocation = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentPosition();
      finishAuth(coords, "Ubicación GPS");
    } catch (err) {
      setError('Error de GPS. Intenta "Demo Huancayo".');
      setLoading(false);
    }
  };

  const handleForceHuancayo = () => {
    setLoading(true);
    setTimeout(() => {
        finishAuth(DEFAULT_CENTER, "Huancayo (Ubicación Demo)");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-600 p-4 rounded-2xl shadow-lg mb-4">
            <Truck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900">EcoAlert</h1>
          <p className="text-slate-500">Recolección Silenciosa Huancayo</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          
          {/* STEP 1: FORMULARIOS */}
          {step === 'FORM' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Título dinámico */}
              <div className="text-center pb-2 border-b border-slate-100 mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  {mode === 'LOGIN' && 'Bienvenido Vecino'}
                  {mode === 'REGISTER' && 'Registro de Vecino'}
                  {mode === 'DRIVER_LOGIN' && 'Acceso Conductores'}
                </h2>
              </div>

              {/* Campos Registro */}
              {mode === 'REGISTER' && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Nombre Completo" 
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${error && !name ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {/* Campos Login/Registro (Teléfono) */}
              {mode !== 'DRIVER_LOGIN' && (
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type="tel" 
                    placeholder="Número de Celular" 
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${error && phone.length < 9 ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                  />
                </div>
              )}

              {/* Campos Contraseña */}
              {mode !== 'DRIVER_LOGIN' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Contraseña" 
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${error && !password ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {/* Confirmar Pass (Solo Registro) */}
              {mode === 'REGISTER' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    placeholder="Confirmar Contraseña" 
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${error && password !== confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {/* Selector de Ruta (Registro Vecino o Login Conductor) */}
              {(mode === 'REGISTER' || mode === 'DRIVER_LOGIN') && (
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 ml-1">
                     {mode === 'REGISTER' ? '¿En qué zona vives?' : '¿Qué ruta vas a recorrer?'}
                   </label>
                   <div className="relative">
                      <Navigation className="absolute left-3 top-3 text-slate-400" size={20} />
                      <select
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white appearance-none ${error && !selectedRouteId ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                        value={selectedRouteId}
                        onChange={(e) => setSelectedRouteId(e.target.value)}
                      >
                        <option value="">Seleccionar Ruta...</option>
                        {HUANCAYO_ROUTES.map(route => (
                          <option key={route.id} value={route.id}>{route.name}</option>
                        ))}
                      </select>
                   </div>
                </div>
              )}

              {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded text-center animate-pulse">{error}</p>}

              <Button fullWidth onClick={handleAuthAction} disabled={loading} size="lg">
                {loading ? 'Cargando...' : mode === 'LOGIN' ? 'Ingresar' : mode === 'REGISTER' ? 'Registrarme' : 'Iniciar Ruta'}
              </Button>

              {/* Links de cambio de modo */}
              <div className="pt-4 flex flex-col items-center gap-3 border-t border-slate-100">
                {mode === 'LOGIN' && (
                  <>
                    <button onClick={() => {setMode('REGISTER'); setError('');}} className="text-sm text-emerald-600 font-semibold">
                      ¿Nuevo vecino? Regístrate aquí
                    </button>
                    <button onClick={() => {setMode('DRIVER_LOGIN'); setError('');}} className="text-xs text-slate-400 hover:text-slate-600">
                      Soy Conductor
                    </button>
                  </>
                )}
                
                {mode === 'REGISTER' && (
                  <button onClick={() => {setMode('LOGIN'); setError('');}} className="text-sm text-emerald-600 font-semibold">
                    ¿Ya tienes cuenta? Ingresa aquí
                  </button>
                )}

                {mode === 'DRIVER_LOGIN' && (
                  <button onClick={() => {setMode('LOGIN'); setError('');}} className="text-sm text-slate-500 font-semibold">
                    Volver a acceso Vecinos
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: OTP (Solo Registro) */}
          {step === 'OTP' && (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold">Verificar Teléfono</h2>
              <p className="text-sm text-slate-500">Código enviado al {phone}</p>
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded font-mono text-lg tracking-widest font-bold">
                123456 (Simulado)
              </div>
              <Button fullWidth onClick={handleVerifyOtp} disabled={loading}>
                {loading ? 'Verificando...' : 'Confirmar'}
              </Button>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {step === 'LOCATION' && (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <MapPinned size={32} className="text-emerald-600"/>
              </div>
              <h2 className="text-xl font-bold">Configurar Ubicación</h2>
              <p className="text-sm text-slate-500">
                Para avisarte cuando llegue el camión, necesitamos saber dónde es tu casa en Huancayo.
              </p>
              
              <Button fullWidth onClick={handleGrantLocation} variant="outline">
                <MapPin size={18} /> Usar GPS del Celular
              </Button>

              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">- O -</div>

              <Button fullWidth onClick={handleForceHuancayo} disabled={loading}>
                 {loading ? (
                   <span className="flex items-center gap-2">
                     <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                     Cargando...
                   </span>
                 ) : (
                   <>
                     <MapPinned size={18} /> Usar Ubicación Demo (Huancayo)
                   </>
                 )}
              </Button>
              <p className="text-[10px] text-slate-400">
                * Recomendado si estás probando la app desde fuera de Huancayo.
              </p>
            </div>
          )}

        </Card>
        <p className="text-center text-xs text-slate-400 mt-6">© 2025 EcoAlert Huancayo</p>
      </div>
    </div>
  );
};

export default AuthScreen;
