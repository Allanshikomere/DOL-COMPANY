'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  LayoutDashboard,
  Table as TableIcon,
  Clock,
  History,
  Sliders,
  Plus,
  Calendar,
  RotateCcw,
  Smartphone,
  BookOpen,
  Sun,
  Palette,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  HardDrive
} from 'lucide-react';
import {
  MonthData,
  PhoneTypeConfig,
  DailyRecord,
  MonthSummary,
  SamsungTrackerEntry
} from '../lib/types';
import {
  INITIAL_MONTHS,
  DEFAULT_PHONE_TYPES,
  HISTORICAL_EXECUTIVE_SUMMARY,
  INITIAL_SAMSUNG_TRACKER
} from '../lib/initialData';
import { calculateMonth } from '../lib/engine';
import {
  loadStoredMonths,
  saveStoredMonths,
  loadStoredPhoneTypes,
  saveStoredPhoneTypes,
  resetToDefaults
} from '../lib/storage';
import { DashboardOverview } from '../components/DashboardOverview';
import { DailyLedgerTable } from '../components/DailyLedgerTable';
import { ReconciliationPanel } from '../components/ReconciliationPanel';
import { ColloLedgerTable } from '../components/ColloLedgerTable';
import { SettingsModal } from '../components/SettingsModal';
import { EntryModal } from '../components/EntryModal';
import { AddPhonesModal } from '../components/AddPhonesModal';
import { PasswordModal } from '../components/PasswordModal';
import { SamsungTrackerTable } from '../components/SamsungTrackerTable';
import { DirectCanvasRecorder } from '../components/DirectCanvasRecorder';
import { HowItWorksModal } from '../components/HowItWorksModal';
import { Sheet1View } from '../components/Sheet1View';
import { AllMonthsView } from '../components/AllMonthsView';
import { BottomSheetsBar, ActiveSheetView } from '../components/BottomSheetsBar';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [months, setMonths] = useState<MonthData[]>(INITIAL_MONTHS);
  const [phoneTypes, setPhoneTypes] = useState<PhoneTypeConfig[]>(DEFAULT_PHONE_TYPES);
  const [samsungTracker, setSamsungTracker] = useState<SamsungTrackerEntry[]>(INITIAL_SAMSUNG_TRACKER);
  const [activeMonthId, setActiveMonthId] = useState<string>('2026-09');
  
  // Navigation & View State
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'ledger' | 'samsung' | 'collo' | 'allmonths' | 'sheet1'>('ledger');
  const [bottomActiveView, setBottomActiveView] = useState<ActiveSheetView>('september');

  // Theme & Security
  const [theme, setTheme] = useState<'odoo' | 'light'>('odoo');
  const [ownerPassword, setOwnerPassword] = useState<string>('1234');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUnlockPrompt, setIsUnlockPrompt] = useState(false);

  // Interactive selection
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');
  const [ownerMode, setOwnerMode] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Live Counting Clock & Date State
  const [liveTime, setLiveTime] = useState<Date | null>(null);
  const [is24HourFormat, setIs24HourFormat] = useState<boolean>(false);

  useEffect(() => {
    setLiveTime(new Date());
    const clockInterval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const liveDateFormatted = useMemo(() => {
    if (!liveTime) return '';
    const monthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${liveTime.getDate()} ${monthsArr[liveTime.getMonth()]} ${liveTime.getFullYear()}`;
  }, [liveTime]);

  const liveTimeFormatted = useMemo(() => {
    if (!liveTime) return '--:--:--';
    return liveTime.toLocaleTimeString('en-US', {
      hour12: !is24HourFormat,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [liveTime, is24HourFormat]);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryModalDate, setEntryModalDate] = useState<string | undefined>(undefined);
  const [showAddPhonesModal, setShowAddPhonesModal] = useState(false);
  const [addPhonesDate, setAddPhonesDate] = useState<string>('2026-09-21');

  // Load from SQLite on mount
  const loadFromBackend = async () => {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.months?.length) setMonths(json.data.months);
        if (json.data.phoneTypes?.length) setPhoneTypes(json.data.phoneTypes);
        if (json.data.samsungTracker?.length) setSamsungTracker(json.data.samsungTracker);
        if (json.data.settings?.owner_password) setOwnerPassword(json.data.settings.owner_password);
        if (json.data.settings?.theme === 'light') {
          setTheme('light');
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          setTheme('odoo');
          document.documentElement.setAttribute('data-theme', 'odoo');
        }
      }
    } catch (e) {
      console.warn('Backend SQLite not reachable, using offline cache', e);
      setMonths(loadStoredMonths());
      setPhoneTypes(loadStoredPhoneTypes());
      const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('oyigo_theme') : null;
      const t = savedTheme === 'light' ? 'light' : 'odoo';
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('oyigo_theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'odoo');
    }
    loadFromBackend();
    setMounted(true);
  }, []);

  // Save changes to localStorage as fallback
  useEffect(() => {
    if (mounted) {
      saveStoredMonths(months);
      localStorage.setItem('oyigo_samsung_tracker', JSON.stringify(samsungTracker));
    }
  }, [months, samsungTracker, mounted]);

  useEffect(() => {
    if (mounted) {
      saveStoredPhoneTypes(phoneTypes);
    }
  }, [phoneTypes, mounted]);

  const cycleTheme = (nextTheme?: 'odoo' | 'light') => {
    const target = nextTheme || (theme === 'odoo' ? 'light' : 'odoo');
    setTheme(target);
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('oyigo_theme', target);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_setting', key: 'theme', value: target }),
    }).catch(console.error);
  };

  const handleSavePassword = (newPass: string) => {
    setOwnerPassword(newPass);
    localStorage.setItem('oyigo_owner_password', newPass);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_setting', key: 'owner_password', value: newPass }),
    }).catch(console.error);
  };

  const handleToggleLock = () => {
    if (isLocked) {
      setIsUnlockPrompt(true);
      setShowPasswordModal(true);
    } else {
      setIsLocked(true);
    }
  };

  // Dynamically link monthly rollover floats
  const computedMonthsWithRollover = useMemo(() => {
    let prevClosing = 200000;
    return months.map((m, idx) => {
      const opening = idx === 0 ? m.openingFloat : prevClosing;
      const monthWithOpening = { ...m, openingFloat: opening };
      const { summary: mSummary } = calculateMonth(monthWithOpening, phoneTypes, samsungTracker);
      prevClosing = mSummary.closingFloat;
      return monthWithOpening;
    });
  }, [months, phoneTypes, samsungTracker]);

  // Current active month object
  const currentMonth = useMemo(() => {
    return computedMonthsWithRollover.find((m) => m.id === activeMonthId) || computedMonthsWithRollover[0];
  }, [computedMonthsWithRollover, activeMonthId]);

  // Run calculation engine for current month
  const { calculatedDays, summary } = useMemo(() => {
    if (!currentMonth) {
      return { calculatedDays: [], summary: {} as MonthSummary };
    }
    return calculateMonth(currentMonth, phoneTypes, samsungTracker);
  }, [currentMonth, phoneTypes, samsungTracker]);

  // Update a specific cell in the daily records
  const handleUpdateRecord = (
    date: string,
    field: string,
    value: number | null
  ) => {
    if (isLocked) {
      setIsUnlockPrompt(true);
      setShowPasswordModal(true);
      return;
    }
    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        const updatedRecords = m.records.map((r) => {
          if (r.date !== date) return r;
          const updated = { ...r, [field]: value };
          // Post to SQLite backend
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_daily_record',
              monthId: currentMonth.id,
              record: updated,
            }),
          }).catch(console.error);
          return updated;
        });
        return {
          ...m,
          records: updatedRecords,
        };
      })
    );
  };

  // Full day save from the Entry Modal
  const handleSaveDayFromModal = (
    date: string,
    data: {
      actualBalance: number | null;
      cashAdded: number;
      typeAOut: number;
      typeABack: number;
      typeBOut: number;
      typeBBack: number;
      typeCOut: number;
      typeCBack: number;
    }
  ) => {
    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        const exists = m.records.some((r) => r.date === date);
        let updatedRecords;
        if (exists) {
          updatedRecords = m.records.map((r) =>
            r.date === date ? { ...r, ...data } : r
          );
        } else {
          updatedRecords = [...m.records, { date, ...data }];
        }

        // Post to SQLite
        fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_daily_record',
            monthId: currentMonth.id,
            record: { date, ...data },
          }),
        }).catch(console.error);

        return {
          ...m,
          records: updatedRecords,
        };
      })
    );
  };

  // Dual Record handler (records to Samsung Tracker and Float Ledger simultaneously)
  const handleDualRecord = (
    date: string,
    amount: number,
    phoneCounts: {
      typeAOut: number;
      typeABack: number;
      typeBOut: number;
      typeBBack: number;
      typeCOut: number;
      typeCBack: number;
      customPhones?: Record<string, { out: number; back: number }>;
      samsungCashOut?: number;
      samsungCashIn?: number;
    }
  ) => {
    const sOut = phoneCounts.samsungCashOut ?? (amount > 0 ? amount : 0);
    const sIn = phoneCounts.samsungCashIn ?? 0;

    if (sOut > 0 || sIn > 0 || amount > 0) {
      const profit = sIn - sOut;
      const status =
        sOut === 0 && sIn === 0
          ? 'No trading'
          : profit === 0
          ? 'Reconciled'
          : profit > 0
          ? `Profit (+KES ${profit})`
          : sIn > 0
          ? `Partial (${Math.abs(profit)} pending)`
          : `Pending (${Math.abs(profit)})`;

      const samsungEntry: SamsungTrackerEntry = {
        date,
        cashOut: sOut,
        cashIn: sIn,
        profit,
        status,
      };

      setSamsungTracker((prev) => {
        const idx = prev.findIndex((e) => e.date === date);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = samsungEntry;
          return next;
        }
        return [...prev, samsungEntry];
      });

      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_samsung_record',
          entry: samsungEntry,
        }),
      }).catch(console.error);
    }

    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        const exists = m.records.some((r) => r.date === date);
        let updatedRecords;
        if (exists) {
          updatedRecords = m.records.map((r) => {
            if (r.date !== date) return r;
            const updated: DailyRecord = {
              ...r,
              cashAdded: amount > 0 ? amount : r.cashAdded,
              typeAOut: phoneCounts.typeAOut,
              typeABack: phoneCounts.typeABack,
              typeBOut: phoneCounts.typeBOut,
              typeBBack: phoneCounts.typeBBack,
              typeCOut: phoneCounts.typeCOut,
              typeCBack: phoneCounts.typeCBack,
              customPhones: phoneCounts.customPhones ?? r.customPhones,
              samsungCashOut: phoneCounts.samsungCashOut ?? r.samsungCashOut,
              samsungCashIn: phoneCounts.samsungCashIn ?? r.samsungCashIn,
            };
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_daily_record',
                monthId: currentMonth.id,
                record: updated,
              }),
            }).catch(console.error);
            return updated;
          });
        } else {
          const newRec: DailyRecord = {
            date,
            actualBalance: null,
            cashAdded: amount,
            typeAOut: phoneCounts.typeAOut,
            typeABack: phoneCounts.typeABack,
            typeBOut: phoneCounts.typeBOut,
            typeBBack: phoneCounts.typeBBack,
            typeCOut: phoneCounts.typeCOut,
            typeCBack: phoneCounts.typeCBack,
            customPhones: phoneCounts.customPhones,
            samsungCashOut: sOut,
            samsungCashIn: sIn,
          };
          updatedRecords = [...m.records, newRec];
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_daily_record',
              monthId: currentMonth.id,
              record: newRec,
            }),
          }).catch(console.error);
        }
        return {
          ...m,
          records: updatedRecords,
        };
      })
    );
  };

  const handleSaveDayFigures = (
    date: string,
    figures: {
      typeAOut: number;
      typeABack: number;
      typeBOut: number;
      typeBBack: number;
      typeCOut: number;
      typeCBack: number;
      cashAdded: number;
      customPhones?: Record<string, { out: number; back: number }>;
      samsungCashOut?: number;
      samsungCashIn?: number;
    }
  ) => {
    // If Samsung figures provided, update samsungTracker as well
    if (figures.samsungCashOut !== undefined || figures.samsungCashIn !== undefined) {
      const sOut = figures.samsungCashOut || 0;
      const sIn = figures.samsungCashIn || 0;
      const profit = sIn - sOut;
      const status =
        sOut === 0 && sIn === 0
          ? 'No trading'
          : profit === 0
          ? 'Reconciled'
          : profit > 0
          ? `Profit (+KES ${profit})`
          : sIn > 0
          ? `Partial (${Math.abs(profit)} pending)`
          : `Pending (${Math.abs(profit)})`;

      const samsungEntry: SamsungTrackerEntry = {
        date,
        cashOut: sOut,
        cashIn: sIn,
        profit,
        status,
      };

      setSamsungTracker((prev) => {
        const idx = prev.findIndex((e) => e.date === date);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = samsungEntry;
          return next;
        }
        return [...prev, samsungEntry];
      });

      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_samsung_record',
          entry: samsungEntry,
        }),
      }).catch(console.error);
    }

    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        const exists = m.records.some((r) => r.date === date);
        let updatedRecords;
        if (exists) {
          updatedRecords = m.records.map((r) => {
            if (r.date !== date) return r;
            const updated: DailyRecord = {
              ...r,
              cashAdded: figures.cashAdded,
              typeAOut: figures.typeAOut,
              typeABack: figures.typeABack,
              typeBOut: figures.typeBOut,
              typeBBack: figures.typeBBack,
              typeCOut: figures.typeCOut,
              typeCBack: figures.typeCBack,
              customPhones: figures.customPhones ?? r.customPhones,
              samsungCashOut: figures.samsungCashOut ?? r.samsungCashOut,
              samsungCashIn: figures.samsungCashIn ?? r.samsungCashIn,
            };
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_daily_record',
                monthId: currentMonth.id,
                record: updated,
              }),
            }).catch(console.error);
            return updated;
          });
        } else {
          const newRec: DailyRecord = {
            date,
            actualBalance: null,
            cashAdded: figures.cashAdded,
            typeAOut: figures.typeAOut,
            typeABack: figures.typeABack,
            typeBOut: figures.typeBOut,
            typeBBack: figures.typeBBack,
            typeCOut: figures.typeCOut,
            typeCBack: figures.typeCBack,
            customPhones: figures.customPhones,
            samsungCashOut: figures.samsungCashOut ?? 0,
            samsungCashIn: figures.samsungCashIn ?? 0,
          };
          updatedRecords = [...m.records, newRec];
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_daily_record',
              monthId: currentMonth.id,
              record: newRec,
            }),
          }).catch(console.error);
        }
        return {
          ...m,
          records: updatedRecords,
        };
      })
    );
  };

  const handleRecordSamsungOnly = (date: string, cashOut: number, cashIn: number = 0) => {
    const profit = cashIn - cashOut;
    const status =
      cashOut === 0 && cashIn === 0
        ? 'No trading'
        : profit === 0
        ? 'Reconciled'
        : profit > 0
        ? `Profit (+KES ${profit})`
        : cashIn > 0
        ? `Partial (${Math.abs(profit)} pending)`
        : `Pending (${Math.abs(profit)})`;

    const newEntry: SamsungTrackerEntry = {
      date,
      cashOut,
      cashIn,
      profit,
      status,
    };

    setSamsungTracker((prev) => {
      const idx = prev.findIndex((e) => e.date === date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newEntry;
        return next;
      }
      return [...prev, newEntry];
    });

    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_samsung_record',
        entry: newEntry,
      }),
    }).catch(console.error);

    // Sync to currentMonth records so closing float updates immediately
    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        return {
          ...m,
          records: m.records.map((r) => {
            if (r.date !== date) return r;
            const updated = {
              ...r,
              samsungCashOut: cashOut,
              samsungCashIn: cashIn,
            };
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_daily_record',
                monthId: currentMonth.id,
                record: updated,
              }),
            }).catch(console.error);
            return updated;
          }),
        };
      })
    );
  };

  const handleUpdateSamsungEntry = (entry: SamsungTrackerEntry) => {
    setSamsungTracker((prev) => {
      const idx = prev.findIndex((e) => e.date === entry.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });

    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_samsung_record',
        entry,
      }),
    }).catch(console.error);

    // Sync to daily_records
    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        const exists = m.records.some((r) => r.date === entry.date);
        let updatedRecords;
        if (exists) {
          updatedRecords = m.records.map((r) => {
            if (r.date !== entry.date) return r;
            const updated = {
              ...r,
              samsungCashOut: entry.cashOut,
              samsungCashIn: entry.cashIn,
            };
            fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_daily_record',
                monthId: currentMonth.id,
                record: updated,
              }),
            }).catch(console.error);
            return updated;
          });
        } else {
          const newRec: DailyRecord = {
            date: entry.date,
            actualBalance: null,
            cashAdded: 0,
            typeAOut: 0,
            typeABack: 0,
            typeBOut: 0,
            typeBBack: 0,
            typeCOut: 0,
            typeCBack: 0,
            samsungCashOut: entry.cashOut,
            samsungCashIn: entry.cashIn,
          };
          updatedRecords = [...m.records, newRec];
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_daily_record',
              monthId: currentMonth.id,
              record: newRec,
            }),
          }).catch(console.error);
        }
        return {
          ...m,
          records: updatedRecords,
        };
      })
    );
  };

  const handleRecordLedgerCashOnly = (date: string, amount: number) => {
    handleUpdateRecord(date, 'cashAdded', amount);
  };

  const handleOpenAddPhones = (date?: string) => {
    if (isLocked) {
      setIsUnlockPrompt(true);
      setShowPasswordModal(true);
      return;
    }
    setAddPhonesDate(date || selectedDate);
    setShowAddPhonesModal(true);
  };

  const handleAddPhones = (
    date: string,
    phoneTypeId: string,
    qtyOut: number,
    qtyBack: number,
    mode: 'increment' | 'set'
  ) => {
    setMonths((prevMonths) =>
      prevMonths.map((m) => {
        if (m.id !== currentMonth.id) return m;
        const updatedRecords = m.records.map((r) => {
          if (r.date !== date) return r;

          let updated: DailyRecord;
          if (phoneTypeId === 'type-a') {
            const newOut = mode === 'increment' ? (r.typeAOut || 0) + qtyOut : qtyOut;
            const newBack = mode === 'increment' ? (r.typeABack || 0) + qtyBack : qtyBack;
            updated = { ...r, typeAOut: newOut, typeABack: newBack };
          } else if (phoneTypeId === 'type-b') {
            const newOut = mode === 'increment' ? (r.typeBOut || 0) + qtyOut : qtyOut;
            const newBack = mode === 'increment' ? (r.typeBBack || 0) + qtyBack : qtyBack;
            updated = { ...r, typeBOut: newOut, typeBBack: newBack };
          } else if (phoneTypeId === 'type-c') {
            const newOut = mode === 'increment' ? (r.typeCOut || 0) + qtyOut : qtyOut;
            const newBack = mode === 'increment' ? (r.typeCBack || 0) + qtyBack : qtyBack;
            updated = { ...r, typeCOut: newOut, typeCBack: newBack };
          } else {
            // Custom phone model
            const prevCustom = r.customPhones || {};
            const curTypeCount = prevCustom[phoneTypeId] || { out: 0, back: 0 };
            const newOut = mode === 'increment' ? curTypeCount.out + qtyOut : qtyOut;
            const newBack = mode === 'increment' ? curTypeCount.back + qtyBack : qtyBack;
            updated = {
              ...r,
              customPhones: {
                ...prevCustom,
                [phoneTypeId]: { out: newOut, back: newBack },
              },
            };
          }

          // Post update to SQLite backend
          fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_daily_record',
              monthId: currentMonth.id,
              record: updated,
            }),
          }).catch(console.error);

          return updated;
        });

        return {
          ...m,
          records: updatedRecords,
        };
      })
    );
  };

  const handleSavePhoneTypes = (types: PhoneTypeConfig[]) => {
    setPhoneTypes(types);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_phone_types',
        types,
      }),
    }).catch(console.error);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all data and pricing back to spreadsheet defaults?')) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_database' }),
      })
        .then(() => loadFromBackend())
        .catch(console.error);
    }
  };

  // Sync Bottom Sheets bar selection with Main View
  const handleBottomViewSelect = (view: ActiveSheetView) => {
    setBottomActiveView(view);
    if (view === 'overview') {
      setActiveMainTab('samsung');
    } else if (view === 'dashboard') {
      setActiveMainTab('dashboard');
    } else if (view === 'september') {
      setActiveMonthId('2026-09');
      setActiveMainTab('ledger');
    } else if (view === 'october') {
      setActiveMonthId('2026-10');
      setActiveMainTab('ledger');
    } else if (view === 'november') {
      setActiveMonthId('2026-11');
      setActiveMainTab('ledger');
    } else if (view === 'december') {
      setActiveMonthId('2026-12');
      setActiveMainTab('ledger');
    } else if (view === 'may-june' || view === 'july-august') {
      setActiveMainTab('collo');
    } else if (view === 'all-months') {
      setActiveMainTab('allmonths');
    } else if (view === 'sheet1') {
      setActiveMainTab('sheet1');
    }
  };

  // Accounting period button click
  const handleSelectAccountingPeriod = (monthId: string) => {
    if (monthId === 'all') {
      setActiveMainTab('allmonths');
      setBottomActiveView('all-months');
    } else {
      setActiveMonthId(monthId);
      setActiveMainTab('ledger');
      if (monthId === '2026-09') setBottomActiveView('september');
      if (monthId === '2026-10') setBottomActiveView('october');
      if (monthId === '2026-11') setBottomActiveView('november');
      if (monthId === '2026-12') setBottomActiveView('december');
    }
  };



  return (
    <>
      {/* Top Application Header */}
      <header className="app-header">
        <div className="header-container">
          {/* Brand */}
          <div className="brand-section">
            <div className="brand-badge">
              <Wallet size={20} />
            </div>
            <div className="brand-info">
              <h1>Samsung Tracker & Float Ledger</h1>
              <p>September 2026 • Live Sync Enabled</p>
            </div>
            <span className="badge badge-purple" style={{ marginLeft: 4, whiteSpace: 'nowrap' }}>
              Self-Financed
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeMainTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveMainTab('dashboard');
                setBottomActiveView('dashboard');
              }}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>

            <button
              className={`nav-tab-btn ${activeMainTab === 'ledger' ? 'active' : ''}`}
              onClick={() => {
                setActiveMainTab('ledger');
                setBottomActiveView('september');
              }}
            >
              <TableIcon size={14} />
              September Ledger
            </button>

            <button
              className={`nav-tab-btn ${activeMainTab === 'samsung' ? 'active' : ''}`}
              onClick={() => {
                setActiveMainTab('samsung');
                setBottomActiveView('overview');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Smartphone size={14} />
              <span>Samsung Tracker</span>
              {(summary.samsungNet ?? -7900) < 0 && (
                <span
                  className="badge badge-warning"
                  style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    lineHeight: 1.2,
                    fontWeight: 700,
                  }}
                  title="Net funds currently deployed in Samsung channel"
                >
                  ({Math.abs(summary.samsungNet ?? -7900).toLocaleString()})
                </span>
              )}
            </button>

            <button
              className="nav-tab-btn"
              onClick={() => setShowReconciliation(true)}
            >
              <Clock size={14} />
              Reconciliation
            </button>

            <button
              className="nav-tab-btn"
              onClick={() => setShowHowItWorks(true)}
            >
              <BookOpen size={14} />
              How It Works
            </button>
          </nav>

          {/* Header Controls matching Screenshot */}
          <div className="header-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowSettings(true)}
              title="24-Hour Automated Backups & System Recovery"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <HardDrive size={13} color={theme === 'odoo' ? '#d8b4e2' : 'var(--odoo-teal)'} />
              Backups
            </button>

            <button
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.55rem',
                minWidth: 32,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => cycleTheme()}
              title={theme === 'odoo' ? 'Dark Mode (Click to switch to Light)' : 'Light Mode (Click to switch to Dark)'}
              aria-label={theme === 'odoo' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'odoo' ? (
                <Palette size={15} />
              ) : (
                <Sun size={15} style={{ color: '#d97706' }} />
              )}
            </button>

            <button
              className={`btn-secondary ${ownerMode ? 'badge-success' : ''}`}
              style={{
                background: ownerMode ? 'rgba(16, 185, 129, 0.15)' : undefined,
                color: ownerMode ? 'var(--accent-emerald)' : undefined,
                borderColor: ownerMode ? 'rgba(16, 185, 129, 0.4)' : undefined,
              }}
              onClick={() => setOwnerMode(!ownerMode)}
              title={ownerMode ? 'Owner Mode Active (Click to switch to View Only)' : 'Enable Owner Mode'}
            >
              <Shield size={13} /> Owner Mode
            </button>

            <button
              className="btn-secondary"
              onClick={handleToggleLock}
              title={isLocked ? 'Canvas Locked (Click to enter PIN & unlock)' : 'Lock Canvas'}
            >
              {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
              {isLocked ? 'Locked' : 'Lock'}
            </button>

            <div
              className="header-date-chip"
              onClick={() => setIs24HourFormat(!is24HourFormat)}
              title={`Live System Clock • Click to toggle 12h/24h\nLive: ${liveDateFormatted} ${liveTimeFormatted}\nLedger Active Date: ${selectedDate}`}
            >
              <span className="live-pulse-dot" />
              <Calendar size={13} color={theme === 'odoo' ? '#ffffff' : 'var(--odoo-teal)'} />
              <span>{liveDateFormatted || `${selectedDate.slice(8)} Sep 2026`}</span>
              <span className="live-clock-divider">•</span>
              <span className="live-clock-time tabular-nums">{liveTimeFormatted}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Accounting Period Bar matching Screenshot */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <Calendar size={13} color="var(--accent-purple)" />
            ACCOUNTING PERIOD:
          </div>

          <div className="period-tabs">
            <button
              className={`period-pill-btn ${activeMonthId === '2026-09' && activeMainTab !== 'allmonths' ? 'active' : ''}`}
              onClick={() => handleSelectAccountingPeriod('2026-09')}
            >
              Sep 2026 <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>30d</span>
            </button>

            <button
              className={`period-pill-btn ${activeMonthId === '2026-10' && activeMainTab !== 'allmonths' ? 'active' : ''}`}
              onClick={() => handleSelectAccountingPeriod('2026-10')}
            >
              Oct 2026 <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>0d</span>
            </button>

            <button
              className={`period-pill-btn ${activeMonthId === '2026-11' && activeMainTab !== 'allmonths' ? 'active' : ''}`}
              onClick={() => handleSelectAccountingPeriod('2026-11')}
            >
              Nov 2026 <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>0d</span>
            </button>

            <button
              className={`period-pill-btn ${activeMonthId === '2026-12' && activeMainTab !== 'allmonths' ? 'active' : ''}`}
              onClick={() => handleSelectAccountingPeriod('2026-12')}
            >
              Dec 2026 <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>0d</span>
            </button>

            <button
              className={`period-pill-btn ${activeMainTab === 'allmonths' ? 'active' : ''}`}
              onClick={() => handleSelectAccountingPeriod('all')}
            >
              All Months <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>30d</span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>• Active:</span> {currentMonth.name} • {calculatedDays.length} days recorded
        </div>
      </div>

      {/* Owner Mode Announcement Banner matching Screenshot */}
      {ownerMode && (
        <div
          style={{
            background: 'var(--accent-emerald-dim)',
            borderBottom: '1px solid var(--accent-emerald)',
            padding: '0.45rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--accent-emerald)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={13} color="var(--accent-emerald)" />
            <span>
              <strong>Owner Mode Active:</strong> You are authorized to edit inline, record new dates, modify Samsung tracker, or remove rows.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setIsUnlockPrompt(false);
                setShowPasswordModal(true);
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-emerald)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Change Password
            </button>
            <button
              onClick={handleToggleLock}
              className="btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            >
              {isLocked ? <Lock size={11} /> : <Unlock size={11} />} {isLocked ? 'Unlock Canvas' : 'Lock Canvas'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Direct Canvas Recorder */}
        <DirectCanvasRecorder
          activeDate={selectedDate}
          month={currentMonth}
          phoneTypes={phoneTypes}
          onSelectDate={(d) => setSelectedDate(d)}
          onRecordSamsung={handleRecordSamsungOnly}
          onRecordLedgerCash={handleRecordLedgerCashOnly}
          onDualRecord={handleDualRecord}
          onSaveDayFigures={handleSaveDayFigures}
          onOpenDayFigures={(date) => {
            setEntryModalDate(date);
            setShowEntryModal(true);
          }}
          onOpenAddPhones={handleOpenAddPhones}
          onNewDateRecord={() => {
            setEntryModalDate(undefined);
            setShowEntryModal(true);
          }}
        />

        {/* Tab 1: Dashboard */}
        {activeMainTab === 'dashboard' && (
          <DashboardOverview
            summary={summary}
            historicalSummary={HISTORICAL_EXECUTIVE_SUMMARY}
            phoneTypes={phoneTypes}
            monthName={currentMonth.name}
            samsungTracker={samsungTracker}
            onOpenLedger={() => {
              setActiveMainTab('ledger');
              setBottomActiveView('september');
            }}
            onOpenReconciliation={() => setShowReconciliation(true)}
            onOpenSamsung={() => setActiveMainTab('samsung')}
          />
        )}

        {/* Tab 2: Daily Ledger Table */}
        {activeMainTab === 'ledger' && (
          <DailyLedgerTable
            month={currentMonth}
            phoneTypes={phoneTypes}
            calculatedDays={calculatedDays}
            summary={summary}
            selectedDate={selectedDate}
            isLocked={isLocked}
            onSelectDate={(d) => setSelectedDate(d)}
            onUpdateRecord={handleUpdateRecord}
            onOpenAddPhones={handleOpenAddPhones}
            onOpenSamsung={() => {
              setActiveMainTab('samsung');
              setBottomActiveView('overview');
            }}
            onOpenNewEntry={(d) => {
              if (isLocked) {
                setIsUnlockPrompt(true);
                setShowPasswordModal(true);
                return;
              }
              setEntryModalDate(d);
              setShowEntryModal(true);
            }}
            onOpenUnlock={() => {
              setIsUnlockPrompt(true);
              setShowPasswordModal(true);
            }}
          />
        )}

        {/* Tab 3: Samsung Tracker */}
        {activeMainTab === 'samsung' && (
          <SamsungTrackerTable
            entries={samsungTracker}
            onAddEntry={handleUpdateSamsungEntry}
            onUpdateEntry={handleUpdateSamsungEntry}
            onSelectDate={(d) => setSelectedDate(d)}
          />
        )}

        {/* Tab 4: Collo Historical Archive */}
        {activeMainTab === 'collo' && <ColloLedgerTable />}

        {/* Tab 5: All Months View */}
        {activeMainTab === 'allmonths' && (
          <AllMonthsView
            months={months}
            phoneTypes={phoneTypes}
            historicalSummary={HISTORICAL_EXECUTIVE_SUMMARY}
            onSelectMonth={(mId) => {
              setActiveMonthId(mId);
              setActiveMainTab('ledger');
            }}
          />
        )}

        {/* Tab 6: Sheet1 Enhancements Roadmap */}
        {activeMainTab === 'sheet1' && <Sheet1View />}
      </main>

      {/* Bottom Sheets Navigation Bar (Google Sheets Style) */}
      <BottomSheetsBar
        activeView={bottomActiveView}
        onSelectView={handleBottomViewSelect}
        onAddSheet={() => {
          const name = prompt('Enter new month sheet name:');
          if (name) {
            const newId = `month-${Date.now()}`;
            setMonths((prev) => [
              ...prev,
              {
                id: newId,
                name,
                model: 'self-financed',
                openingFloat: summary.closingFloat || 68105,
                records: Array.from({ length: 30 }, (_, i) => ({
                  date: `2026-11-${String(i + 1).padStart(2, '0')}`,
                  actualBalance: null,
                  cashAdded: 0,
                  typeAOut: 0,
                  typeABack: 0,
                  typeBOut: 0,
                  typeBBack: 0,
                  typeCOut: 0,
                  typeCBack: 0,
                })),
              },
            ]);
            setActiveMonthId(newId);
            setActiveMainTab('ledger');
          }
        }}
      />

      {/* Reconciliation Modal */}
      {showReconciliation && (
        <ReconciliationPanel
          summary={summary}
          phoneTypes={phoneTypes}
          calculatedDays={calculatedDays}
          samsungTracker={samsungTracker}
          onClose={() => setShowReconciliation(false)}
        />
      )}

      {/* How It Works Modal */}
      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          phoneTypes={phoneTypes}
          months={months}
          onSavePhoneTypes={handleSavePhoneTypes}
          onResetDefaults={handleResetDefaults}
          onRestoreCompleted={loadFromBackend}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Quick Entry Modal */}
      {showEntryModal && (
        <EntryModal
          initialDate={entryModalDate || selectedDate}
          month={currentMonth}
          phoneTypes={phoneTypes}
          onSaveDay={handleSaveDayFromModal}
          onClose={() => {
            setShowEntryModal(false);
            setEntryModalDate(undefined);
          }}
        />
      )}

      {/* Add Phones Modal */}
      {showAddPhonesModal && (
        <AddPhonesModal
          isOpen={showAddPhonesModal}
          initialDate={addPhonesDate || selectedDate}
          month={currentMonth}
          phoneTypes={phoneTypes}
          onAddPhones={handleAddPhones}
          onClose={() => setShowAddPhonesModal(false)}
          onOpenSamsung={(d) => {
            setSelectedDate(d);
            setActiveMainTab('samsung');
            setBottomActiveView('overview');
            setShowAddPhonesModal(false);
          }}
          onOpenSettingsAssumptions={() => {
            setShowAddPhonesModal(false);
            setShowSettings(true);
          }}
        />
      )}

      {/* Password & Security Modal */}
      {showPasswordModal && (
        <PasswordModal
          currentPassword={ownerPassword}
          isUnlockMode={isUnlockPrompt}
          onSaveNewPassword={handleSavePassword}
          onUnlockSuccess={() => {
            setIsLocked(false);
          }}
          onClose={() => {
            setShowPasswordModal(false);
            setIsUnlockPrompt(false);
          }}
        />
      )}
    </>
  );
}
