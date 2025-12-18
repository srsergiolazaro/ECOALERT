
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Truck as TruckIcon, Settings, Navigation, Bell, ShoppingBag, Save, LogOut, CheckCircle } from 'lucide-react';
import { User, UserRole, Truck, AppNotification, WasteRoute, Coordinates } from './types';
import { HUANCAYO_ROUTES, NOTIFICATION_THRESHOLDS } from './constants';
import { calculateDistance } from './services/geoService';
import MapView from './components/MapView';
import { Button, Card } from './components/Button';
import NotificationToast from './components/NotificationToast';
import AuthScreen from './components/AuthScreen';
import EcoTachosView from './components/EcoTachosView';
import LocationSearch from './components/LocationSearch';
import { AnimatePresence, motion } from 'framer-motion';

// URL de sonido de notificación suave
const ALERT_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'shop' | 'settings'>('map');
  
  const [truck, setTruck] = useState<Truck | null>(null);
  const [activeRoute, setActiveRoute] = useState<WasteRoute | null>(null);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  
  // Estado para controlar si el usuario ya entregó su basura
  const [trashDelivered, setTrashDelivered] = useState(false);

  // Estado local para edición de configuración (Settings)
  const [tempSettings, setTempSettings] = useState({
    thresholdLong: NOTIFICATION_THRESHOLDS.LONG_RANGE.toString(),
    thresholdMedium: NOTIFICATION_THRESHOLDS.MEDIUM_RANGE.toString(),
    thresholdClose: NOTIFICATION_THRESHOLDS.ARRIVAL.toString(),
    routeId: '' // Agregado para modificar zona
  });
  
  // Simulation State
  const [simulatingMovement, setSimulatingMovement] = useState(false);
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ref para controlar notificaciones enviadas en el ciclo actual
  const sentNotifications = useRef({
    longRange: false,
    mediumRange: false,
    arrival: false,
    movementStarted: false
  });

  // --- INITIALIZE AUDIO & PERMISSIONS ---
  useEffect(() => {
    audioRef.current = new Audio(ALERT_SOUND_URL);
    
    // Solicitar permiso para Notificaciones Nativas del Navegador
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const playAlertSound = () => {
    // Si ya entregó la basura, no reproducir sonido
    if (trashDelivered) return;

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed)", e));
      
      // Vibrar si es posible (200ms)
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  };

  const stopAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const sendNativeNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/vite.svg', // Icono genérico por ahora
        vibrate: [200, 100, 200]
      } as any);
    }
  };

  // --- HANDLERS ---

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Inicializar configuración temporal
    if (loggedInUser.notificationSettings) {
      setTempSettings({
        thresholdLong: loggedInUser.notificationSettings.thresholdLong.toString(),
        thresholdMedium: loggedInUser.notificationSettings.thresholdMedium.toString(),
        thresholdClose: loggedInUser.notificationSettings.thresholdClose.toString(),
        routeId: loggedInUser.routeId || ''
      });
    }

    // Configurar la ruta activa
    const route = HUANCAYO_ROUTES.find(r => r.id === loggedInUser.routeId);
    setActiveRoute(route || null);

    // Si es ciudadano, inicializamos un camión "fantasma" en el inicio de su ruta
    if (loggedInUser.role === UserRole.CITIZEN && route) {
      setTruck({
        id: 't_sim',
        routeId: route.id,
        driverName: 'Conductor Asignado',
        location: route.path[0],
        isMoving: false,
        lastUpdate: Date.now()
      });
    }
  };

  const handleTrashDelivered = () => {
    setTrashDelivered(true);
    setSimulatingMovement(false); // Detener el camión
    stopAlertSound(); // Silenciar inmediatamente
    
    triggerNotification({
      id: 'delivered_' + Date.now(),
      title: '¡Basura Entregada!',
      message: 'El camión se ha detenido y las alertas se han silenciado.',
      type: 'success',
      timestamp: Date.now()
    });
  };

  const handleSaveSettings = () => {
    if (!user || !user.notificationSettings) return;

    // Actualizar configuración numérica
    const newSettings = {
      ...user.notificationSettings,
      thresholdLong: parseInt(tempSettings.thresholdLong) || 1000,
      thresholdMedium: parseInt(tempSettings.thresholdMedium) || 500,
      thresholdClose: parseInt(tempSettings.thresholdClose) || 50,
    };

    // Actualizar Ruta Activa si cambió
    let updatedRouteId = user.routeId;
    if (tempSettings.routeId && tempSettings.routeId !== user.routeId) {
       updatedRouteId = tempSettings.routeId;
       const newRoute = HUANCAYO_ROUTES.find(r => r.id === tempSettings.routeId);
       setActiveRoute(newRoute || null);
       
       // Reiniciar camión simulado para la nueva ruta
       if (newRoute) {
         setTruck({
            id: 't_sim_new',
            routeId: newRoute.id,
            driverName: 'Conductor Asignado',
            location: newRoute.path[0],
            isMoving: false,
            lastUpdate: Date.now()
         });
         setSimulatingMovement(false); // Pausar para evitar saltos raros
         setTrashDelivered(false); // Resetear estado de entrega
         sentNotifications.current.movementStarted = false;
       }
    }

    setUser({ ...user, notificationSettings: newSettings, routeId: updatedRouteId });
    
    triggerNotification({
      id: Date.now().toString(),
      title: 'Configuración Guardada',
      message: 'Preferencias y zona actualizadas correctamente.',
      type: 'success',
      timestamp: Date.now()
    });
  };

  const handleUpdateLocation = (coords: Coordinates, address: string) => {
    if (!user) return;
    setUser({ ...user, location: coords, address: address });
    triggerNotification({
      id: Date.now().toString(),
      title: 'Ubicación Actualizada',
      message: `Nueva dirección: ${address}`,
      type: 'success',
      timestamp: Date.now()
    });
  };

  const triggerNotification = useCallback((note: AppNotification) => {
    setNotification(note);
    // Reproducir sonido para cualquier notificación importante
    if (note.type === 'warning' || note.type === 'success') {
       // Solo sonar si NO se ha entregado la basura (excepto si es la confirmación de entrega)
       if (note.title !== '¡Basura Entregada!') {
          playAlertSound();
       }
       sendNativeNotification(note.title, note.message);
    }
  }, [trashDelivered]); // Dependencia trashDelivered importante

  // --- SIMULATION EFFECT ---
  // Este efecto mueve el camión a lo largo de los puntos de la ruta seleccionada
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (simulatingMovement && activeRoute) {
      const path = activeRoute.path;

      // Alerta de inicio de movimiento (Solo una vez)
      if (!sentNotifications.current.movementStarted) {
         triggerNotification({
            id: 'start_' + Date.now(),
            title: 'Ruta Iniciada',
            message: `El camión de ${activeRoute.name} ha comenzado su recorrido.`,
            type: 'info',
            timestamp: Date.now()
         });
         // Solo sonar si no ha entregado basura
         if (!trashDelivered) playAlertSound(); 
         sentNotifications.current.movementStarted = true;
      }
      
      interval = setInterval(() => {
        setTruck(currentTruck => {
          if (!currentTruck) return null;

          // Encontrar índice actual aproximado
          const currentIdx = path.findIndex(
            p => p.lat === currentTruck.location.lat && p.lng === currentTruck.location.lng
          );
          
          let nextIndex = currentIdx + 1;
          
          // Loop de la ruta
          if (nextIndex >= path.length) {
            nextIndex = 0; 
            // Reset notificaciones al reiniciar ciclo
            sentNotifications.current = { longRange: false, mediumRange: false, arrival: false, movementStarted: true };
            // Resetear el estado de basura entregada para el "siguiente día/vuelta"
            setTrashDelivered(false);
          }

          const nextLocation = path[nextIndex];

          // Si es conductor, actualizamos su propia ubicación (GPS Simulado)
          if (user?.role === UserRole.DRIVER) {
             setUser(prev => prev ? ({ ...prev, location: nextLocation }) : null);
          }

          return {
            ...currentTruck,
            location: nextLocation,
            isMoving: true,
            lastUpdate: Date.now()
          };
        });
      }, 3000); // Actualiza cada 3 segundos
    } else {
       // Si se detiene la simulación
       if (!simulatingMovement) {
          sentNotifications.current.movementStarted = false;
       }
    }

    return () => clearInterval(interval);
  }, [simulatingMovement, activeRoute, user?.role, triggerNotification, trashDelivered]);


  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    // Si ya entregó la basura, no procesar alertas de distancia
    if (trashDelivered) return;

    // Solo ciudadanos reciben alertas
    if (user?.role !== UserRole.CITIZEN || !truck || !user.location || !user.notificationSettings?.enabled) return;

    // Verificar que el camión sea de la ruta del usuario
    if (truck.routeId !== user.routeId) return;

    const distance = calculateDistance(user.location, truck.location);
    const settings = user.notificationSettings;

    // 1. LLEGADA (Prioridad Alta)
    if (distance <= settings.thresholdClose && !sentNotifications.current.arrival) {
      triggerNotification({
          id: Date.now().toString(),
          title: '¡El camión está aquí!',
          message: `El recolector está a menos de ${Math.round(distance)}m. ¡Saca tu basura!`,
          type: 'success',
          timestamp: Date.now()
      });
      sentNotifications.current.arrival = true;
    } 
    // 2. RANGO MEDIO
    else if (distance <= settings.thresholdMedium && distance > settings.thresholdClose && !sentNotifications.current.mediumRange) {
      triggerNotification({
        id: Date.now().toString(),
        title: 'Camión Acercándose',
        message: `Está a ${Math.round(distance)}m. Prepárate.`,
        type: 'warning',
        timestamp: Date.now()
      });
      sentNotifications.current.mediumRange = true;
    }
    // 3. RANGO LARGO
    else if (distance <= settings.thresholdLong && distance > settings.thresholdMedium && !sentNotifications.current.longRange) {
      triggerNotification({
        id: Date.now().toString(),
        title: 'Aviso Preliminar',
        message: `El camión entró a tu zona (${Math.round(distance)}m).`,
        type: 'info',
        timestamp: Date.now()
      });
      sentNotifications.current.longRange = true;
    }

  }, [truck, user, triggerNotification, trashDelivered]);


  // --- RENDER ---

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // --- VISTA CONDUCTOR ---
  if (user.role === UserRole.DRIVER) {
    return (
      <div className="h-full w-full flex flex-col bg-slate-100">
        <header className="bg-slate-900 text-white p-4 pt-safe shadow-md z-10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TruckIcon className="text-emerald-400" /> Modo Conductor
            </h2>
            <p className="text-xs text-slate-400">
              {activeRoute ? activeRoute.name : 'Sin ruta asignada'}
            </p>
          </div>
          <button onClick={() => setUser(null)} className="p-2 bg-slate-800 rounded hover:bg-slate-700">
            <LogOut size={16} />
          </button>
        </header>

        <div className="flex-1 relative w-full h-full">
           <MapView userLocation={user.location!} role={UserRole.DRIVER} />
           
           <div className="absolute bottom-8 left-4 right-4 z-[400]">
             <Card className="bg-slate-900/95 text-white border-slate-700 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Estado GPS</p>
                    <p className={`font-mono font-bold ${simulatingMovement ? 'text-green-400' : 'text-amber-400'}`}>
                      {simulatingMovement ? '● TRANSMITIENDO' : '○ EN PAUSA'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Ruta</p>
                    <p className="font-bold">{activeRoute?.name.split(':')[0]}</p>
                  </div>
                </div>
                <Button 
                  fullWidth 
                  variant={simulatingMovement ? 'danger' : 'primary'}
                  onClick={() => setSimulatingMovement(!simulatingMovement)}
                >
                  {simulatingMovement ? 'Finalizar Recorrido' : 'Iniciar Ruta (Simulada)'}
                </Button>
                <p className="text-[10px] text-center text-slate-500 mt-2">
                  * En producción, esto activaría el GPS real del dispositivo.
                </p>
             </Card>
           </div>
        </div>
      </div>
    );
  }

  // --- VISTA CIUDADANO (LAYOUT FLEX COLUMN) ---
  // Estructura: [Contenido Flexible (Scroll)] + [Nav Fixed Size (No Scroll)]
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 overflow-hidden">
      <NotificationToast notification={notification} onDismiss={() => setNotification(null)} />
      
      {/* AREA DE CONTENIDO PRINCIPAL: Toma todo el espacio restante */}
      <main className="flex-1 w-full overflow-y-auto relative bg-slate-50 scroll-smooth">
        <AnimatePresence mode="wait">
          
          {/* --- MAP TAB --- */}
          {activeTab === 'map' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative min-h-full" 
            >
              <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-10 pointer-events-none">
                  <Card className="bg-white/95 backdrop-blur pointer-events-auto flex items-center justify-between shadow-lg border-0">
                     {truck && activeRoute ? (
                       <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${trashDelivered ? 'bg-slate-100' : 'bg-emerald-100 animate-pulse'}`}>
                           <TruckIcon className={trashDelivered ? 'text-slate-400' : 'text-emerald-600'} size={20} />
                         </div>
                         <div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{activeRoute.name}</p>
                           <p className="font-bold text-slate-800 text-sm">
                             {trashDelivered 
                               ? 'Recolección Completada' 
                               : `A ${calculateDistance(user.location!, truck.location).toFixed(0)}m de casa`
                             }
                           </p>
                         </div>
                       </div>
                     ) : (
                       <div className="flex items-center gap-3 opacity-60">
                          <div className="bg-slate-100 p-2 rounded-full">
                             <TruckIcon className="text-slate-400" size={20} />
                          </div>
                          <p className="text-slate-500 text-sm">Camión no activo en tu zona</p>
                       </div>
                     )}
                  </Card>
              </div>

              <div className="absolute inset-0 z-0 h-full w-full">
                 <MapView 
                   userLocation={user.location!} 
                   truck={truck}
                   role={UserRole.CITIZEN} 
                   onTruckClick={() => {
                     if (!trashDelivered) {
                       setSimulatingMovement(true);
                     }
                   }}
                  />
              </div>
              
              {/* BOTONES FLOTANTES */}
              <div className="absolute bottom-6 left-0 right-0 px-4 z-[400] flex items-end justify-between pointer-events-none">
                 
                 {/* BOTÓN YA ENTREGUE (IZQUIERDA/CENTRO) */}
                 <div className="pointer-events-auto flex-1 mr-4">
                   {activeRoute && truck && (
                     !trashDelivered ? (
                       <Button 
                        onClick={handleTrashDelivered}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl border-2 border-white w-full flex items-center justify-center gap-2 animate-bounce-slight"
                       >
                         <CheckCircle size={20} /> Ya entregué mi basura
                       </Button>
                     ) : (
                       <div className="bg-white/90 backdrop-blur text-emerald-700 px-4 py-3 rounded-xl font-bold text-sm shadow-lg border border-emerald-100 text-center flex items-center justify-center gap-2">
                          <CheckCircle size={18} className="fill-emerald-100" /> ¡Listo! Alertas silenciadas.
                       </div>
                     )
                   )}
                 </div>

                 {/* BOTÓN SIMULACIÓN (DERECHA) */}
                 <div className="pointer-events-auto">
                    <button 
                      onClick={() => {
                        if (trashDelivered) {
                           setTrashDelivered(false);
                           setSimulatingMovement(true);
                           triggerNotification({
                              id: 'reset_' + Date.now(),
                              title: 'Simulación Reiniciada',
                              message: 'Has reactivado las alertas.',
                              type: 'info',
                              timestamp: Date.now()
                           });
                        } else {
                           setSimulatingMovement(!simulatingMovement);
                        }
                      }}
                      className={`p-3 rounded-full shadow-xl border-2 transition-all ${simulatingMovement ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      <Navigation size={24} className={simulatingMovement ? 'animate-pulse' : ''} />
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {/* --- SHOP TAB --- */}
          {activeTab === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <EcoTachosView />
            </motion.div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6 pt-safe pb-safe"
            >
              <h2 className="text-2xl font-bold text-slate-800">Mi Perfil</h2>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                 <div className="bg-emerald-100 h-12 w-12 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">
                   {user.name.charAt(0)}
                 </div>
                 <div>
                   <p className="font-bold text-lg leading-none">{user.name}</p>
                   <p className="text-xs text-slate-500 mt-1">{user.phoneNumber}</p>
                 </div>
              </div>

              {/* SECCIÓN DE UBICACIÓN PERSONALIZADA */}
              <Card>
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MapPin className="text-emerald-600" size={20} /> Ubicación
                    </h3>
                 </div>
                 <p className="text-xs text-slate-400 font-bold uppercase mb-2">Mi Casa (Punto de Alerta)</p>
                 
                 <LocationSearch onLocationSelect={handleUpdateLocation} />
                 
                 <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Actual: </span>
                    <span className="text-sm font-medium text-slate-700 truncate flex-1">
                      {user.address || 'Ubicación GPS / Demo'}
                    </span>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Zona / Barrio</p>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={tempSettings.routeId}
                      onChange={(e) => setTempSettings({...tempSettings, routeId: e.target.value})}
                    >
                       {HUANCAYO_ROUTES.map(route => (
                         <option key={route.id} value={route.id}>{route.name}</option>
                       ))}
                    </select>
                 </div>
              </Card>

              <Card>
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Bell className="text-emerald-600" size={20} /> Distancias de Alerta
                </h3>
                
                <div className="space-y-5">
                  {[
                    { label: 'Aviso Lejano (1km)', key: 'thresholdLong', default: 1000 },
                    { label: 'Aviso Medio (500m)', key: 'thresholdMedium', default: 500 },
                    { label: 'Aviso Llegada (50m)', key: 'thresholdClose', default: 50 },
                  ].map((item) => (
                    <div key={item.key} className="relative">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{item.label}</label>
                      <div className="flex items-center">
                        <input 
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={tempSettings[item.key as keyof typeof tempSettings]}
                          onChange={(e) => setTempSettings({...tempSettings, [item.key]: e.target.value})}
                        />
                        <span className="absolute right-4 text-sm font-bold text-slate-400">mts</span>
                      </div>
                    </div>
                  ))}

                  <Button fullWidth onClick={handleSaveSettings} className="mt-4">
                    <Save size={18} /> Guardar Cambios
                  </Button>
                </div>
              </Card>
              
               <Button variant="danger" fullWidth onClick={() => setUser(null)} className="mt-4">
                <LogOut size={18} /> Cerrar Sesión
              </Button>
              
              <p className="text-center text-xs text-slate-300 pb-8">EcoAlert v2.1 - Huancayo, Junín</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- BOTTOM NAV (BLOCK ELEMENT, NOT FIXED) --- 
          Al estar dentro de un flex-col que ocupa el 100% de la pantalla,
          este nav siempre estará al fondo visible. shrink-0 evita que se aplaste.
      */}
      <nav className="h-16 shrink-0 bg-white border-t border-slate-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-50 relative pb-safe">
        <div className="flex justify-around items-center h-full max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center active:scale-95 transition-all duration-200 ${activeTab === 'map' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'map' ? 'bg-emerald-50' : ''}`}>
              <MapPin size={24} strokeWidth={activeTab === 'map' ? 2.5 : 2} fill={activeTab === 'map' ? "currentColor" : "none"} />
            </div>
            <span className="text-[10px] font-bold">Mapa</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center active:scale-95 transition-all duration-200 ${activeTab === 'shop' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'shop' ? 'bg-emerald-50' : ''}`}>
              <ShoppingBag size={24} strokeWidth={activeTab === 'shop' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">EcoTachos</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center active:scale-95 transition-all duration-200 ${activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-50' : ''}`}>
              <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
