
export interface Coordinates {
  lat: number;
  lng: number;
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export interface WasteRoute {
  id: string;
  name: string; // Ej: "Ruta 1 - Palián"
  description: string;
  path: Coordinates[]; // Puntos para la simulación
}

export interface User {
  id: string;
  name: string;
  phoneNumber?: string; 
  password?: string; // Solo para validación en frontend simulado
  role: UserRole;
  address?: string; 
  location?: Coordinates; 
  routeId?: string; // La ruta/zona a la que pertenece el vecino
  notificationSettings?: {
    enabled: boolean;
    // Umbrales configurables por el usuario (metros)
    thresholdLong: number;   // default 1000
    thresholdMedium: number; // default 500
    thresholdClose: number;  // default 50 (llegada)
    silentHoursStart: number; 
    silentHoursEnd: number; 
  };
}

export interface Truck {
  id: string;
  routeId: string; // Ruta que está cubriendo actualmente
  driverName: string;
  location: Coordinates;
  isMoving: boolean;
  lastUpdate: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: number;
}

export interface EcoTacho {
  id: string;
  nombre: string;
  tipo: 'Domiciliario' | 'Comunitario' | 'Punto Verde' | 'Industrial';
  capacidadLitros: number;
  casasSugeridas: string;
  precioMin: number;
  precioMax: number;
  moneda: string;
  descripcion: string;
  beneficios: string[];
  activo: boolean;
  image?: string;
}