'use client';

import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Check,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { MonthData, PhoneTypeConfig, DailyRecord } from '../lib/types';
import { formatKES } from '../lib/engine';

interface AddPhonesModalProps {
  isOpen: boolean;
  initialDate: string;
  month: MonthData;
  phoneTypes: PhoneTypeConfig[];
  onAddPhones: (
    date: string,
    phoneTypeId: string,
    qtyOut: number,
    qtyBack: number,
    mode: 'increment' | 'set'
  ) => void;
  onClose: () => void;
  onOpenSettingsAssumptions?: () => void;
  onOpenSamsung?: (date: string) => void;
}

export const AddPhonesModal: React.FC<AddPhonesModalProps> = ({
  isOpen,
  initialDate,
  month,
  phoneTypes,
  onAddPhones,
  onClose,
  onOpenSettingsAssumptions,
  onOpenSamsung,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(initialDate || month.records[0]?.date || '2026-09-01');
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>(phoneTypes[0]?.id || 'type-a');
  const [qtyOut, setQtyOut] = useState<number>(1);
  const [qtyBack, setQtyBack] = useState<number>(0);
  const [entryMode, setEntryMode] = useState<'increment' | 'set'>('increment');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Selected phone configuration
  const selectedPhone = useMemo(() => {
    return phoneTypes.find((p) => p.id === selectedPhoneId) || phoneTypes[0];
  }, [phoneTypes, selectedPhoneId]);

  // Existing record for this date
  const currentRecord = useMemo(() => {
    return month.records.find((r) => r.date === date);
  }, [month.records, date]);

  // Current counts for selected phone
  const existingCounts = useMemo(() => {
    if (!currentRecord) return { out: 0, back: 0 };
    if (selectedPhoneId === 'type-a') return { out: currentRecord.typeAOut || 0, back: currentRecord.typeABack || 0 };
    if (selectedPhoneId === 'type-b') return { out: currentRecord.typeBOut || 0, back: currentRecord.typeBBack || 0 };
    if (selectedPhoneId === 'type-c') return { out: currentRecord.typeCOut || 0, back: currentRecord.typeCBack || 0 };
    const custom = currentRecord.customPhones?.[selectedPhoneId];
    return { out: custom?.out || 0, back: custom?.back || 0 };
  }, [currentRecord, selectedPhoneId]);

  // Projected new counts
  const projectedOut = entryMode === 'increment' ? existingCounts.out + (Number(qtyOut) || 0) : Number(qtyOut) || 0;
  const projectedBack = entryMode === 'increment' ? existingCounts.back + (Number(qtyBack) || 0) : Number(qtyBack) || 0;

  // Live financial preview for this specific batch
  const capitalDeployedForBatch = (Number(qtyOut) || 0) * (selectedPhone?.cost || 0);
  const cashRecoveredForBatch = (Number(qtyBack) || 0) * (selectedPhone?.returnCash || 0);
  const profitGeneratedForBatch = (Number(qtyBack) || 0) * (selectedPhone?.baseProfit || 0);
  const secondAccGeneratedForBatch = (Number(qtyBack) || 0) * (selectedPhone?.secondAccountSpread || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone) return;

    onAddPhones(date, selectedPhone.id, Number(qtyOut) || 0, Number(qtyBack) || 0, entryMode);
    setSuccessNotice(`Added ${qtyOut} Out / ${qtyBack} Back of ${selectedPhone.name} for ${date}!`);
    setTimeout(() => {
      setSuccessNotice(null);
      onClose();
    }, 700);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  background: 'var(--odoo-purple)',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Add Phones to Daily Ledger</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Record dispatched or reconciled phone inventory with automatic float recalculation
                </p>
              </div>
            </div>
            <button type="button" className="btn-icon-close" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body" style={{ gap: '1rem' }}>
            {/* Date & Mode Selection Row */}
            <div className="form-row">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} color="var(--odoo-teal)" />
                  Trading Date
                </label>
                <select
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  {month.records.map((r) => (
                    <option key={r.date} value={r.date}>
                      {r.date}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={13} color="var(--accent-purple)" />
                  Entry Mode
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', height: 38 }}>
                  <button
                    type="button"
                    className={`btn-secondary ${entryMode === 'increment' ? 'active' : ''}`}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: entryMode === 'increment' ? 'var(--odoo-teal)' : undefined,
                      color: entryMode === 'increment' ? '#ffffff' : undefined,
                      borderColor: entryMode === 'increment' ? 'var(--odoo-teal)' : undefined,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                    onClick={() => setEntryMode('increment')}
                  >
                    + Add to Current
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${entryMode === 'set' ? 'active' : ''}`}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: entryMode === 'set' ? 'var(--odoo-teal)' : undefined,
                      color: entryMode === 'set' ? '#ffffff' : undefined,
                      borderColor: entryMode === 'set' ? 'var(--odoo-teal)' : undefined,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                    onClick={() => setEntryMode('set')}
                  >
                    = Set Absolute
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Model Selector */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Smartphone size={13} color="var(--odoo-teal)" />
                  Select Phone Model
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {onOpenSamsung && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSamsung(date);
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: 'var(--accent-blue)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      ⚡ Samsung Quick Float
                    </button>
                  )}
                  {onOpenSettingsAssumptions && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSettingsAssumptions();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-purple)',
                        fontSize: '0.725rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      + Configure New Phone Model
                    </button>
                  )}
                </div>
              </div>
              <select
                className="form-input"
                style={{ fontWeight: 600 }}
                value={selectedPhoneId}
                onChange={(e) => setSelectedPhoneId(e.target.value)}
              >
                {phoneTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} — {pt.model} (Cost: {formatKES(pt.cost)} | Return: {formatKES(pt.returnCash)} | Profit: {formatKES(pt.baseProfit)})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Phone Active Ledger Status Card */}
            <div
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current Status on {date}: </span>
                <strong>{selectedPhone?.name}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span>
                  Out: <strong style={{ color: 'var(--accent-amber)' }}>{existingCounts.out}</strong>
                </span>
                <span>
                  Back: <strong style={{ color: 'var(--accent-emerald)' }}>{existingCounts.back}</strong>
                </span>
                <span>
                  Still Out:{' '}
                  <strong style={{ color: existingCounts.out - existingCounts.back > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {Math.max(0, existingCounts.out - existingCounts.back)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Quantity Inputs */}
            <div className="form-row">
              <div
                className="form-group"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                }}
              >
                <label style={{ color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.775rem' }}>
                  PHONES DISPATCHED (OUT)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    style={{ fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
                    value={qtyOut}
                    onChange={(e) => setQtyOut(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {entryMode === 'increment'
                    ? `Current ${existingCounts.out} + ${qtyOut} = ${projectedOut} total`
                    : `Will set day total to ${qtyOut}`}
                </span>
              </div>

              <div
                className="form-group"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                }}
              >
                <label style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.775rem' }}>
                  PHONES RECONCILED (BACK)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    style={{ fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
                    value={qtyBack}
                    onChange={(e) => setQtyBack(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {entryMode === 'increment'
                    ? `Current ${existingCounts.back} + ${qtyBack} = ${projectedBack} total`
                    : `Will set day total to ${qtyBack}`}
                </span>
              </div>
            </div>

            {/* Live Financial Impact Card */}
            <div
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  FINANCIAL LEDGER IMPACT (THIS ENTRY)
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--odoo-teal)', fontWeight: 600 }}>
                  Unit: Cost {formatKES(selectedPhone?.cost || 0)} • Return {formatKES(selectedPhone?.returnCash || 0)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.775rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Capital Deployed Out:</span>
                  <strong style={{ color: 'var(--accent-amber)', fontSize: '0.9rem' }}>
                    {formatKES(capitalDeployedForBatch)}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    ({qtyOut} × {formatKES(selectedPhone?.cost || 0)})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Cash Recovered Back:</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                    {formatKES(cashRecoveredForBatch)}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    ({qtyBack} × {formatKES(selectedPhone?.returnCash || 0)})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Base Profit Earned:</span>
                  <strong style={{ color: 'var(--odoo-teal)', fontSize: '0.9rem' }}>
                    +{formatKES(profitGeneratedForBatch)}
                  </strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    ({qtyBack} × {formatKES(selectedPhone?.baseProfit || 0)})
                  </span>
                </div>

                {selectedPhone?.secondAccountSpread ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>2nd Account Spread:</span>
                    <strong style={{ color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                      +{formatKES(secondAccGeneratedForBatch)}
                    </strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      ({qtyBack} × {formatKES(selectedPhone.secondAccountSpread)})
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Float Net Effect:</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {formatKES(cashRecoveredForBatch - capitalDeployedForBatch - profitGeneratedForBatch)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {successNotice && (
                <span className="badge badge-success" style={{ animation: 'fadeIn 0.2s' }}>
                  ✓ {successNotice}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ background: 'var(--odoo-teal)', color: '#ffffff' }}
              >
                <PlusCircle size={14} /> Add Phones to Ledger
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
