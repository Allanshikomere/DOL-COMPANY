'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Edit3,
  Search,
  Info,
  Smartphone,
  Lock,
  Unlock,
  Coins,
  X,
  Check
} from 'lucide-react';
import { MonthData, PhoneTypeConfig, CalculatedDay, MonthSummary } from '../lib/types';
import { formatKES, formatNumber } from '../lib/engine';
import { exportCSV } from '../lib/storage';

interface DailyLedgerTableProps {
  month: MonthData;
  phoneTypes: PhoneTypeConfig[];
  calculatedDays: CalculatedDay[];
  summary: MonthSummary;
  selectedDate: string;
  isLocked?: boolean;
  onSelectDate: (date: string) => void;
  onUpdateRecord: (
    date: string,
    field: string,
    value: number | null
  ) => void;
  onOpenNewEntry: (date?: string) => void;
  onOpenAddPhones?: (date: string) => void;
  onOpenSamsung?: () => void;
  onOpenUnlock?: () => void;
}

export const DailyLedgerTable: React.FC<DailyLedgerTableProps> = ({
  month,
  phoneTypes,
  calculatedDays,
  summary,
  selectedDate,
  isLocked = false,
  onSelectDate,
  onUpdateRecord,
  onOpenNewEntry,
  onOpenAddPhones,
  onOpenSamsung,
  onOpenUnlock,
}) => {
  const [compactMode, setCompactMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'traded' | 'samsung' | 'unreconciled'>('all');

  // Point 9: Special lock for reconciled trading days
  const [unlockedReconciledDays, setUnlockedReconciledDays] = useState<Set<string>>(new Set());
  const [reconcileLockNotice, setReconcileLockNotice] = useState<string | null>(null);

  // Point 5: Capital In / Out (Column C / AH12) modal state
  const [showCapitalModal, setShowCapitalModal] = useState<boolean>(false);
  const [capitalDate, setCapitalDate] = useState<string>(selectedDate);
  const [capitalAmount, setCapitalAmount] = useState<number>(10000);
  const [capitalAction, setCapitalAction] = useState<'add' | 'reduce'>('add');

  const customPhoneTypes = useMemo(() => {
    return phoneTypes.filter((p) => !['type-a', 'type-b', 'type-c'].includes(p.id));
  }, [phoneTypes]);

  const toggleReconciledLock = (dateStr: string) => {
    if (isLocked && onOpenUnlock) {
      onOpenUnlock();
      return;
    }
    setUnlockedReconciledDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
        setReconcileLockNotice(`Locked ${dateStr} (Reconciled Protection Active)`);
      } else {
        next.add(dateStr);
        setReconcileLockNotice(`Unlocked ${dateStr} for error correction.`);
      }
      setTimeout(() => setReconcileLockNotice(null), 3000);
      return next;
    });
  };

  const toggleUnlockReconciledDay = toggleReconciledLock;

  const handleApplyCapitalAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const signed = capitalAction === 'add' ? Math.abs(capitalAmount) : -Math.abs(capitalAmount);
    onUpdateRecord(capitalDate, 'cashAdded', signed);
    setShowCapitalModal(false);
  };

  // Filter rows based on search & filter tabs
  const filteredDays = useMemo(() => {
    return calculatedDays.filter((day) => {
      // Filter tab
      if (filterType === 'traded') {
        const hasTrade =
          day.totalPhonesOut > 0 ||
          day.totalPhonesBack > 0 ||
          day.cashAdded !== 0 ||
          (day.samsungCashOut || 0) > 0 ||
          (day.samsungCashIn || 0) > 0;
        if (!hasTrade) return false;
      } else if (filterType === 'samsung') {
        const hasSamsung = (day.samsungCashOut || 0) > 0 || (day.samsungCashIn || 0) > 0;
        if (!hasSamsung) return false;
      } else if (filterType === 'unreconciled') {
        if (day.stillOut === 0) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const dateMatch = day.date.toLowerCase().includes(query);
        const statusMatch = day.positionStatus.toLowerCase().includes(query);
        return dateMatch || statusMatch;
      }

      return true;
    });
  }, [calculatedDays, filterType, searchQuery]);

  const handleExport = () => {
    const headers = [
      'Date',
      'Actual Balance (B)',
      'Cash In/Out (C)',
      'A Out (D)',
      'A Back (E)',
      'B Out (F)',
      'B Back (G)',
      'C Out Pop 20 (H)',
      'C Back Pop 20 (I)',
      'Opening Float',
      'Cash Given (N)',
      'In Hand (O)',
      'Cash Back (P)',
      'Profit (Q)',
      'To 2nd Account',
      'Closing Float',
      'Position',
      'Phones Still Out',
      'Stock Value at Cost',
      'Cash Still To Come',
      '2nd Account Running',
      'Cash Owed From Date',
    ];

    const rows = calculatedDays.map((d, idx) => {
      const rec = month.records[idx];
      return [
        d.date,
        rec?.actualBalance ?? '',
        rec?.cashAdded ?? 0,
        rec?.typeAOut ?? 0,
        rec?.typeABack ?? 0,
        rec?.typeBOut ?? 0,
        rec?.typeBBack ?? 0,
        rec?.typeCOut ?? 0,
        rec?.typeCBack ?? 0,
        d.openingUsed,
        d.cashGivenOut,
        d.cashLeftInHand,
        d.cashReceivedBack,
        d.profitTakenOut,
        d.toSecondAccount,
        d.closingFloat,
        d.positionStatus,
        d.stillOut,
        d.valueAtCost,
        d.cashStillToCome,
        d.secondAccountRunning,
        d.cashStillOwedFromDate,
      ];
    });

    exportCSV(month, headers, rows);
  };

  return (
    <div className="ledger-card">
      {/* Search & Filter Bar matching User Screenshot */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search date or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 30, width: 220, fontSize: '0.8rem', height: 32 }}
            />
          </div>

          {/* Filter Pills */}
          <div className="period-tabs">
            <button
              className={`period-pill-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Days ({calculatedDays.length})
            </button>
            <button
              className={`period-pill-btn ${filterType === 'traded' ? 'active' : ''}`}
              onClick={() => setFilterType('traded')}
            >
              Traded Only
            </button>
            {/* Point 8: Samsung tracker is scoped specifically to September */}
            {month.id === '2026-09' && (
              <button
                className={`period-pill-btn ${filterType === 'samsung' ? 'active' : ''}`}
                onClick={() => setFilterType('samsung')}
              >
                Samsung Quick ({calculatedDays.filter((d) => (d.samsungCashOut || 0) > 0 || (d.samsungCashIn || 0) > 0).length})
              </button>
            )}
            <button
              className={`period-pill-btn ${filterType === 'unreconciled' ? 'active' : ''}`}
              onClick={() => setFilterType('unreconciled')}
            >
              Unreconciled
            </button>
          </div>
        </div>

        {/* Right Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            className={`badge ${summary.floatTiesCheck !== false ? 'badge-success' : 'badge-danger'}`}
            title="Checks that opening float + cash added - cash given out + recovered - profit - 2nd account - closing float - quick out + quick in equals 0"
          >
            Check: float ties [{summary.floatTiesCheck !== false ? 'OK' : 'MISMATCH'}]
          </span>

          <span
            className={`badge ${summary.reconciliationTiesCheck !== false ? 'badge-success' : 'badge-danger'}`}
            title="Checks that phones given out minus phones reconciled equals phones still out"
          >
            Check: reconciliation ties [{summary.reconciliationTiesCheck !== false ? 'OK' : 'MISMATCH'}]
          </span>

          {/* Point 5: Add or Reduce Capital (Column C / AH12) */}
          <button
            className="btn-secondary"
            style={{
              borderColor: 'var(--odoo-teal)',
              color: 'var(--odoo-teal)',
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(1, 126, 132, 0.08)',
            }}
            onClick={() => {
              setCapitalDate(selectedDate);
              setShowCapitalModal(true);
            }}
            title="Add or Reduce Float Capital (Column C in ledger / AH12 in spreadsheet)"
          >
            <Coins size={13} /> Capital (+ / -)
          </button>

          {/* Point 8: Samsung Buffer button strictly for September */}
          {month.id === '2026-09' && onOpenSamsung && (
            <button
              className="btn-secondary"
              style={{
                borderColor: 'var(--accent-blue)',
                color: 'var(--accent-blue)',
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'rgba(56, 189, 248, 0.08)',
              }}
              onClick={onOpenSamsung}
              title="Open Samsung Sales Tracker & Quick Entry Buffer (September Only)"
            >
              <Smartphone size={13} /> Samsung Buffer ({summary.totalSamsungOut ? formatNumber(summary.totalSamsungOut) : '47k'}/{summary.totalSamsungIn ? formatNumber(summary.totalSamsungIn) : '39.1k'})
            </button>
          )}

          {onOpenAddPhones && (
            <button
              className="btn-primary"
              style={{
                background: 'var(--odoo-purple)',
                color: '#ffffff',
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
              onClick={() => onOpenAddPhones(selectedDate)}
              title="Quickly add phone units dispatched or reconciled for this day"
            >
              <Smartphone size={13} /> + Add Phones
            </button>
          )}

          <button
            className="btn-secondary"
            onClick={() => onOpenNewEntry(selectedDate)}
            title="Edit selected day"
          >
            <Edit3 size={13} /> Edit Selected ({selectedDate})
          </button>

          <span
            className="meta-chip"
            style={{ background: 'rgba(1, 126, 132, 0.08)', borderColor: 'rgba(1, 126, 132, 0.3)', color: 'var(--odoo-teal)', fontWeight: 700 }}
          >
            Closing Float: {formatNumber(summary.closingFloat)}
          </span>

          <span
            className="meta-chip"
            style={{ background: 'var(--accent-amber-dim)', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)', fontWeight: 700 }}
          >
            Active Date: {selectedDate}
          </span>
        </div>
      </div>

      {/* Info Notice Line matching Screenshot */}
      <div
        style={{
          padding: '0.45rem 1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card-hover)',
        }}
      >
        <Info size={13} color="var(--odoo-teal)" />
        Editable columns (B to G / H / I) are active for inline changes. Formulas recalculate automatically.
      </div>

      {/* Table Content */}
      <div className="table-wrapper">
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="col-sticky-date col-left">DATE</th>
              <th title="Actual morning balance (only type if different from expected)">
                ACTUAL BAL <span style={{ opacity: 0.6 }}>(B)</span>
              </th>
              <th title="Cash added or taken out from the float">
                CASH IN/OUT <span style={{ opacity: 0.6 }}>(C)</span>
              </th>

              <th title="Type A phones dispatched">
                A OUT <span style={{ opacity: 0.6 }}>(D)</span>
              </th>
              <th title="Type A phones reconciled">
                A BACK <span style={{ opacity: 0.6 }}>(E)</span>
              </th>

              <th title="Type B phones dispatched">
                B OUT <span style={{ opacity: 0.6 }}>(F)</span>
              </th>
              <th title="Type B phones reconciled">
                B BACK <span style={{ opacity: 0.6 }}>(G)</span>
              </th>

              <th title="Type C Pop 20 phones dispatched">
                C OUT POP 20 <span style={{ opacity: 0.6 }}>(H)</span>
              </th>
              <th title="Type C Pop 20 phones reconciled">
                C BACK POP 20 <span style={{ opacity: 0.6 }}>(I)</span>
              </th>

              {/* Point 1: Dynamic columns for custom phone models (Tecno 64GB, Itel 128GB, Itel 64GB, Infinix 128GB, etc.) */}
              {customPhoneTypes.map((cp) => (
                <React.Fragment key={cp.id}>
                  <th title={`${cp.name} (${cp.model}) dispatched`}>
                    {cp.name.toUpperCase()} OUT
                  </th>
                  <th title={`${cp.name} (${cp.model}) reconciled`}>
                    {cp.name.toUpperCase()} BACK
                  </th>
                </React.Fragment>
              ))}

              <th title="Cash given out to finance phones">
                CASH GIVEN <span style={{ opacity: 0.6 }}>(N)</span>
              </th>
              <th title="Cash remaining in hand before returns">
                IN HAND <span style={{ opacity: 0.6 }}>(O)</span>
              </th>
              <th title="Cash returned on reconciled phones">
                CASH BACK <span style={{ opacity: 0.6 }}>(P)</span>
              </th>
              <th title="Base profit taken out (100 per phone)">
                PROFIT <span style={{ opacity: 0.6 }}>(Q)</span>
              </th>
              <th title="Closing cash float at day end" style={{ color: '#38bdf8' }}>
                CLOSING FLOAT
              </th>

              <th className="col-left" title="Daily reconciliation status">
                POSITION
              </th>
              <th title="Total phones still unreconciled">STILL OUT</th>
              {!compactMode && <th title="Value of unreconciled stock at cost">STOCK AT COST</th>}
              <th title="Cash to be received upon full reconciliation">TO COME</th>
              {!compactMode && <th title="Cumulative 2nd account balance (130s)">2ND ACCOUNT</th>}
            </tr>
          </thead>

          <tbody>
            {filteredDays.map((day) => {
              const recIndex = month.records.findIndex((r) => r.date === day.date);
              const rec = month.records[recIndex] || {
                actualBalance: null,
                cashAdded: 0,
                typeAOut: 0,
                typeABack: 0,
                typeBOut: 0,
                typeBBack: 0,
                typeCOut: 0,
                typeCBack: 0,
              };

              const isSelected = selectedDate === day.date;
              const hasActivity =
                day.totalPhonesOut > 0 ||
                day.totalPhonesBack > 0 ||
                day.cashAdded !== 0 ||
                (day.samsungCashOut || 0) > 0 ||
                (day.samsungCashIn || 0) > 0;

              // Point 9: Safety lock for reconciled days
              const isDayLocked = day.positionStatus === 'All reconciled' && !unlockedReconciledDays.has(day.date);
              const isCellDisabled = isLocked || isDayLocked;
              const cellTitle = isDayLocked
                ? 'Day is reconciled & safety-locked against accidental edits. Click the lock icon in the Position column to unlock.'
                : isLocked
                ? 'Canvas Locked - click to enter PIN'
                : undefined;

              return (
                <tr
                  key={day.date}
                  className={`${hasActivity ? 'row-active' : ''} ${isSelected ? 'row-selected' : ''}`}
                  onClick={() => onSelectDate(day.date)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : undefined,
                  }}
                >
                  {/* Sticky Date */}
                  <td className="col-sticky-date col-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="tabular-nums" style={{ color: isSelected ? '#60a5fa' : undefined }}>
                        {day.date}
                      </span>
                      <button
                        className="btn-icon-close"
                        style={{ padding: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDayLocked) {
                            toggleUnlockReconciledDay(day.date);
                          }
                          onOpenNewEntry(day.date);
                        }}
                        title={isDayLocked ? 'Reconciled Day (Click to unlock)' : 'Edit this day'}
                      >
                        {isDayLocked ? <Lock size={11} style={{ color: '#f59e0b' }} /> : <Edit3 size={11} />}
                      </button>
                    </div>
                  </td>

                  {/* Actual Balance Override (B) */}
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input editable-cell-input-money"
                      placeholder="-"
                      value={rec.actualBalance ?? ''}
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'actualBalance',
                          e.target.value === '' ? null : Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* Cash Added / (Taken Out) (C) */}
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input editable-cell-input-money"
                      placeholder="0"
                      value={rec.cashAdded || ''}
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'cashAdded',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* Type A Out / Back (D, E) */}
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeAOut || ''}
                      placeholder="0"
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeAOut',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeABack || ''}
                      placeholder="0"
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeABack',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* Type B Out / Back (F, G) */}
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeBOut || ''}
                      placeholder="0"
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeBOut',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeBBack || ''}
                      placeholder="0"
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeBBack',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* Type C Pop 20 Out / Back (H, I) */}
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeCOut || ''}
                      placeholder="0"
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeCOut',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDayLocked) {
                        toggleUnlockReconciledDay(day.date);
                      } else if (isLocked && onOpenUnlock) {
                        onOpenUnlock();
                      }
                    }}
                    style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeCBack || ''}
                      placeholder="0"
                      disabled={isCellDisabled}
                      title={cellTitle}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeCBack',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* Point 1: Dynamic custom phone model inputs (Tecno 64GB, Itel 128GB, Itel 64GB, Infinix 128GB, etc.) */}
                  {customPhoneTypes.map((cp) => (
                    <React.Fragment key={cp.id}>
                      <td
                        className="col-input-tint"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDayLocked) {
                            toggleUnlockReconciledDay(day.date);
                          } else if (isLocked && onOpenUnlock) {
                            onOpenUnlock();
                          }
                        }}
                        style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                      >
                        <input
                          type="number"
                          className="editable-cell-input"
                          value={(rec as any)[`custom_out_${cp.id}`] ?? ''}
                          placeholder="0"
                          disabled={isCellDisabled}
                          title={cellTitle}
                          onChange={(e) =>
                            onUpdateRecord(
                              day.date,
                              `custom_out_${cp.id}` as any,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td
                        className="col-input-tint"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDayLocked) {
                            toggleUnlockReconciledDay(day.date);
                          } else if (isLocked && onOpenUnlock) {
                            onOpenUnlock();
                          }
                        }}
                        style={{ cursor: isCellDisabled ? 'not-allowed' : undefined }}
                      >
                        <input
                          type="number"
                          className="editable-cell-input"
                          value={(rec as any)[`custom_back_${cp.id}`] ?? ''}
                          placeholder="0"
                          disabled={isCellDisabled}
                          title={cellTitle}
                          onChange={(e) =>
                            onUpdateRecord(
                              day.date,
                              `custom_back_${cp.id}` as any,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                    </React.Fragment>
                  ))}

                  {/* Cash Given (N) */}
                  <td className="tabular-nums" style={{ color: day.cashGivenOut > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {day.cashGivenOut > 0 ? formatNumber(day.cashGivenOut) : '-'}
                  </td>

                  {/* In Hand (O) */}
                  <td className="tabular-nums">
                    {formatNumber(day.cashLeftInHand)}
                    {day.samsungCashOut > 0 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          display: 'block',
                          color: 'var(--accent-rose)',
                          cursor: onOpenSamsung ? 'pointer' : undefined,
                          textDecoration: onOpenSamsung ? 'underline dotted' : undefined,
                        }}
                        onClick={(e) => {
                          if (onOpenSamsung) {
                            e.stopPropagation();
                            onSelectDate(day.date);
                            onOpenSamsung();
                          }
                        }}
                        title="Click to view/manage this advance in Samsung Tracker"
                      >
                        (-{formatNumber(day.samsungCashOut)} quick)
                      </span>
                    )}
                  </td>

                  {/* Cash Back (P) */}
                  <td className="tabular-nums" style={{ color: day.cashReceivedBack > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {day.cashReceivedBack > 0 ? formatNumber(day.cashReceivedBack) : '-'}
                  </td>

                  {/* Profit (Q) */}
                  <td className="tabular-nums" style={{ color: day.profitTakenOut > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {day.profitTakenOut > 0 ? formatNumber(day.profitTakenOut) : '-'}
                  </td>

                  {/* Closing Float */}
                  <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--odoo-teal)' }}>
                    {formatNumber(day.closingFloat)}
                    {day.samsungCashIn > 0 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          display: 'block',
                          color: 'var(--accent-emerald)',
                          cursor: onOpenSamsung ? 'pointer' : undefined,
                          textDecoration: onOpenSamsung ? 'underline dotted' : undefined,
                        }}
                        onClick={(e) => {
                          if (onOpenSamsung) {
                            e.stopPropagation();
                            onSelectDate(day.date);
                            onOpenSamsung();
                          }
                        }}
                        title="Click to view/manage this cash recovery in Samsung Tracker"
                      >
                        (+{formatNumber(day.samsungCashIn)} quick)
                      </span>
                    )}
                  </td>

                  {/* Position Badge with Reconciled Safety Lock (Point 9) */}
                  <td className="col-left">
                    {day.positionStatus === 'All reconciled' ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Reconciled
                        </span>
                        {isDayLocked ? (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{
                              padding: '1px 5px',
                              fontSize: '0.65rem',
                              height: 'auto',
                              lineHeight: 1.2,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              cursor: 'pointer',
                              background: 'rgba(245, 158, 11, 0.1)',
                              borderColor: 'rgba(245, 158, 11, 0.3)',
                              color: '#f59e0b',
                            }}
                            title="Safety Lock Active: Day is reconciled and protected from accidental edits. Click to unlock for error correction."
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUnlockReconciledDay(day.date);
                            }}
                          >
                            <Lock size={10} /> Locked
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{
                              padding: '1px 5px',
                              fontSize: '0.65rem',
                              height: 'auto',
                              lineHeight: 1.2,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              borderColor: '#10b981',
                              color: '#10b981',
                              cursor: 'pointer',
                            }}
                            title="Unlocked for error correction. Click to re-lock."
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUnlockReconciledDay(day.date);
                            }}
                          >
                            <Unlock size={10} /> Unlocked
                          </button>
                        )}
                      </div>
                    ) : day.positionStatus === 'No trading' ? (
                      <span className="badge badge-neutral">
                        <MinusCircle size={12} /> No trading
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} /> {day.positionStatus}
                      </span>
                    )}
                  </td>

                  {/* Still Out */}
                  <td
                    className="tabular-nums"
                    style={{
                      fontWeight: day.stillOut > 0 ? 700 : 400,
                      color: day.stillOut > 0 ? 'var(--accent-amber)' : 'var(--text-muted)',
                    }}
                  >
                    {day.stillOut > 0 ? day.stillOut : '-'}
                  </td>

                  {!compactMode && (
                    <td className="tabular-nums">
                      {day.valueAtCost > 0 ? formatNumber(day.valueAtCost) : '-'}
                    </td>
                  )}

                  <td className="tabular-nums" style={{ color: day.cashStillToCome > 0 ? 'var(--odoo-teal)' : 'var(--text-muted)' }}>
                    {day.cashStillToCome > 0 ? formatNumber(day.cashStillToCome) : '-'}
                  </td>

                  {!compactMode && (
                    <td className="tabular-nums" style={{ color: 'var(--accent-purple)' }}>
                      {day.secondAccountRunning > 0 ? formatNumber(day.secondAccountRunning) : '-'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          {/* Table Totals Footer */}
          <tfoot>
            <tr>
              <td className="col-sticky-date col-left">MONTH TOTAL</td>
              <td>-</td>
              <td className="tabular-nums">
                {formatNumber(
                  month.records.reduce((acc, r) => acc + (r.cashAdded || 0), 0)
                )}
              </td>

              <td className="tabular-nums">
                {formatNumber(month.records.reduce((acc, r) => acc + (r.typeAOut || 0), 0))}
              </td>
              <td className="tabular-nums">
                {formatNumber(month.records.reduce((acc, r) => acc + (r.typeABack || 0), 0))}
              </td>

              <td className="tabular-nums">
                {formatNumber(month.records.reduce((acc, r) => acc + (r.typeBOut || 0), 0))}
              </td>
              <td className="tabular-nums">
                {formatNumber(month.records.reduce((acc, r) => acc + (r.typeBBack || 0), 0))}
              </td>

              <td className="tabular-nums">
                {formatNumber(month.records.reduce((acc, r) => acc + (r.typeCOut || 0), 0))}
              </td>
              <td className="tabular-nums">
                {formatNumber(month.records.reduce((acc, r) => acc + (r.typeCBack || 0), 0))}
              </td>

              {/* Point 1: Dynamic totals for custom phone models (Tecno, Itel, Infinix, etc.) */}
              {customPhoneTypes.map((cp) => (
                <React.Fragment key={cp.id}>
                  <td className="tabular-nums">
                    {formatNumber(
                      month.records.reduce(
                        (acc, r) => acc + (((r as any)[`custom_out_${cp.id}`] as number) || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="tabular-nums">
                    {formatNumber(
                      month.records.reduce(
                        (acc, r) => acc + (((r as any)[`custom_back_${cp.id}`] as number) || 0),
                        0
                      )
                    )}
                  </td>
                </React.Fragment>
              ))}

              <td className="tabular-nums" style={{ color: 'var(--accent-rose)' }}>
                {formatNumber(summary.totalCapitalDeployed)}
              </td>
              <td>-</td>
              <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
                {formatNumber(summary.totalCashRecovered)}
              </td>
              <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
                {formatNumber(summary.totalBaseProfit)}
              </td>
              <td className="tabular-nums" style={{ color: 'var(--odoo-teal)', fontSize: '0.9rem' }}>
                {formatNumber(summary.closingFloat)}
              </td>

              <td className="col-left">
                {summary.outstandingPhones > 0 ? (
                  <span className="badge badge-warning">
                    {summary.outstandingPhones} open
                  </span>
                ) : (
                  <span className="badge badge-success">Balanced</span>
                )}
              </td>

              <td className="tabular-nums" style={{ color: 'var(--accent-amber)' }}>
                {summary.outstandingPhones}
              </td>
              {!compactMode && (
                <td className="tabular-nums">{formatNumber(summary.outstandingValueAtCost)}</td>
              )}
              <td className="tabular-nums" style={{ color: 'var(--odoo-teal)' }}>
                {formatNumber(summary.outstandingCashToCome)}
              </td>
              {!compactMode && (
                <td className="tabular-nums" style={{ color: 'var(--accent-purple)' }}>
                  {formatNumber(summary.totalSecondAccount)}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Spreadsheet Summary & Audit Reconciliation Block (AH3:AL41) */}
      <div
        className="ledger-card"
        style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-purple-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <Coins size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                Spreadsheet Summary & Audit Reconciliation Block (AH3:AL41)
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>
                Direct mathematical tie-out to Excel formulas AI11 through AI40
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span
              className={`badge ${summary.floatTiesCheck !== false ? 'badge-success' : 'badge-danger'}`}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.6rem' }}
            >
              AI27: Float Ties [{summary.floatTiesCheck !== false ? 'OK' : 'MISMATCH'}]
            </span>
            <span
              className={`badge ${summary.reconciliationTiesCheck !== false ? 'badge-success' : 'badge-danger'}`}
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.6rem' }}
            >
              AI28: Unit Rec Ties [{summary.reconciliationTiesCheck !== false ? 'OK' : 'MISMATCH'}]
            </span>
          </div>
        </div>

        {/* 4-Column Grid for Key Spreadsheet Formula Cells */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          {/* Initial Float (AI11) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Initial Float (AI11)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatKES(month.openingFloat)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =AI6</div>
          </div>

          {/* Total Cash Out (AI14) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Cash Out (AI14)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
              {formatKES(summary.totalCapitalDeployed)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =N33</div>
          </div>

          {/* Total Cash Received (AI15) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Cash Received (AI15)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {formatKES(summary.totalCashRecovered)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =P33</div>
          </div>

          {/* Expected Cash Still to Come (AI17) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cash Still to Come (AI17)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)' }}>
              {formatKES(summary.outstandingCashToCome)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =AI16 - AI15</div>
          </div>

          {/* Base Profit (AI19) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Base Profit (AI19)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {formatKES(summary.totalBaseProfit)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =Q33</div>
          </div>

          {/* 2nd Account Margin (AI20) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2nd Account Earnings (AI20)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
              {formatKES(summary.totalSecondAccount)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =AE33</div>
          </div>

          {/* Closing Float (AI22) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Closing Float at 30 Sep (AI22)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)' }}>
              {formatKES(summary.closingFloat)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>Formula: =R32</div>
          </div>

          {/* Open Stock at Cost (AI34) */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Open Stock at Cost (AI34)</div>
            <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {formatKES(summary.outstandingValueAtCost)}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>{summary.outstandingPhones} open handsets</div>
          </div>
        </div>

        {/* Portfolio Value Carried Forward (AI40) */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(1, 126, 132, 0.08), rgba(16, 185, 129, 0.12))',
            border: '1px solid rgba(1, 126, 132, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--odoo-teal)' }}>
              Total Portfolio Value Carried to October (AI40):
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Formula: =AI38 + AI34 (Closing Cash {formatKES(summary.closingFloat)} + Stock at Cost {formatKES(summary.outstandingValueAtCost)})
            </div>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {formatKES(summary.closingFloat + summary.outstandingValueAtCost)}
          </div>
        </div>
      </div>

      {/* Point 5: Capital Adjustment Modal (Add / Reduce Capital - Col C & AH12) */}
      {showCapitalModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowCapitalModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              width: '420px',
              maxWidth: '92vw',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Coins size={18} style={{ color: 'var(--accent-emerald)' }} /> Capital / Float Adjustment (Col C)
              </h3>
              <button
                className="btn-icon-close"
                onClick={() => setShowCapitalModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Add or withdraw capital directly from the float. In spreadsheet <strong>Column C & AH12</strong>, adding capital injects money into your float, while taking money out reduces it.
            </p>

            <form onSubmit={handleApplyCapitalAdjust}>
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Select Date
                </label>
                <input
                  type="date"
                  className="editable-cell-input"
                  value={capitalDate}
                  onChange={(e) => setCapitalDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.9rem' }}>
                <button
                  type="button"
                  className={`btn ${capitalAction === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: capitalAction === 'add' ? 'var(--accent-emerald)' : undefined,
                    color: capitalAction === 'add' ? '#ffffff' : undefined,
                  }}
                  onClick={() => setCapitalAction('add')}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>+</span> Add Capital
                </button>
                <button
                  type="button"
                  className={`btn ${capitalAction === 'reduce' ? 'btn-secondary' : 'btn-secondary'}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: capitalAction === 'reduce' ? 'var(--accent-rose)' : undefined,
                    color: capitalAction === 'reduce' ? '#ffffff' : undefined,
                  }}
                  onClick={() => setCapitalAction('reduce')}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>-</span> Withdraw / Reduce
                </button>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Amount (KES)
                </label>
                <input
                  type="number"
                  autoFocus
                  className="editable-cell-input editable-cell-input-money"
                  placeholder="e.g. 50000"
                  value={capitalAmount || ''}
                  onChange={(e) => setCapitalAmount(Math.max(0, Number(e.target.value)))}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCapitalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={capitalAmount <= 0}
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
