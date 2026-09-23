'use client';

import React, { useState } from 'react';
import { ShieldCheck, History, CheckCircle, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { HISTORICAL_COLLO_PERIODS } from '../lib/initialData';
import { COLLO_MAY_JUNE_DAYS, COLLO_JULY_AUGUST_DAYS, ColloDailyRow } from '../lib/colloData';
import { formatKES, formatNumber } from '../lib/engine';

export const ColloLedgerTable: React.FC = () => {
  const [activePeriodIdx, setActivePeriodIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const period = HISTORICAL_COLLO_PERIODS[activePeriodIdx];
  const dailyRows: ColloDailyRow[] =
    activePeriodIdx === 0 ? COLLO_MAY_JUNE_DAYS : COLLO_JULY_AUGUST_DAYS;

  const filteredRows = dailyRows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return r.date.toLowerCase().includes(q) || r.position.toLowerCase().includes(q);
  });

  return (
    <div className="ledger-card">
      <div className="ledger-toolbar">
        <div className="toolbar-title-wrap">
          <History size={18} color="var(--accent-purple)" />
          <span className="toolbar-title">
            Historical Collo-Financed Ledger & Daily Settlements
          </span>
          <span className="badge badge-neutral">Archived / Fully Reconciled</span>
        </div>

        <div className="toolbar-controls">
          <div className="period-tabs">
            {HISTORICAL_COLLO_PERIODS.map((p, idx) => (
              <button
                key={p.period}
                className={`period-pill-btn ${activePeriodIdx === idx ? 'active' : ''}`}
                onClick={() => setActivePeriodIdx(idx)}
              >
                {p.period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* KPI Grid for Selected Collo Period */}
        <div className="kpi-grid">
          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-blue)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Cash from Collo</span>
              <div className="kpi-icon-wrap">
                <ArrowDownLeft size={18} />
              </div>
            </div>
            <div className="kpi-value tabular-nums">{formatKES(period.cashReceivedFromCollo)}</div>
            <div className="kpi-subtext">Operating capital provided</div>
          </div>

          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Phones Sold Value</span>
              <div className="kpi-icon-wrap">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="kpi-value tabular-nums">{formatKES(period.phonesSoldValue)}</div>
            <div className="kpi-subtext">Gross retail sales value</div>
          </div>

          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-amber)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Net Difference (Owed)</span>
              <div className="kpi-icon-wrap">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-amber)' }}>
              {formatKES(period.netDifference)}
            </div>
            <div className="kpi-subtext">Collo owed {formatKES(Math.abs(period.netDifference))}</div>
          </div>

          <div className="kpi-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
            <div className="kpi-header">
              <span className="kpi-label">Repaid & Settled</span>
              <div className="kpi-icon-wrap">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
              {formatKES(period.repaidAndSettled)}
            </div>
            <div className="kpi-subtext">Settlement Status: {period.status}</div>
          </div>
        </div>

        {/* Filter bar for daily rows */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              Daily Ledger Breakdown ({filteredRows.length} Days)
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
        </div>

        {/* Full Day-by-Day Historical Table */}
        <div className="table-wrapper">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="col-sticky-date col-left">DATE</th>
                <th>CASH FROM COLLO (B)</th>
                <th>VALUE OF PHONES SOLD (C)</th>
                <th>OPENING CARRY-FORWARD</th>
                <th>AVAILABLE CASH</th>
                <th>CLOSING BALANCE</th>
                <th className="col-left">POSITION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="col-sticky-date col-left">
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{row.date}</span>
                  </td>
                  <td className="tabular-nums" style={{ color: row.cashFromCollo > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {row.cashFromCollo > 0 ? formatNumber(row.cashFromCollo) : '-'}
                  </td>
                  <td className="tabular-nums" style={{ color: row.phonesSoldValue > 0 ? 'var(--odoo-teal)' : 'var(--text-muted)' }}>
                    {row.phonesSoldValue > 0 ? formatNumber(row.phonesSoldValue) : '-'}
                  </td>
                  <td className="tabular-nums">
                    {formatNumber(row.openingBalance)}
                  </td>
                  <td className="tabular-nums">
                    {formatNumber(row.available)}
                  </td>
                  <td
                    className="tabular-nums"
                    style={{
                      fontWeight: 700,
                      color: row.closingBalance < 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    }}
                  >
                    {row.closingBalance < 0 ? `(${formatNumber(Math.abs(row.closingBalance))})` : formatNumber(row.closingBalance)}
                  </td>
                  <td className="col-left">
                    {row.position.includes('Collo owes') ? (
                      <span className="badge badge-warning">{row.position}</span>
                    ) : row.position.includes('I owe Collo') ? (
                      <span className="badge badge-info">{row.position}</span>
                    ) : (
                      <span className="badge badge-neutral">{row.position || '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="col-sticky-date col-left">PERIOD TOTAL</td>
                <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>{formatKES(period.cashReceivedFromCollo)}</td>
                <td className="tabular-nums" style={{ color: 'var(--odoo-teal)' }}>{formatKES(period.phonesSoldValue)}</td>
                <td>-</td>
                <td>-</td>
                <td className="tabular-nums" style={{ color: 'var(--accent-amber)' }}>{formatKES(period.netDifference)}</td>
                <td className="col-left"><span className="badge badge-success">Settled / Closed</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
