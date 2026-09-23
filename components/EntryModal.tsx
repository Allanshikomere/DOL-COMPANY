'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, DollarSign, Smartphone, Check } from 'lucide-react';
import { MonthData, PhoneTypeConfig } from '../lib/types';
import { formatKES } from '../lib/engine';

interface EntryModalProps {
  initialDate?: string;
  month: MonthData;
  phoneTypes: PhoneTypeConfig[];
  onSaveDay: (
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
      samsungCashOut?: number;
      samsungCashIn?: number;
    }
  ) => void;
  onClose: () => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  initialDate,
  month,
  phoneTypes,
  onSaveDay,
  onClose,
}) => {
  const defaultDate = initialDate || month.records[0]?.date || '9/1/2026';
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const existing = month.records.find((r) => r.date === selectedDate) || {
    actualBalance: null,
    cashAdded: 0,
    typeAOut: 0,
    typeABack: 0,
    typeBOut: 0,
    typeBBack: 0,
    typeCOut: 0,
    typeCBack: 0,
    samsungCashOut: 0,
    samsungCashIn: 0,
  };

  const [actualBal, setActualBal] = useState<string>(
    existing.actualBalance !== null ? String(existing.actualBalance) : ''
  );
  const [cashAdded, setCashAdded] = useState<number>(existing.cashAdded || 0);
  const [typeAOut, setTypeAOut] = useState<number>(existing.typeAOut || 0);
  const [typeABack, setTypeABack] = useState<number>(existing.typeABack || 0);
  const [typeBOut, setTypeBOut] = useState<number>(existing.typeBOut || 0);
  const [typeBBack, setTypeBBack] = useState<number>(existing.typeBBack || 0);
  const [typeCOut, setTypeCOut] = useState<number>(existing.typeCOut || 0);
  const [typeCBack, setTypeCBack] = useState<number>(existing.typeCBack || 0);
  const [samsungCashOut, setSamsungCashOut] = useState<number>(existing.samsungCashOut || 0);
  const [samsungCashIn, setSamsungCashIn] = useState<number>(existing.samsungCashIn || 0);

  useEffect(() => {
    const cur = month.records.find((r) => r.date === selectedDate);
    if (cur) {
      setActualBal(cur.actualBalance !== null ? String(cur.actualBalance) : '');
      setCashAdded(cur.cashAdded || 0);
      setTypeAOut(cur.typeAOut || 0);
      setTypeABack(cur.typeABack || 0);
      setTypeBOut(cur.typeBOut || 0);
      setTypeBBack(cur.typeBBack || 0);
      setTypeCOut(cur.typeCOut || 0);
      setTypeCBack(cur.typeCBack || 0);
      setSamsungCashOut(cur.samsungCashOut || 0);
      setSamsungCashIn(cur.samsungCashIn || 0);
    }
  }, [selectedDate, month]);

  const typeA = phoneTypes.find((p) => p.id === 'type-a');
  const typeB = phoneTypes.find((p) => p.id === 'type-b');
  const typeC = phoneTypes.find((p) => p.id === 'type-c');

  // Preview calculations
  const totalOut = typeAOut + typeBOut + typeCOut;
  const totalBack = typeABack + typeBBack + typeCBack;
  const cashGivenOut =
    typeAOut * (typeA?.cost || 3700) +
    typeBOut * (typeB?.cost || 3570) +
    typeCOut * (typeC?.cost || 3600);
  const cashBack =
    typeABack * (typeA?.returnCash || 3800) +
    typeBBack * (typeB?.returnCash || 3800) +
    typeCBack * (typeC?.returnCash || 3700);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDay(selectedDate, {
      actualBalance: actualBal === '' ? null : Number(actualBal),
      cashAdded: Number(cashAdded) || 0,
      typeAOut: Number(typeAOut) || 0,
      typeABack: Number(typeABack) || 0,
      typeBOut: Number(typeBOut) || 0,
      typeBBack: Number(typeBBack) || 0,
      typeCOut: Number(typeCOut) || 0,
      typeCBack: Number(typeCBack) || 0,
      samsungCashOut: Number(samsungCashOut) || 0,
      samsungCashIn: Number(samsungCashIn) || 0,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 620 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PlusCircle color="var(--accent-blue)" size={20} />
              <div>
                <h3>Daily Trading Entry</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Enter phone counts and float adjustments for {selectedDate}
                </p>
              </div>
            </div>
            <button type="button" className="btn-icon-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="modal-body">
            {/* Date Selector */}
            <div className="form-group">
              <label>Select Trading Date</label>
              <select
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                {month.records.map((r) => (
                  <option key={r.date} value={r.date}>
                    {r.date}
                  </option>
                ))}
              </select>
            </div>

            {/* Float Adjustment Inputs */}
            <div className="form-row">
              <div className="form-group">
                <label>Actual Morning Balance (Override)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Leave empty if matches expected"
                  value={actualBal}
                  onChange={(e) => setActualBal(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Only fill if actual waking cash differed from expected
                </span>
              </div>

              <div className="form-group">
                <label>Cash Added / (Taken Out) (KES)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={cashAdded}
                  onChange={(e) => setCashAdded(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Positive to add cash; negative (e.g. -10000) to withdraw
                </span>
              </div>
            </div>

            {/* Phone Counts Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Phones Dispatched & Reconciled
              </label>

              {/* Type A */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Type A (128GB)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Cost: 3,700 | Return: 3,800 | Profit: 100
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="form-group" style={{ width: 85 }}>
                    <label style={{ fontSize: '0.75rem' }}>Out</label>
                    <input
                      type="number"
                      className="form-input"
                      value={typeAOut}
                      onChange={(e) => setTypeAOut(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ width: 85 }}>
                    <label style={{ fontSize: '0.75rem' }}>Back</label>
                    <input
                      type="number"
                      className="form-input"
                      value={typeABack}
                      onChange={(e) => setTypeABack(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Type B */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Type B (64GB)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Cost: 3,570 | Return: 3,800 | 100 profit + 130 2nd acc
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="form-group" style={{ width: 85 }}>
                    <label style={{ fontSize: '0.75rem' }}>Out</label>
                    <input
                      type="number"
                      className="form-input"
                      value={typeBOut}
                      onChange={(e) => setTypeBOut(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ width: 85 }}>
                    <label style={{ fontSize: '0.75rem' }}>Back</label>
                    <input
                      type="number"
                      className="form-input"
                      value={typeBBack}
                      onChange={(e) => setTypeBBack(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Type C */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Type C (Pop 20 64GB)</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Cost: 3,600 | Return: 3,700 | Profit: 100
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="form-group" style={{ width: 85 }}>
                    <label style={{ fontSize: '0.75rem' }}>Out</label>
                    <input
                      type="number"
                      className="form-input"
                      value={typeCOut}
                      onChange={(e) => setTypeCOut(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ width: 85 }}>
                    <label style={{ fontSize: '0.75rem' }}>Back</label>
                    <input
                      type="number"
                      className="form-input"
                      value={typeCBack}
                      onChange={(e) => setTypeCBack(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Samsung Sales & Financing (Quick Entry) */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--accent-blue)' }}>Samsung Sales & Financing</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Quick entry buffer: Cash given out & recovered
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="form-group" style={{ width: 105 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>Money Given Out</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={samsungCashOut}
                      onChange={(e) => setSamsungCashOut(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ width: 105 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Cash Recovered</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={samsungCashIn}
                      onChange={(e) => setSamsungCashIn(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Preview Box */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Cash Out: </span>
                <strong style={{ color: '#f87171' }}>{formatKES(cashGivenOut)}</strong> ({totalOut} units)
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Cash Back: </span>
                <strong style={{ color: '#34d399' }}>{formatKES(cashBack)}</strong> ({totalBack} units)
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={14} /> Update Day
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
