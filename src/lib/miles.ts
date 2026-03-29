export type SeatClass = 'economy' | 'business' | 'first';

export interface CargoItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MilesData {
  balance: number;
  seatClass: SeatClass;
}

const MILES_KEY = 'focus-flight-miles';

export function loadMiles(): MilesData {
  try {
    const raw = localStorage.getItem(MILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { balance: 0, seatClass: 'economy' };
}

export function saveMiles(data: MilesData): void {
  try { localStorage.setItem(MILES_KEY, JSON.stringify(data)); } catch {}
}

export function addMiles(amount: number): MilesData {
  const data = loadMiles();
  data.balance += amount;
  saveMiles(data);
  return data;
}

export function deductMiles(amount: number): MilesData {
  const data = loadMiles();
  data.balance = Math.max(0, data.balance - amount);
  saveMiles(data);
  return data;
}

export function purchaseClass(cls: SeatClass): { success: boolean; data: MilesData } {
  const data = loadMiles();
  const cost = CLASS_COSTS[cls];
  if (data.balance < cost) return { success: false, data };
  data.balance -= cost;
  data.seatClass = cls;
  saveMiles(data);
  return { success: true, data };
}

export const CLASS_COSTS: Record<SeatClass, number> = {
  economy: 0,
  business: 500,
  first: 2000,
};

export const CLASS_LABELS: Record<SeatClass, string> = {
  economy: 'Economy',
  business: 'Business Class',
  first: 'First Class',
};
