export interface City {
  name: string;
  region: string;
  monthlyHSP: number[];
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  // Extended fields from Explorador Solar
  latitude?: number;
  longitude?: number;
  altitude?: number; // msnm
  globalHorizontal?: number; // kWh/m2/día annual
  globalTilted?: number; // kWh/m2/día annual
  directNormal?: number; // kWh/m2/día annual
  diffuseHorizontal?: number; // kWh/m2/día annual
  cloudFrequency?: number; // %
  windSpeed?: number; // m/s
}

export interface PanelModel {
  id: string;
  brand: string;
  model: string;
  power: number; // Wp
  voc: number;   // V
  isc: number;   // A
  vmp: number;   // V
  imp: number;   // A
  gamma: number; // %/°C power temp coeff (negative)
  beta: number;  // %/°C voltage temp coeff (negative)
  area: number;  // m²
  noct: number;  // °C
}

export interface BatterySpec {
  type: string;
  label: string;
  nominalV: number;
  capacityAh: number;
  cyclesAtRefDoD: number;
  refDoD: number;
  calendarLife: number; // years
  costCLP: number;
}

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const CO2_FACTOR_TCO2_PER_MWH = 0.38; // Chile SEN grid factor
export const UF_TO_CLP = 37_500; // approx
export const USD_TO_CLP = 950; // approx

export const cities: City[] = [
  { name: 'Arica', region: 'XV', monthlyHSP: [7.5,7.2,6.5,5.5,4.5,4.0,4.2,5.0,5.8,6.8,7.3,7.6], avgTemp: 20, minTemp: 10, maxTemp: 30 },
  { name: 'Iquique', region: 'I', monthlyHSP: [7.3,7.0,6.3,5.3,4.3,3.8,4.0,4.8,5.6,6.6,7.1,7.4], avgTemp: 19, minTemp: 12, maxTemp: 28 },
  { name: 'Calama', region: 'II', monthlyHSP: [8.2,7.8,7.2,6.5,5.5,5.0,5.2,6.0,7.0,7.8,8.0,8.3], avgTemp: 14, minTemp: -2, maxTemp: 28 },
  { name: 'Antofagasta', region: 'II', monthlyHSP: [7.8,7.5,6.8,5.8,4.8,4.2,4.5,5.3,6.2,7.0,7.5,7.9], avgTemp: 18, minTemp: 10, maxTemp: 26 },
  { name: 'Copiapó', region: 'III', monthlyHSP: [7.5,7.2,6.5,5.2,4.2,3.6,3.8,4.6,5.6,6.5,7.2,7.6], avgTemp: 17, minTemp: 5, maxTemp: 30 },
  { name: 'La Serena', region: 'IV', monthlyHSP: [7.0,6.8,6.0,4.8,3.8,3.2,3.4,4.2,5.2,6.2,6.8,7.1], avgTemp: 15, minTemp: 7, maxTemp: 24 },
  { name: 'Valparaíso', region: 'V', monthlyHSP: [6.5,6.2,5.5,4.2,3.2,2.8,3.0,3.6,4.5,5.5,6.2,6.6], avgTemp: 14, minTemp: 6, maxTemp: 24 },
  { name: 'Santiago', region: 'RM', monthlyHSP: [6.8,6.5,5.5,4.2,3.0,2.5,2.7,3.5,4.5,5.5,6.5,7.0], avgTemp: 15, minTemp: 2, maxTemp: 32 },
  { name: 'Rancagua', region: 'VI', monthlyHSP: [6.7,6.3,5.3,4.0,2.9,2.4,2.6,3.4,4.4,5.4,6.3,6.8], avgTemp: 15, minTemp: 2, maxTemp: 32 },
  { name: 'Talca', region: 'VII', monthlyHSP: [6.5,6.0,5.0,3.8,2.7,2.2,2.4,3.2,4.2,5.2,6.2,6.6], avgTemp: 14, minTemp: 3, maxTemp: 30 },
  { name: 'Concepción', region: 'VIII', monthlyHSP: [5.8,5.5,4.5,3.2,2.3,1.8,2.0,2.8,3.5,4.5,5.5,5.9], avgTemp: 13, minTemp: 4, maxTemp: 26 },
  { name: 'Temuco', region: 'IX', monthlyHSP: [5.5,5.2,4.2,2.8,2.0,1.5,1.7,2.5,3.3,4.3,5.2,5.6], avgTemp: 12, minTemp: 2, maxTemp: 24 },
  { name: 'Valdivia', region: 'XIV', monthlyHSP: [5.2,4.8,3.8,2.5,1.8,1.3,1.5,2.2,3.0,4.0,5.0,5.3], avgTemp: 11, minTemp: 2, maxTemp: 22 },
  { name: 'Punta Arenas', region: 'XII', monthlyHSP: [5.0,4.2,3.0,1.8,1.0,0.7,0.8,1.5,2.8,4.0,5.0,5.2], avgTemp: 7, minTemp: -2, maxTemp: 16 },
];

