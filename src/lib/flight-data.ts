export interface City {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

export const cities: City[] = [
  { code: 'NYC', name: 'New York', lat: 40.7128, lon: -74.0060 },
  { code: 'LON', name: 'London', lat: 51.5074, lon: -0.1278 },
  { code: 'TYO', name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { code: 'PAR', name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { code: 'DXB', name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { code: 'SYD', name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { code: 'MEX', name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { code: 'GRU', name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { code: 'SIN', name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { code: 'LAX', name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { code: 'BER', name: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { code: 'YYZ', name: 'Toronto', lat: 43.6510, lon: -79.3470 },
  { code: 'BOM', name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { code: 'PEK', name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { code: 'ICN', name: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { code: 'AMS', name: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { code: 'ORD', name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { code: 'HKG', name: 'Hong Kong', lat: 22.3193, lon: 114.1694 }
];

// Calculate distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 1 min per 100km, min 15 mins, max 240 mins (4 hours) for practicality
export function calculateFlightDuration(city1: City, city2: City): number {
  if (city1.code === city2.code) return 25; // Default short flight if same city
  const distance = haversineDistance(city1.lat, city1.lon, city2.lat, city2.lon);
  const duration = Math.floor(distance / 100);
  return Math.min(Math.max(duration, 15), 240);
}

export type BreakSchedule = 'none' | 'short' | 'long';

export interface FlightPlan {
  departure: City;
  destination: City;
  breakSchedule: BreakSchedule;
  durationMinutes: number;
  flightNumber: string;
  gate: string;
  seat: string;
}

export const generateFlightNumber = () => `FF-${Math.floor(100 + Math.random() * 900)}`;
export const generateGate = () => `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(1 + Math.random() * 20)}`;
