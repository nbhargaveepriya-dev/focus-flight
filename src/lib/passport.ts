export interface PassportStamp {
  id: string;
  cityCode: string;
  cityName: string;
  date: string;
  flightNumber: string;
  minutesFocused: number;
}

export interface PassportData {
  stamps: PassportStamp[];
  totalMinutesFocused: number;
}

const STORAGE_KEY = 'focus-flight-passport';

export function loadPassport(): PassportData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { stamps: [], totalMinutesFocused: 0 };
}

export function savePassport(data: PassportData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function addStamp(
  cityCode: string,
  cityName: string,
  flightNumber: string,
  minutesFocused: number
): PassportData {
  const passport = loadPassport();
  const stamp: PassportStamp = {
    id: `${cityCode}-${Date.now()}`,
    cityCode,
    cityName,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    flightNumber,
    minutesFocused
  };
  passport.stamps.push(stamp);
  passport.totalMinutesFocused += minutesFocused;
  savePassport(passport);
  return passport;
}

export function isDiamondStatus(passport: PassportData): boolean {
  return passport.totalMinutesFocused >= 6000; // 100 hours
}
