'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Zap,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Coins,
  Calendar,
  Save,
  RotateCcw,
  Plus
} from 'lucide-react';
import { MonthData, PhoneTypeConfig, DailyRecord } from '../lib/types';
import { formatKES } from '../lib/engine';

interface DirectCanvasRecorderProps {
  activeDate: string;
  month: MonthData;
  phoneTypes: PhoneTypeConfig[];
  onSelectDate?: (date: string) => void;
  onRecordSamsung: (date: string, cashOut: number, cashIn?: number) => void;
  onRecordLedgerCash: (date: string, amount: number) => void;
  onDualRecord: (
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
  ) => void;
  onSaveDayFigures?: (
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
  ) => void;
  onOpenDayFigures: (date: string) => void;
  onOpenAddPhones?: (date: string) => void;
  onNewDateRecord: () => void;
}

export const DirectCanvasRecorder: React.FC<DirectCanvasRecorderProps> = ({
  activeDate,
  month,
  phoneTypes,
  onSelectDate,
  onRecordSamsung,
  onRecordLedgerCash,
  onDualRecord,
  onSaveDayFigures,
  onOpenDayFigures,
  onOpenAddPhones,
  onNewDateRecord,
}) => {
  const [date, setDate] = useState<string>(activeDate);
  const [typeAOut, setTypeAOut] = useState<number>(0);
  const [typeABack, setTypeABack] = useState<number>(0);
  const [typeBOut, setTypeBOut] = useState<number>(0);
  const [typeBBack, setTypeBBack] = useState<number>(0);
  const [pop20Out, setPop20Out] = useState<number>(0);
  const [pop20Back, setPop20Back] = useState<number>(0);
  const [customPhones, setCustomPhones] = useState<Record<string, { out: number; back: number }>>({});
  const [kesAmount, setKesAmount] = useState<number>(0);
  const [samsungOut, setSamsungOut] = useState<number>(0);
  const [samsungIn, setSamsungIn] = useState<number>(0);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sync date when external activeDate changes
  useEffect(() => {
    if (activeDate && activeDate !== date) {
      setDate(activeDate);
    }
  }, [activeDate]);

  // When date or month changes, dynamically populate all input fields with the real record values!
  useEffect(() => {
    const record = month.records.find((r) => r.date === date);
    if (record) {
      setTypeAOut(record.typeAOut || 0);
      setTypeABack(record.typeABack || 0);
      setTypeBOut(record.typeBOut || 0);
      setTypeBBack(record.typeBBack || 0);
      setPop20Out(record.typeCOut || 0);
      setPop20Back(record.typeCBack || 0);
      // If cashAdded is set, use it; otherwise if samsungCashOut is set, use it; else 0
      setKesAmount(record.cashAdded !== 0 ? record.cashAdded : 0);
      setSamsungOut(record.samsungCashOut || 0);
      setSamsungIn(record.samsungCashIn || 0);
      setCustomPhones(record.customPhones || {});
    } else {
      // New or unrecorded date
      setTypeAOut(0);
      setTypeABack(0);
      setTypeBOut(0);
      setTypeBBack(0);
      setPop20Out(0);
      setPop20Back(0);
      setKesAmount(0);
      setSamsungOut(0);
      setSamsungIn(0);
      setCustomPhones({});
    }
  }, [date, month]);

  // Handle date change from input or dropdown
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (onSelectDate) {
      onSelectDate(newDate);
    }
  };

  // Quick navigation: previous / next day in month
  const sortedDates = useMemo(() => {
    return month.records.map((r) => r.date).sort();
  }, [month.records]);

  const handlePrevDay = () => {
    const idx = sortedDates.indexOf(date);
    if (idx > 0) {
      handleDateChange(sortedDates[idx - 1]);
    }
  };

  const handleNextDay = () => {
    const idx = sortedDates.indexOf(date);
    if (idx >= 0 && idx < sortedDates.length - 1) {
      handleDateChange(sortedDates[idx + 1]);
    }
  };

  // Identify custom phone types beyond standard A, B, C
  const customPhoneTypes = useMemo(() => {
    return phoneTypes.filter((p) => !['type-a', 'type-b', 'type-c'].includes(p.id));
  }, [phoneTypes]);

  // Real-time calculation for live visual feedback
  const liveStats = useMemo(() => {
    const typeACfg = phoneTypes.find((p) => p.id === 'type-a');
    const typeBCfg = phoneTypes.find((p) => p.id === 'type-b');
    const typeCCfg = phoneTypes.find((p) => p.id === 'type-c');

    const costA = typeACfg?.cost || 16800;
    const costB = typeBCfg?.cost || 15200;
    const costC = typeCCfg?.cost || 9800;

    const returnA = typeACfg?.returnCash || 17200;
    const returnB = typeBCfg?.returnCash || 15600;
    const returnC = typeCCfg?.returnCash || 10200;

    let totalOut = typeAOut + typeBOut + pop20Out;
    let totalBack = typeABack + typeBBack + pop20Back;
    let totalCost = typeAOut * costA + typeBOut * costB + pop20Out * costC;
    let totalReturn = typeABack * returnA + typeBBack * returnB + pop20Back * returnC;

    customPhoneTypes.forEach((cfg) => {
      const counts = customPhones[cfg.id] || { out: 0, back: 0 };
      totalOut += counts.out;
      totalBack += counts.back;
      totalCost += counts.out * cfg.cost;
      totalReturn += counts.back * cfg.returnCash;
    });

    return {
      totalOut,
      totalBack,
      totalCost,
      totalReturn,
    };
  }, [typeAOut, typeABack, typeBOut, typeBBack, pop20Out, pop20Back, customPhones, phoneTypes, customPhoneTypes]);

  const handleDual = () => {
    onDualRecord(date, kesAmount, {
      typeAOut,
      typeABack,
      typeBOut,
      typeBBack,
      typeCOut: pop20Out,
      typeCBack: pop20Back,
      customPhones,
      samsungCashOut: samsungOut,
      samsungCashIn: samsungIn,
    });
    setSuccessNotice(`Dual Recorded for ${date}: Phones, Float KES ${kesAmount}, Samsung (Out ${samsungOut}, In ${samsungIn})`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleSaveFigures = () => {
    if (onSaveDayFigures) {
      onSaveDayFigures(date, {
        typeAOut,
        typeABack,
        typeBOut,
        typeBBack,
        typeCOut: pop20Out,
        typeCBack: pop20Back,
        cashAdded: kesAmount,
        customPhones,
        samsungCashOut: samsungOut,
        samsungCashIn: samsungIn,
      });
      setSuccessNotice(`Saved figures for ${date}: Type A (${typeAOut}/${typeABack}), Type B (${typeBOut}/${typeBBack}), Pop 20 (${pop20Out}/${pop20Back}), Samsung (${samsungOut}/${samsungIn})`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      handleDual();
    }
  };

  const handleSamsungOnly = () => {
    onRecordSamsung(date, samsungOut > 0 ? samsungOut : kesAmount, samsungIn);
    setSuccessNotice(`Recorded Samsung for ${date}: Out KES ${samsungOut || kesAmount}, In KES ${samsungIn}`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleLedgerOnly = () => {
    onRecordLedgerCash(date, kesAmount);
    setSuccessNotice(`Recorded KES ${kesAmount} to Float Ledger for ${date}`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Keyboard shortcut: Press Enter inside any input to quickly save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveFigures();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Direct Canvas Recorder Box */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                background: 'var(--odoo-purple)',
                borderRadius: 'var(--radius-sm)',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', flexWrap: 'wrap' }}>
                <span>DIRECT CANVAS RECORDER — ALL PHONES & FLOAT</span>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                  Type A (128GB)
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                  Type B (64GB)
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                  Type C Pop 20
                </span>
                {customPhoneTypes.map((cp) => (
                  <span key={cp.id} className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                    {cp.model || cp.name}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.735rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Dynamic interactive input fields for daily phone dispatches, returns, and cash float. Values update automatically with the active date.
              </p>
            </div>
          </div>

          {/* Action Buttons Top/Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleSamsungOnly} title="Record KES to Samsung Tracker only">
              <Smartphone size={13} style={{ color: 'var(--accent-purple)' }} /> Record Samsung
            </button>

            <button className="btn-secondary" onClick={handleLedgerOnly} title="Record KES to Float Ledger only">
              <Coins size={13} style={{ color: 'var(--accent-amber)' }} /> Record Ledger Cash
            </button>

            <button
              className="btn-primary"
              style={{ background: 'var(--odoo-teal)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={handleDual}
              title="Record simultaneously to Samsung Tracker and Float Ledger"
            >
              <Zap size={14} /> Dual Record
            </button>

            <button
              className="btn-primary"
              style={{ background: 'var(--odoo-purple)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={handleSaveFigures}
              title="Save all input values directly into this date's ledger record"
            >
              <Save size={14} /> Save Day Figures
            </button>
          </div>
        </div>

        {/* Input Fields Row — All Phones & Float Cash */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            flexWrap: 'wrap',
            background: 'var(--bg-surface)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
          onKeyDown={handleKeyDown}
        >
          {/* 1. Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Calendar size={13} color="var(--accent-purple)" /> DATE:
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.2rem 0.4rem', minWidth: 24, height: 26 }}
              onClick={handlePrevDay}
              title="Previous trading day"
            >
              <ChevronLeft size={13} />
            </button>
            <input
              type="date"
              className="editable-cell-input"
              style={{ width: 125, textAlign: 'center', padding: '0.2rem 0.35rem', fontSize: '0.775rem' }}
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.2rem 0.4rem', minWidth: 24, height: 26 }}
              onClick={handleNextDay}
              title="Next trading day"
            >
              <ChevronRight size={13} />
            </button>
            {sortedDates.length > 0 && (
              <select
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.35rem',
                  height: 26,
                  cursor: 'pointer',
                }}
                title="Jump directly to any date in this month"
              >
                {sortedDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ width: 1, height: 26, background: 'var(--border-card)' }} />

          {/* 2. Type A (128GB) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.775rem',
              background: 'rgba(113, 75, 103, 0.08)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(113, 75, 103, 0.25)',
            }}
          >
            <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>TYPE A (128G)</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem' }}>OUT:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input"
              style={{ width: 46 }}
              value={typeAOut}
              onChange={(e) => setTypeAOut(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem', marginLeft: 2 }}>BACK:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input"
              style={{ width: 46 }}
              value={typeABack}
              onChange={(e) => setTypeABack(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* 3. Type B (64GB) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.775rem',
              background: 'rgba(59, 130, 246, 0.08)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>TYPE B (64G)</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem' }}>OUT:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input"
              style={{ width: 46 }}
              value={typeBOut}
              onChange={(e) => setTypeBOut(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem', marginLeft: 2 }}>BACK:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input"
              style={{ width: 46 }}
              value={typeBBack}
              onChange={(e) => setTypeBBack(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* 4. Type C Pop 20 (64GB) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.775rem',
              background: 'rgba(1, 126, 132, 0.08)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(1, 126, 132, 0.25)',
            }}
          >
            <span style={{ color: 'var(--odoo-teal)', fontWeight: 700 }}>POP 20 (C)</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem' }}>OUT:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input"
              style={{ width: 46 }}
              value={pop20Out}
              onChange={(e) => setPop20Out(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem', marginLeft: 2 }}>BACK:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input"
              style={{ width: 46 }}
              value={pop20Back}
              onChange={(e) => setPop20Back(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* 5. Custom Phone Models (if configured) */}
          {customPhoneTypes.map((cp) => {
            const counts = customPhones[cp.id] || { out: 0, back: 0 };
            return (
              <div
                key={cp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.775rem',
                  background: 'rgba(217, 119, 6, 0.08)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                }}
              >
                <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>{cp.model || cp.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem' }}>OUT:</span>
                <input
                  type="number"
                  min="0"
                  className="editable-cell-input"
                  style={{ width: 46 }}
                  value={counts.out}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setCustomPhones((prev) => ({
                      ...prev,
                      [cp.id]: { out: val, back: prev[cp.id]?.back || 0 },
                    }));
                  }}
                />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem', marginLeft: 2 }}>BACK:</span>
                <input
                  type="number"
                  min="0"
                  className="editable-cell-input"
                  style={{ width: 46 }}
                  value={counts.back}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setCustomPhones((prev) => ({
                      ...prev,
                      [cp.id]: { out: prev[cp.id]?.out || 0, back: val },
                    }));
                  }}
                />
              </div>
            );
          })}

          <div style={{ width: 1, height: 26, background: 'var(--border-card)' }} />

          {/* 6. Cash Float / KES Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>KES:</span>
            <input
              type="number"
              className="editable-cell-input editable-cell-input-money"
              style={{ width: 85 }}
              value={kesAmount}
              onChange={(e) => setKesAmount(parseInt(e.target.value) || 0)}
              title="Cash added to float ledger"
            />
          </div>

          <div style={{ width: 1, height: 26, background: 'var(--border-card)' }} />

          {/* 7. Samsung Financing Quick Entry (Out & In) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.775rem',
              background: 'rgba(56, 189, 248, 0.08)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>SAMSUNG</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem' }}>OUT:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input editable-cell-input-money"
              style={{ width: 68, color: samsungOut > 0 ? 'var(--accent-rose)' : undefined }}
              value={samsungOut || ''}
              placeholder="0"
              onChange={(e) => setSamsungOut(Math.max(0, parseInt(e.target.value) || 0))}
              title="Money Given Out for Samsung on this date"
            />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.725rem', marginLeft: 2 }}>IN:</span>
            <input
              type="number"
              min="0"
              className="editable-cell-input editable-cell-input-money"
              style={{ width: 68, color: samsungIn > 0 ? 'var(--accent-emerald)' : undefined }}
              value={samsungIn || ''}
              placeholder="0"
              onChange={(e) => setSamsungIn(Math.max(0, parseInt(e.target.value) || 0))}
              title="Cash Received Back from Samsung on this date"
            />
          </div>

          {/* Live Units Indicator */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
              Day Units: {liveStats.totalOut} Out • {liveStats.totalBack} Back
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              Capital: {formatKES(liveStats.totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
          <strong>LIVE ENTRY RECORDER — {date}</strong>
          <span style={{ color: 'var(--text-muted)' }}>
            All phone fields are live editable inputs. Changes persist to SQLite database and recalculate the entire ledger instantly.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {successNotice && (
            <span className="badge badge-success" style={{ animation: 'fadeIn 0.2s', fontWeight: 600 }}>
              ✓ {successNotice}
            </span>
          )}

          <button
            className="btn-secondary"
            style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
            onClick={handleDual}
          >
            + Dual Record {kesAmount > 0 ? formatKES(kesAmount) : `${liveStats.totalOut} Phones`}
          </button>

          {onOpenAddPhones && (
            <button
              className="btn-primary"
              style={{ background: 'var(--odoo-purple)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => onOpenAddPhones(date)}
              title="Add phone units in batch with live financial calculation"
            >
              <Smartphone size={13} /> + Add Phones
            </button>
          )}

          <button className="btn-primary" onClick={() => onOpenDayFigures(date)}>
            + Full Day Modal ({date})
          </button>

          <button className="btn-secondary" onClick={onNewDateRecord}>
            + New Date Record
          </button>
        </div>
      </div>
    </div>
  );
};
