import { MonthData, PhoneTypeConfig } from './types';
import { INITIAL_MONTHS, DEFAULT_PHONE_TYPES } from './initialData';

const STORAGE_KEYS = {
  MONTHS: 'oyigo_tracker_months_v1',
  PHONE_TYPES: 'oyigo_tracker_phone_types_v1',
  ACTIVE_MONTH: 'oyigo_tracker_active_month_v1',
};

export function loadStoredPhoneTypes(): PhoneTypeConfig[] {
  if (typeof window === 'undefined') return DEFAULT_PHONE_TYPES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PHONE_TYPES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load phone types from localStorage', e);
  }
  return DEFAULT_PHONE_TYPES;
}

export function saveStoredPhoneTypes(types: PhoneTypeConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PHONE_TYPES, JSON.stringify(types));
  } catch (e) {
    console.error('Failed to save phone types', e);
  }
}

export function loadStoredMonths(): MonthData[] {
  if (typeof window === 'undefined') return INITIAL_MONTHS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load months from localStorage', e);
  }
  return INITIAL_MONTHS;
}

export function saveStoredMonths(months: MonthData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(months));
  } catch (e) {
    console.error('Failed to save months', e);
  }
}

export function exportBackupJSON(months: MonthData[], phoneTypes: PhoneTypeConfig[]): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    phoneTypes,
    months,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oyigo-float-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(month: MonthData, headers: string[], rows: (string | number)[][]): void {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a');
  a.href = encodedUri;
  a.download = `${month.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_ledger.csv`;
  a.click();
}

export function resetToDefaults(): { months: MonthData[]; phoneTypes: PhoneTypeConfig[] } {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.MONTHS);
    localStorage.removeItem(STORAGE_KEYS.PHONE_TYPES);
  }
  return {
    months: INITIAL_MONTHS,
    phoneTypes: DEFAULT_PHONE_TYPES,
  };
}