export const panelModels: PanelModel[] = [
  { id: 'jinko-550', brand: 'Jinko Solar', model: 'Tiger Neo 550W', power: 550, voc: 49.62, isc: 14.03, vmp: 41.58, imp: 13.23, gamma: -0.30, beta: -0.25, area: 2.58, noct: 45 },
  { id: 'jinko-470', brand: 'Jinko Solar', model: 'Tiger Neo 470W', power: 470, voc: 44.80, isc: 13.30, vmp: 37.50, imp: 12.54, gamma: -0.30, beta: -0.25, area: 2.21, noct: 45 },
  { id: 'longi-545', brand: 'LONGi', model: 'Hi-MO 5 545W', power: 545, voc: 49.35, isc: 13.95, vmp: 41.30, imp: 13.20, gamma: -0.34, beta: -0.27, area: 2.57, noct: 45 },
  { id: 'longi-450', brand: 'LONGi', model: 'Hi-MO 6 450W', power: 450, voc: 41.70, isc: 13.75, vmp: 34.50, imp: 13.04, gamma: -0.34, beta: -0.27, area: 2.10, noct: 45 },
  { id: 'canadian-545', brand: 'Canadian Solar', model: 'HiKu6 CS6W-545MS', power: 545, voc: 49.50, isc: 13.90, vmp: 41.40, imp: 13.16, gamma: -0.34, beta: -0.26, area: 2.58, noct: 45 },
  { id: 'canadian-440', brand: 'Canadian Solar', model: 'HiKu7 CS7N-440MS', power: 440, voc: 40.90, isc: 13.72, vmp: 33.90, imp: 12.98, gamma: -0.34, beta: -0.26, area: 2.05, noct: 45 },
  { id: 'trina-550', brand: 'Trina Solar', model: 'Vertex S+ 550W', power: 550, voc: 49.80, isc: 14.00, vmp: 41.70, imp: 13.19, gamma: -0.34, beta: -0.25, area: 2.58, noct: 45 },
];

export const batteryModels: BatterySpec[] = [
  { type: 'AGM', label: 'AGM 12V 200Ah', nominalV: 12, capacityAh: 200, cyclesAtRefDoD: 1200, refDoD: 0.50, calendarLife: 5, costCLP: 180000 },
  { type: 'GEL', label: 'GEL 12V 200Ah', nominalV: 12, capacityAh: 200, cyclesAtRefDoD: 1500, refDoD: 0.50, calendarLife: 7, costCLP: 250000 },
  { type: 'LiFePO4', label: 'LiFePO4 12V 200Ah', nominalV: 12, capacityAh: 200, cyclesAtRefDoD: 5000, refDoD: 0.80, calendarLife: 12, costCLP: 550000 },
];

export interface LoadItem {
  id: string;
  name: string;
  watts: number;
  hours: number;
  qty: number;
}

export const defaultLoads: LoadItem[] = [
  { id: '1', name: 'Iluminación LED', watts: 60, hours: 6, qty: 1 },
  { id: '2', name: 'Refrigerador', watts: 150, hours: 24, qty: 1 },
  { id: '3', name: 'Televisor', watts: 80, hours: 5, qty: 1 },
  { id: '4', name: 'Computador', watts: 120, hours: 4, qty: 1 },
];