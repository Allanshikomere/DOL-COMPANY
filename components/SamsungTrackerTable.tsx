'use client';

import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Save,
  HelpCircle
} from 'lucide-react';
import { SamsungTrackerEntry } from '../lib/types';
import { formatKES } from '../lib/engine';

interface SamsungTrackerTableProps {
  entries: SamsungTrackerEntry[];
  onAddEntry: (entry: SamsungTrackerEntry) => void;
  onUpdateEntry?: (entry: SamsungTrackerEntry) => void;
  onSelectDate?: (date: string) => void;
}

export const SamsungTrackerTable: React.FC<SamsungTrackerTableProps> = ({
  entries,
  onAddEntry,
  onUpdateEntry,
  onSelectDate,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDate, setModalDate] = useState('2026-09-23');
  const [modalCashOut, setModalCashOut] = useState<number>(3500);
  const [modalCashIn, setModalCashIn] = useState<number>(0);
  const [modalMode, setModalMode] = useState<'cumulative' | 'replace'>('cumulative');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Point 4: Quick cumulative add state
  const [quickAddTarget, setQuickAddTarget] = useState<{
    date: string;
    field: 'cashOut' | 'cashIn';
    current: number;
  } | null>(null);
  const [quickAddVal, setQuickAddVal] = useState<number>(0);

  // Ensure all dates from 2026-09-16 through 2026-09-30 exist in table view
  const allSeptemberDates = useMemo(() => {
    const list: string[] = [];
    for (let day = 16; day <= 30; day++) {
      list.push(`2026-09-${String(day).padStart(2, '0')}`);
    }
    return list;
  }, []);

  // Merge entries with full date range so every day 9/16 to 9/30 is available for entry
  const displayRows = useMemo(() => {
    return allSeptemberDates.map((d) => {
      const existing = entries.find((e) => e.date === d);
      if (existing) return existing;
      return {
        date: d,
        cashOut: 0,
        cashIn: 0,
        profit: 0,
        status: 'No trading',
      };
    });
  }, [allSeptemberDates, entries]);

  const totalOut = displayRows.reduce((acc, e) => acc + (e.cashOut || 0), 0);
  const totalIn = displayRows.reduce((acc, e) => acc + (e.cashIn || 0), 0);
  const totalNet = totalIn - totalOut;

  const pendingEntries = displayRows.filter(
    (e) => (e.cashOut > 0 || e.cashIn > 0) && e.cashIn < e.cashOut
  );
  const totalPendingAmount = pendingEntries.reduce(
    (acc, e) => acc + (e.cashOut - e.cashIn),
    0
  );

  // Handle live inline editing of cashOut or cashIn for any date
  const handleCellChange = (
    entryDate: string,
    field: 'cashOut' | 'cashIn',
    value: number
  ) => {
    const existing = displayRows.find((e) => e.date === entryDate);
    const newOut = field === 'cashOut' ? Math.max(0, value) : existing?.cashOut || 0;
    const newIn = field === 'cashIn' ? Math.max(0, value) : existing?.cashIn || 0;
    const newProfit = newIn - newOut;

    let status = 'No trading';
    if (newOut > 0 || newIn > 0) {
      if (newProfit === 0) {
        status = 'Reconciled';
      } else if (newProfit > 0) {
        status = `Profit (+KES ${newProfit.toLocaleString()})`;
      } else if (newIn > 0 && newIn < newOut) {
        status = `Partial (${Math.abs(newProfit).toLocaleString()} pending)`;
      } else {
        status = `Pending (${Math.abs(newProfit).toLocaleString()})`;
      }
    }

    const updatedEntry: SamsungTrackerEntry = {
      date: entryDate,
      cashOut: newOut,
      cashIn: newIn,
      profit: newProfit,
      status,
    };

    if (onUpdateEntry) {
      onUpdateEntry(updatedEntry);
    } else {
      onAddEntry(updatedEntry);
    }

    setSaveNotice(`Updated ${entryDate}: Out KES ${newOut.toLocaleString()}, In KES ${newIn.toLocaleString()}`);
    setTimeout(() => setSaveNotice(null), 2500);
  };

  // Point 4: Add cumulatively to existing figures
  const handleAddCumulative = (entryDate: string, field: 'cashOut' | 'cashIn', addAmount: number) => {
    if (addAmount <= 0) return;
    const existing = displayRows.find((e) => e.date === entryDate);
    const current = field === 'cashOut' ? (existing?.cashOut || 0) : (existing?.cashIn || 0);
    const updated = current + addAmount;
    handleCellChange(entryDate, field, updated);
    setQuickAddTarget(null);
    setQuickAddVal(0);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = displayRows.find((e) => e.date === modalDate);
    const finalOut = modalMode === 'cumulative' ? (existing?.cashOut || 0) + modalCashOut : modalCashOut;
    const finalIn = modalMode === 'cumulative' ? (existing?.cashIn || 0) + modalCashIn : modalCashIn;

    handleCellChange(modalDate, 'cashOut', finalOut);
    if (finalIn > 0 || modalMode === 'replace') {
      handleCellChange(modalDate, 'cashIn', finalIn);
    }
    setShowAddModal(false);
  };

  const formatExcelNet = (net: number, hasActivity: boolean) => {
    if (!hasActivity) return '-';
    if (net === 0) return '-';
    if (net < 0) return `(${Math.abs(net).toLocaleString()})`;
    return net.toLocaleString();
  };

  return (
    <div className="ledger-card">
      {/* Toolbar */}
      <div className="ledger-toolbar">
        <div className="toolbar-title-wrap">
          <Smartphone size={18} color="var(--accent-blue)" />
          <span className="toolbar-title">
            SAMSUNG SALES TRACKER & QUICK ENTRY BUFFER
          </span>
          <span className="badge badge-info">Direct Ledger Link</span>
          {saveNotice && (
            <span className="badge badge-success" style={{ animation: 'fadeIn 0.2s', fontWeight: 600 }}>
              ✓ {saveNotice}
            </span>
          )}
        </div>

        <div className="toolbar-controls">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Quick Entry Modal
          </button>
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* KPI Cards for Samsung Tracker */}
        <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-blue)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Total Money Given Out</span>
              <div className="kpi-icon-wrap">
                <Smartphone size={18} />
              </div>
            </div>
            <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-rose)' }}>
              {formatKES(totalOut)}
            </div>
            <div className="kpi-subtext">Capital disbursed from float for Samsung</div>
          </div>

          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Expected Received Back</span>
              <div className="kpi-icon-wrap">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
              {formatKES(totalIn)}
            </div>
            <div className="kpi-subtext">Recovered cash into float to date</div>
          </div>

          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-amber)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Net Difference (Spread)</span>
              <div className="kpi-icon-wrap">
                <Clock size={18} />
              </div>
            </div>
            <div
              className="kpi-value tabular-nums"
              style={{ color: totalNet < 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}
            >
              {totalNet < 0 ? `(${formatKES(Math.abs(totalNet))})` : formatKES(totalNet)}
            </div>
            <div className="kpi-subtext">
              {totalPendingAmount > 0
                ? `${formatKES(totalPendingAmount)} active pending reconciliation`
                : 'All Samsung transactions fully reconciled'}
            </div>
          </div>
        </div>

        {/* Explanatory Guide Box */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--odoo-teal)', display: 'inline-block' }} />
            <span>
              <strong>Excel Live Sync Mode:</strong> Edit <em>Money Given Out</em> and <em>Expected Received Back</em> directly in the table. Numbers update float in hand and closing float instantly.
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>
            Net Difference = (Expected Received Back) − (Money Given Out)
          </span>
        </div>

        {/* Entries Table Matching Spreadsheet Screenshot */}
        <div className="table-wrapper">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="col-sticky-date col-left" style={{ width: 140 }}>
                  Date
                </th>
                <th style={{ width: 180 }}>
                  Money Given Out
                </th>
                <th style={{ width: 180 }}>
                  Expected Received Back
                </th>
                <th style={{ width: 150 }}>
                  Net Difference
                </th>
                <th className="col-left" style={{ width: 200 }}>
                  Status
                </th>
                <th style={{ width: 180, textAlign: 'center', color: 'var(--odoo-teal)' }}>
                  QUICK ENTRY
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((item) => {
                const hasActivity = item.cashOut > 0 || item.cashIn > 0;
                const formattedDate = item.date.replace('2026-09-', '9/') + '/2026';
                const isPending = item.profit < 0;

                return (
                  <tr
                    key={item.date}
                    style={{
                      background: item.date === '2026-09-23' ? 'rgba(234, 179, 8, 0.08)' : undefined,
                    }}
                    onClick={() => onSelectDate && onSelectDate(item.date)}
                  >
                    <td className="col-sticky-date col-left">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="tabular-nums" style={{ fontWeight: 700 }}>
                          {formattedDate}
                        </span>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                          {item.date}
                        </span>
                      </div>
                    </td>

                    {/* Money Given Out (Editable with cumulative add button) */}
                    <td className="col-input-tint">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          min="0"
                          className="editable-cell-input editable-cell-input-money"
                          style={{
                            width: '100%',
                            color: item.cashOut > 0 ? 'var(--accent-rose)' : undefined,
                            fontWeight: 700,
                          }}
                          value={item.cashOut || ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleCellChange(item.date, 'cashOut', parseInt(e.target.value) || 0)
                          }
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            padding: '1px 5px',
                            fontSize: '0.7rem',
                            height: '24px',
                            lineHeight: 1,
                            fontWeight: 700,
                            color: 'var(--accent-rose)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.08)',
                            flexShrink: 0,
                          }}
                          title={`Click to add cash sent cumulatively to ${formattedDate} (Current: KES ${item.cashOut.toLocaleString()})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickAddTarget({ date: item.date, field: 'cashOut', current: item.cashOut });
                            setQuickAddVal(0);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Expected Received Back (Editable with cumulative add button) */}
                    <td className="col-input-tint">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          min="0"
                          className="editable-cell-input editable-cell-input-money"
                          style={{
                            width: '100%',
                            color: item.cashIn > 0 ? 'var(--accent-emerald)' : undefined,
                            fontWeight: 700,
                          }}
                          value={item.cashIn || ''}
                          placeholder="-"
                          onChange={(e) =>
                            handleCellChange(item.date, 'cashIn', parseInt(e.target.value) || 0)
                          }
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            padding: '1px 5px',
                            fontSize: '0.7rem',
                            height: '24px',
                            lineHeight: 1,
                            fontWeight: 700,
                            color: 'var(--accent-emerald)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                            background: 'rgba(16, 185, 129, 0.08)',
                            flexShrink: 0,
                          }}
                          title={`Click to add cash received cumulatively to ${formattedDate} (Current: KES ${item.cashIn.toLocaleString()})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickAddTarget({ date: item.date, field: 'cashIn', current: item.cashIn });
                            setQuickAddVal(0);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Net Difference (Auto-Computed Formula) */}
                    <td
                      className="tabular-nums"
                      style={{
                        fontWeight: 700,
                        color:
                          item.profit > 0
                            ? 'var(--accent-emerald)'
                            : item.profit < 0
                            ? 'var(--accent-amber)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {formatExcelNet(item.profit, hasActivity)}
                    </td>

                    {/* Status Badge */}
                    <td className="col-left">
                      {item.status.includes('Reconciled') ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} /> {item.status}
                        </span>
                      ) : item.status.includes('No trading') ? (
                        <span className="badge badge-neutral">-</span>
                      ) : item.status.includes('Partial') ? (
                        <span className="badge badge-warning">
                          <Clock size={11} /> {item.status}
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                          <AlertTriangle size={11} /> {item.status}
                        </span>
                      )}
                    </td>

                    {/* Quick Entry Action */}
                    <td style={{ textAlign: 'center' }}>
                      {item.cashOut > 0 && item.cashIn < item.cashOut && (
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            color: 'var(--accent-emerald)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Settle today's transaction by returning full amount
                            handleCellChange(item.date, 'cashIn', item.cashOut);
                          }}
                          title={`Click to mark KES ${item.cashOut.toLocaleString()} as returned and reconciled`}
                        >
                          ✓ Settle Full
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="col-sticky-date col-left" style={{ fontWeight: 800 }}>
                  TOTAL SAMSUNG
                </td>
                <td className="tabular-nums" style={{ color: 'var(--accent-rose)', fontWeight: 800 }}>
                  {totalOut.toLocaleString()}
                </td>
                <td className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>
                  {totalIn.toLocaleString()}
                </td>
                <td
                  className="tabular-nums"
                  style={{
                    fontWeight: 800,
                    color: totalNet < 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                  }}
                >
                  {totalNet < 0 ? `(${Math.abs(totalNet).toLocaleString()})` : totalNet.toLocaleString()}
                </td>
                <td className="col-left" colSpan={2}>
                  <span className="badge badge-warning" style={{ fontWeight: 700 }}>
                    Active ({totalPendingAmount.toLocaleString()} pending)
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Point 4: Quick Cumulative Add Popover Modal */}
      {quickAddTarget && (
        <div className="modal-backdrop" onClick={() => setQuickAddTarget(null)}>
          <div className="modal-dialog" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCumulative(quickAddTarget.date, quickAddTarget.field, quickAddVal);
              }}
            >
              <div className="modal-header">
                <h3>
                  + Add Cumulatively ({quickAddTarget.field === 'cashOut' ? 'Money Given Out' : 'Cash Received'})
                </h3>
                <button type="button" className="btn-icon-close" onClick={() => setQuickAddTarget(null)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Date: <strong>{quickAddTarget.date}</strong>
                </div>

                <div
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Current Value:</span>
                    <strong className="tabular-nums" style={{ color: 'var(--text-main)' }}>
                      KES {quickAddTarget.current.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <span>Adding (sent/received):</span>
                    <strong className="tabular-nums" style={{ color: quickAddTarget.field === 'cashOut' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      + KES {quickAddVal.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>New Total:</span>
                    <span className="tabular-nums" style={{ color: 'var(--odoo-teal)' }}>
                      KES {(quickAddTarget.current + quickAddVal).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amount to Add (KES)</label>
                  <input
                    type="number"
                    min="0"
                    autoFocus
                    className="form-input"
                    placeholder="e.g. 1200"
                    value={quickAddVal || ''}
                    onChange={(e) => setQuickAddVal(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setQuickAddTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={quickAddVal <= 0}>
                  + Add Onto Total
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Entry Modal with Cumulative Toggle */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleModalSubmit}>
              <div className="modal-header">
                <h3>Samsung Quick Entry</h3>
                <button type="button" className="btn-icon-close" onClick={() => setShowAddModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                {/* Cumulative vs Replace Mode Switch (Point 4) */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`btn ${modalMode === 'cumulative' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.775rem' }}
                    onClick={() => setModalMode('cumulative')}
                  >
                    + Add to Existing Figures
                  </button>
                  <button
                    type="button"
                    className={`btn ${modalMode === 'replace' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.775rem' }}
                    onClick={() => setModalMode('replace')}
                  >
                    = Replace Exact Value
                  </button>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Money Given Out (KES){modalMode === 'cumulative' ? ' (Amount to add)' : ''}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={modalCashOut}
                    onChange={(e) => setModalCashOut(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Expected Received Back (KES){modalMode === 'cumulative' ? ' (Amount to add)' : ' - Optional'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={modalCashIn}
                    placeholder="Leave 0 if pending return"
                    onChange={(e) => setModalCashIn(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Mode:</span>
                    <strong style={{ color: 'var(--odoo-teal)' }}>
                      {modalMode === 'cumulative' ? 'Cumulative (Adds to current figures)' : 'Direct Set'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Net Difference:</span>
                    <strong style={{ color: modalCashIn - modalCashOut < 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                      {formatExcelNet(modalCashIn - modalCashOut, true)}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'cumulative' ? '+ Add to Date' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
