
import { Coordinates, EcoTacho, WasteRoute } from './types';

// Huancayo, Junín, Perú - Ubicación por defecto (Parque Constitución)
export const DEFAULT_CENTER: Coordinates = {
  lat: -12.0681,
  lng: -75.2106
};

// --- DATA PARA AUTOCOMPLETADO (LUGARES HUANCAYO) ---
export const HUANCAYO_LANDMARKS = [
  { name: "Parque Constitución", address: "Jr. Puno & Calle Real", lat: -12.0681, lng: -75.2106 },
  { name: "Plaza Huamanmarca", address: "Calle Real & Jr. Piura", lat: -12.0695, lng: -75.2118 },
  { name: "Real Plaza Huancayo", address: "Av. Gral. Cordova", lat: -12.0635, lng: -75.2075 },
  { name: "Estadio Huancayo", address: "Av. 9 de Diciembre", lat: -12.0605, lng: -75.2185 },
  { name: "Parque de la Identidad Wanka", address: "Barrio San Antonio", lat: -12.0535, lng: -75.2015 },
  { name: "Mercado Mayorista", address: "Av. Ferrocarril", lat: -12.0655, lng: -75.2155 },
  { name: "Universidad Nacional del Centro (UNCP)", address: "Av. Mariscal Castilla 3909", lat: -12.0435, lng: -75.2285 },
  { name: "UPLA - Chorrillos", address: "Av. Giráldez", lat: -12.0505, lng: -75.1850 },
  { name: "Cerrito de la Libertad", address: "Cerrito de la Libertad", lat: -12.0585, lng: -75.1955 },
  { name: "Terminal Terrestre Huancayo", address: "Av. Evitamiento", lat: -12.0525, lng: -75.2205 },
  { name: "Hospital Carrión", address: "Av. Daniel Alcides Carrión", lat: -12.0615, lng: -75.2165 },
  { name: "Comisaría de Huancayo", address: "Calle Real", lat: -12.0675, lng: -75.2095 },
  { name: "Open Plaza Huancayo", address: "Av. Ferrocarril", lat: -12.0725, lng: -75.2145 },
  { name: "Parque Tupac Amaru", address: "San Carlos", lat: -12.0620, lng: -75.2020 },
  { name: "Colegio Salesiano", address: "San Carlos", lat: -12.0650, lng: -75.2060 },
  { name: "Municipalidad de El Tambo", address: "Av. Mariscal Castilla", lat: -12.0550, lng: -75.2150 },
  { name: "Justicia Paz y Vida", address: "El Tambo Sector Norte", lat: -12.0305, lng: -75.2250 },
  { name: "Parque de los Sombreros", address: "El Tambo", lat: -12.0510, lng: -75.2120 },
  { name: "Parque Peñaloza", address: "Chilca", lat: -12.0790, lng: -75.2160 },
];

// --- RUTAS DE HUANCAYO (AMPLIADAS) ---

// Ruta 1: Este -> Centro
const RUTA_PALIAN_SAN_CARLOS: Coordinates[] = [
  { lat: -12.0505, lng: -75.1850 }, // Palián (UPLA)
  { lat: -12.0540, lng: -75.1900 }, // Cooperativa Santa Isabel
  { lat: -12.0580, lng: -75.1960 }, // San Carlos
  { lat: -12.0620, lng: -75.2020 }, // Parque Tupac
  { lat: -12.0650, lng: -75.2060 }, // Colegio Salesiano
  { lat: -12.0681, lng: -75.2106 }, // Centro
];

// Ruta 2: Norte -> Centro (Eje Principal)
const RUTA_EL_TAMBO_PRINCIPAL: Coordinates[] = [
  { lat: -12.0420, lng: -75.2250 }, // Ciudad Universitaria (UNCP)
  { lat: -12.0480, lng: -75.2200 }, // Av. Mariscal Castilla
  { lat: -12.0520, lng: -75.2180 }, // El Tambo (Mun)
  { lat: -12.0550, lng: -75.2150 }, // Parque Bolognesi
  { lat: -12.0600, lng: -75.2120 }, // Bajando a Huancayo
  { lat: -12.0681, lng: -75.2106 }, // Centro
];

// Ruta 3: Sur -> Centro (Eje Principal)
const RUTA_CHILCA_CENTRO: Coordinates[] = [
  { lat: -12.0900, lng: -75.2200 }, // Chilca Alta
  { lat: -12.0850, lng: -75.2180 }, // Av. 9 de Diciembre
  { lat: -12.0780, lng: -75.2150 }, // Cerca al Cuartel
  { lat: -12.0720, lng: -75.2120 }, // Calle Real Sur
  { lat: -12.0681, lng: -75.2106 }, // Centro
];

// Ruta 4: Chilca Este (Ocopilla)
const RUTA_OCOPILLA: Coordinates[] = [
  { lat: -12.0800, lng: -75.2050 }, // Ocopilla Alta
  { lat: -12.0750, lng: -75.2080 }, // Próceres
  { lat: -12.0700, lng: -75.2100 }, // Cerca al Estadio
  { lat: -12.0681, lng: -75.2106 }, // Centro
];

