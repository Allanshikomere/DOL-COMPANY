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
  Smartphone
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
            <button
              className={`period-pill-btn ${filterType === 'samsung' ? 'active' : ''}`}
              onClick={() => setFilterType('samsung')}
            >
              Samsung Quick ({calculatedDays.filter((d) => (d.samsungCashOut || 0) > 0 || (d.samsungCashIn || 0) > 0).length})
            </button>
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

          {onOpenSamsung && (
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
              title="Open Samsung Sales Tracker & Quick Entry Buffer"
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
                          onOpenNewEntry(day.date);
                        }}
                        title="Edit this day"
                      >
                        <Edit3 size={11} />
                      </button>
                    </div>
                  </td>

                  {/* Actual Balance Override (B) */}
                  <td
                    className="col-input-tint"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input editable-cell-input-money"
                      placeholder="-"
                      value={rec.actualBalance ?? ''}
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input editable-cell-input-money"
                      placeholder="0"
                      value={rec.cashAdded || ''}
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeAOut || ''}
                      placeholder="0"
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeABack || ''}
                      placeholder="0"
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeBOut || ''}
                      placeholder="0"
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeBBack || ''}
                      placeholder="0"
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeCOut || ''}
                      placeholder="0"
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
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
                      if (isLocked && onOpenUnlock) onOpenUnlock();
                    }}
                    style={{ cursor: isLocked ? 'not-allowed' : undefined }}
                  >
                    <input
                      type="number"
                      className="editable-cell-input"
                      value={rec.typeCBack || ''}
                      placeholder="0"
                      disabled={isLocked}
                      title={isLocked ? 'Canvas Locked - click to enter PIN' : undefined}
                      onChange={(e) =>
                        onUpdateRecord(
                          day.date,
                          'typeCBack',
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

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

                  {/* Position Badge */}
                  <td className="col-left">
                    {day.positionStatus === 'All reconciled' ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> All reconciled
                      </span>
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
    </div>
  );
};