// Ruta 5: El Tambo Noroeste (Justicia)
const RUTA_JUSTICIA: Coordinates[] = [
  { lat: -12.0250, lng: -75.2300 }, // Justicia Paz y Vida
  { lat: -12.0350, lng: -75.2250 }, // Asentamiento Humano
  { lat: -12.0450, lng: -75.2200 }, // Evitamiento
  { lat: -12.0550, lng: -75.2150 }, // Empalme El Tambo
];

// Ruta 6: San Antonio / Pio Pata
const RUTA_SAN_ANTONIO: Coordinates[] = [
  { lat: -12.0450, lng: -75.2100 }, // San Antonio
  { lat: -12.0500, lng: -75.2080 }, // Parque de la Identidad
  { lat: -12.0550, lng: -75.2050 }, // Pio Pata
  { lat: -12.0600, lng: -75.2080 }, // Cerca al Open Plaza
  { lat: -12.0650, lng: -75.2100 }, // Ferrocarril
];

// Ruta 7: Azapampa (Sur Profundo)
const RUTA_AZAPAMPA: Coordinates[] = [
  { lat: -12.1050, lng: -75.2250 }, // Azapampa
  { lat: -12.0950, lng: -75.2220 }, // Auquimarca
  { lat: -12.0900, lng: -75.2200 }, // Empalme Chilca
];

export const HUANCAYO_ROUTES: WasteRoute[] = [
  { id: 'r1', name: 'Ruta 1: Palián - San Carlos', description: 'UPLA, San Carlos, Colegio Salesiano', path: RUTA_PALIAN_SAN_CARLOS },
  { id: 'r2', name: 'Ruta 2: El Tambo - UNCP', description: 'Av. Mariscal Castilla, Parque Bolognesi', path: RUTA_EL_TAMBO_PRINCIPAL },
  { id: 'r3', name: 'Ruta 3: Chilca - Calle Real', description: 'Av. 9 de Diciembre, Calle Real Sur', path: RUTA_CHILCA_CENTRO },
  { id: 'r4', name: 'Ruta 4: Ocopilla - Estadio', description: 'Zona Este de Chilca, Próceres', path: RUTA_OCOPILLA },
  { id: 'r5', name: 'Ruta 5: Justicia Paz y Vida', description: 'El Tambo Norte, Evitamiento', path: RUTA_JUSTICIA },
  { id: 'r6', name: 'Ruta 6: San Antonio - Pio Pata', description: 'Parque Identidad, Open Plaza', path: RUTA_SAN_ANTONIO },
  { id: 'r7', name: 'Ruta 7: Azapampa - Auquimarca', description: 'Zona Sur Profundo', path: RUTA_AZAPAMPA },
];

// Umbrales de notificación por defecto (en metros)
export const NOTIFICATION_THRESHOLDS = {
  LONG_RANGE: 1000,
  MEDIUM_RANGE: 500,
  ARRIVAL: 50, // Ajustado a 50m para "Llegada"
};

// --- DATA SEMILLA: ECO TACHOS ---
// Imágenes actualizadas con TACHOS REALES
export const ECO_TACHOS_DATA: EcoTacho[] = [
  {
    id: 't1',
    nombre: 'Tacho Domiciliario con Ruedas',
    tipo: 'Domiciliario',
    capacidadLitros: 120,
    casasSugeridas: '3–5 viviendas',
    precioMin: 100, 
    precioMax: 120,
    moneda: 'PEN',
    descripcion: 'Tacho plástico gris con ruedas, ideal para pequeñas cuadras o pasajes. Resistente, fácil de mover y adecuado para residuos diarios.',
    beneficios: ['Fácil transporte', 'Tapa hermética anti-olores', 'Material reciclado'],
    activo: true,
    image: 'https://promart.vteximg.com.br/arquivos/ids/703444-1000-1000/image-b0b2e3e5c9b74052968843c088926217.jpg' // Tacho gris estándar
  },
  {
    id: 't2',
    nombre: 'Contenedor Comunitario Móvil',
    tipo: 'Comunitario',
    capacidadLitros: 660, 
    casasSugeridas: '20–30 viviendas',
    precioMin: 200, 
    precioMax: 280,
    moneda: 'PEN',
    descripcion: 'Contenedor comunitario de alta capacidad con 4 ruedas para colocarse en esquinas estratégicas. Reduce la cantidad de bolsas dispersas.',
    beneficios: ['Alta visibilidad', '4 Ruedas reforzadas', 'Tapa plana'],
    activo: true,
    image: 'https://contenedoresdebasura.com.mx/wp-content/uploads/2019/04/CONTENEDOR-660-LITROS-GRIS.jpg' // Contenedor grande 4 ruedas
  },
  {
    id: 't3',
    nombre: 'Punto Verde Modular (Set de 3)', 
    tipo: 'Punto Verde',
    capacidadLitros: 360, // 120L x 3
    casasSugeridas: 'Condominios o Parques',
    precioMin: 500, 
    precioMax: 600,
    moneda: 'PEN',
    descripcion: 'Estación de reciclaje completa. Conjunto de tres contenedores identificados por color para separación de residuos: Orgánicos, Reciclables y No Aprovechables.',
    beneficios: ['Fomenta el reciclaje', 'Colores normados', 'Estructura sólida'],
    activo: true,
    image: 'https://acdn.mitiendanube.com/stores/968/562/products/estacion-ambiental-3-cestos1-0072d62757279316d815949168128384-640-0.jpg' // Set reciclaje 3 colores
  }
];
