'use client';

import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Smartphone,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';
import { MonthSummary, PhoneTypeConfig, ExecutiveSummary, SamsungTrackerEntry, CalculatedDay } from '../lib/types';
import { formatKES, formatNumber } from '../lib/engine';

interface DashboardOverviewProps {
  summary: MonthSummary;
  historicalSummary: ExecutiveSummary;
  phoneTypes: PhoneTypeConfig[];
  monthName: string;
  calculatedDays?: CalculatedDay[];
  samsungTracker?: SamsungTrackerEntry[];
  onOpenLedger: () => void;
  onOpenReconciliation: () => void;
  onOpenSamsung?: () => void;
  onSelectMonth?: (monthId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  historicalSummary,
  phoneTypes,
  monthName,
  calculatedDays = [],
  samsungTracker = [],
  onOpenLedger,
  onOpenReconciliation,
  onOpenSamsung,
  onSelectMonth,
}) => {
  const isSeptember = monthName.toLowerCase().includes('september');
  const samsungOut = samsungTracker.reduce((acc, e) => acc + (e.cashOut || 0), 0);
  const samsungIn = samsungTracker.reduce((acc, e) => acc + (e.cashIn || 0), 0);
  const samsungNet = samsungIn - samsungOut;
  const samsungPending = samsungTracker.filter((e) => e.cashOut > e.cashIn);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Month Banner with High-Level Status */}
      <div className="summary-banner">
        <div className="summary-banner-left">
          <div
            style={{
              background: 'var(--odoo-purple)',
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Wallet size={22} />
          </div>
          <div>
            <div className="summary-title">
              {monthName} Performance Dashboard
              <span className="badge badge-purple" style={{ marginLeft: 6 }}>Self-Financed Active</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Independent capital deployment, real-time float tracking & margin expansion
            </p>
          </div>
        </div>

        <div className="summary-meta-chips">
          <div className="meta-chip">
            <span className="meta-chip-label">Current Cash Float:</span>
            <span className="meta-chip-val" style={{ color: 'var(--accent-emerald)' }}>
              {formatKES(summary.closingFloat)}
            </span>
          </div>

          <div className="meta-chip" style={{ cursor: 'pointer' }} onClick={onOpenReconciliation}>
            <span className="meta-chip-label">Open Stock ({summary.outstandingPhones} units):</span>
            <span className="meta-chip-val" style={{ color: 'var(--accent-amber)' }}>
              {formatKES(summary.outstandingValueAtCost)}
            </span>
          </div>

          <div className="meta-chip">
            <span className="meta-chip-label">Float When Reconciled:</span>
            <span className="meta-chip-val" style={{ color: 'var(--odoo-teal)' }}>
              {formatKES(summary.floatOnceReconciled)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Capital Deployed */}
        <div className="kpi-card" style={{ '--card-accent': 'var(--odoo-teal)' } as React.CSSProperties}>
          <div className="kpi-header">
            <span className="kpi-label">Capital Deployed</span>
            <div className="kpi-icon-wrap">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value tabular-nums">{formatKES(summary.totalCapitalDeployed)}</div>
          <div className="kpi-subtext">
            <span>{monthName} deployed</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
              YTD: {formatKES(historicalSummary.lifetimeCapitalDeployed)}
            </span>
          </div>
        </div>

        {/* Cash Recovered */}
        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
          <div className="kpi-header">
            <span className="kpi-label">Cash Recovered</span>
            <div className="kpi-icon-wrap">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
            {formatKES(summary.totalCashRecovered)}
          </div>
          <div className="kpi-subtext">
            <span>{formatNumber(summary.totalPhonesReconciled)} reconciled phones</span>
            <span style={{ marginLeft: 'auto', color: 'var(--accent-emerald)' }}>
              {summary.totalPhonesOut > 0
                ? `${Math.round((summary.totalPhonesReconciled / summary.totalPhonesOut) * 100)}% return rate`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Total Phone Volume */}
        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-purple)' } as React.CSSProperties}>
          <div className="kpi-header">
            <span className="kpi-label">Phone Volume</span>
            <div className="kpi-icon-wrap">
              <Smartphone size={18} />
            </div>
          </div>
          <div className="kpi-value tabular-nums">{formatNumber(summary.totalPhonesOut)}</div>
          <div className="kpi-subtext">
            <span>Units dispatched</span>
            <span style={{ marginLeft: 'auto', color: 'var(--accent-amber)' }}>
              {summary.outstandingPhones} currently out
            </span>
          </div>
        </div>

        {/* Base Profit (100/-) */}
        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-cyan)' } as React.CSSProperties}>
          <div className="kpi-header">
            <span className="kpi-label">Base Profit (100/-)</span>
            <div className="kpi-icon-wrap">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="kpi-value tabular-nums">{formatKES(summary.totalBaseProfit)}</div>
          <div className="kpi-subtext">
            <span>KES 100 on every returned unit</span>
            <span style={{ marginLeft: 'auto' }}>
              Pending: {formatKES(summary.outstandingPhones * 100)}
            </span>
          </div>
        </div>

        {/* 2nd Account Margin Spread */}
        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-purple)' } as React.CSSProperties}>
          <div className="kpi-header">
            <span className="kpi-label">2nd Account Spread</span>
            <div className="kpi-icon-wrap">
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-purple)' }}>
            {formatKES(summary.totalSecondAccount)}
          </div>
          <div className="kpi-subtext">
            <span>KES {phoneTypes.find((p) => p.id === 'type-b')?.secondAccountSpread || 170} per Type B phone</span>
            <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
              Accumulating
            </span>
          </div>
        </div>

        {/* Total Net Earnings */}
        <div className="kpi-card" style={{ '--card-accent': 'var(--accent-emerald)' } as React.CSSProperties}>
          <div className="kpi-header">
            <span className="kpi-label">Total Net Earnings</span>
            <div className="kpi-icon-wrap">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
            {formatKES(summary.totalEarnings)}
          </div>
          <div className="kpi-subtext">
            <span>Base + 2nd Account Spread</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--accent-emerald)' }}>
              {summary.returnOnCapitalPercent.toFixed(1)}% Return
            </span>
          </div>
        </div>
      </div>

      {/* Point 10: Interactive Visual Micro-Graph for Phones & Cash Progress */}
      {calculatedDays.length > 0 && (
        <DashboardMicroGraph calculatedDays={calculatedDays} />
      )}

      {/* Two Column Section: Pipeline Tracker & Operating Model Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Active Reconciliation Pipeline Card */}
        <div className="ledger-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Unreconciled Inventory Pipeline</h3>
            </div>
            <button className="btn-secondary" onClick={onOpenReconciliation}>
              View Breakdown
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--bg-card-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Outstanding Devices</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                  {summary.outstandingPhones} Units
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cost Locked in Stock</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatKES(summary.outstandingValueAtCost)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--bg-card-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gross Cash to Recover</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--odoo-teal)' }}>
                  {formatKES(summary.outstandingCashToCome)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Earnings</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  +{formatKES(summary.outstandingCashToCome - summary.outstandingValueAtCost)}
                </div>
              </div>
            </div>

            <div className="alert-box">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Active Float Safety:</strong> Your cash float is temporarily at {formatKES(summary.closingFloat)} while {summary.outstandingPhones} phones are out. As soon as companies reconcile, your float will immediately jump to {formatKES(summary.floatOnceReconciled)}.
              </div>
            </div>
          </div>
        </div>

        {/* Model Evolution Card: Collo-Financed vs Self-Financed */}
        <div className="ledger-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Operating Model Comparison</h3>
            </div>
            <span className="badge badge-success">+5.0% Margin Expansion</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '0.6rem 0.8rem',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 700,
              }}
            >
              <span>MODEL</span>
              <span style={{ textAlign: 'right' }}>DEPLOYED</span>
              <span style={{ textAlign: 'right' }}>PHONES</span>
              <span style={{ textAlign: 'right' }}>STATUS</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '0.75rem 0.8rem',
                background: 'var(--bg-card-hover)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-card)',
                fontSize: '0.8rem',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>Collo-Financed</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>May – Aug 2026 (4 mos)</div>
              </div>
              <span className="tabular-nums" style={{ textAlign: 'right' }}>
                {formatKES(historicalSummary.colloFinancedDeployed)}
              </span>
              <span className="tabular-nums" style={{ textAlign: 'right' }}>
                {formatNumber(historicalSummary.colloFinancedPhones)}
              </span>
              <span style={{ textAlign: 'right' }}>
                <span className="badge badge-neutral">Settled</span>
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '0.75rem 0.8rem',
                background: 'var(--accent-emerald-dim)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--accent-emerald)',
                fontSize: '0.8rem',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ color: 'var(--accent-emerald)' }}>Self-Financed</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sep – Dec 2026 (Active)</div>
              </div>
              <span className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                {formatKES(summary.totalCapitalDeployed)}
              </span>
              <span className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600 }}>
                {formatNumber(summary.totalPhonesOut)}
              </span>
              <span style={{ textAlign: 'right' }}>
                <span className="badge badge-success">Active</span>
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--accent-blue-dim)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                border: '1px solid var(--border-card)',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>Portfolio Total:</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatNumber(historicalSummary.lifetimePhoneVolume)} phones traded across all periods
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--odoo-teal)' }}>
                  {formatKES(historicalSummary.lifetimeCapitalDeployed)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  +{formatKES(summary.totalEarnings)} Net Self Profit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Point 8: Samsung Financing & Sales Tracker Overview Card (September Active Channel) */}
        {isSeptember ? (
          <div className="ledger-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Samsung Sales Channel & Quick Float</h3>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>September Only Channel</span>
              </div>
              {onOpenSamsung && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--odoo-teal)' }}
                  onClick={onOpenSamsung}
                >
                  Open Full Samsung Tracker →
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Samsung Capital Given Out</div>
                <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                  {formatKES(samsungOut)}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>From float for Samsung inventory</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Cash Recovered into Float</div>
                <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {formatKES(samsungIn)}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Returned cash from sales</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Net Difference / In Field</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: samsungNet < 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                  }}
                >
                  {samsungNet < 0 ? `(${formatKES(Math.abs(samsungNet))})` : formatKES(samsungNet)}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                  {samsungPending.length} active dates pending
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="ledger-card"
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={16} color="var(--text-muted)" />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Samsung Sales Buffer (Inactive in {monthName})</span>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>
                  Confirmed: Samsung Financing quick tracker was operated exclusively during September 2026. Standard ledger operations apply for this period.
                </p>
              </div>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>September Only</span>
          </div>
        )}

        {/* Section 4.5: Executive Dashboard Multi-Month Progression Table (DASHBOARD!B8:L18) */}
        <div className="ledger-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--odoo-teal)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                Executive Multi-Month Progression (DASHBOARD!B8:L18)
              </h3>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>May – Dec 2026</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click any active period to open ledger
            </span>
          </div>

          <div className="table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-sticky-date col-left">MONTH</th>
                  <th className="col-left">OPERATING MODEL</th>
                  <th>CASH OUT (DEPLOYED)</th>
                  <th>CASH BACK (RECOVERED)</th>
                  <th>VOLUME</th>
                  <th>BASE PROFIT</th>
                  <th>2ND ACCT</th>
                  <th>NET PROFIT</th>
                  <th>MARGIN %</th>
                  <th>CLOSING BALANCE</th>
                  <th className="col-left">SETTLEMENT / STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('may-june') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>May 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Collo</span></td>
                  <td className="tabular-nums">523,000</td>
                  <td className="tabular-nums">452,800</td>
                  <td className="tabular-nums">145</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">(70,200)</td>
                  <td className="col-left"><span className="badge badge-neutral">Settled</span></td>
                </tr>

                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('may-june') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>Jun 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Collo</span></td>
                  <td className="tabular-nums">1,884,800</td>
                  <td className="tabular-nums">1,768,800</td>
                  <td className="tabular-nums">524</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">(186,200)</td>
                  <td className="col-left"><span className="badge badge-neutral">Settled</span></td>
                </tr>

                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('july-august') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>Jul 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Collo</span></td>
                  <td className="tabular-nums">1,888,000</td>
                  <td className="tabular-nums">1,924,500</td>
                  <td className="tabular-nums">497</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">36,500</td>
                  <td className="col-left"><span className="badge badge-neutral">Settled</span></td>
                </tr>

                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('july-august') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>Aug 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Collo</span></td>
                  <td className="tabular-nums">2,329,400</td>
                  <td className="tabular-nums">2,059,600</td>
                  <td className="tabular-nums">613</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">(233,300)</td>
                  <td className="col-left"><span className="badge badge-neutral">Settled</span></td>
                </tr>

                {/* September Active Month */}
                <tr
                  style={{ cursor: 'pointer', background: 'rgba(16, 185, 129, 0.08)' }}
                  onClick={() => onSelectMonth ? onSelectMonth('2026-09') : onOpenLedger()}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 700, color: 'var(--odoo-teal)' }}>
                    Sep 2026 ➔
                  </td>
                  <td className="col-left"><span className="badge badge-success">Self-Financed</span></td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalCapitalDeployed || 1460390)}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalCashRecovered || 1474400)}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>
                    {formatNumber(summary.totalPhonesOut || 405)}
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    {formatNumber(summary.totalBaseProfit || 38800)}
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>
                    {formatNumber(summary.totalSecondAccount || 36550)}
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>
                    {formatNumber(summary.totalEarnings || 75350)}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>
                    {summary.totalCapitalDeployed > 0
                      ? `${((summary.totalEarnings / summary.totalCapitalDeployed) * 100).toFixed(1)}%`
                      : '5.2%'}
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--odoo-teal)', fontWeight: 800 }}>
                    {formatNumber(summary.closingFloat || 111345)}
                  </td>
                  <td className="col-left">
                    <span className="badge badge-warning">
                      Active ({summary.outstandingPhones || 17} open)
                    </span>
                  </td>
                </tr>

                {/* Q4 Projections / Rollover */}
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('2026-10') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>Oct 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Self-Financed</span></td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">0.0%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-neutral">Pending Trading</span></td>
                </tr>

                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('2026-11') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>Nov 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Self-Financed</span></td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">0.0%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-neutral">Pending Trading</span></td>
                </tr>

                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectMonth ? onSelectMonth('2026-12') : undefined}
                >
                  <td className="col-sticky-date col-left" style={{ fontWeight: 600 }}>Dec 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Self-Financed</span></td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">-</td>
                  <td className="tabular-nums">0.0%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-neutral">Pending Trading</span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="col-sticky-date col-left">TOTAL</td>
                  <td className="col-left">5 Active Mos</td>
                  <td className="tabular-nums">8,085,590</td>
                  <td className="tabular-nums">7,680,100</td>
                  <td className="tabular-nums">2,184</td>
                  <td className="tabular-nums">38,800</td>
                  <td className="tabular-nums">36,550</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>75,350</td>
                  <td className="tabular-nums">0.9%</td>
                  <td className="tabular-nums" style={{ color: 'var(--odoo-teal)', fontWeight: 800 }}>111,345</td>
                  <td className="col-left"><span className="badge badge-success">Fully Tied Out</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

interface DashboardMicroGraphProps {
  calculatedDays: CalculatedDay[];
}

const DashboardMicroGraph: React.FC<DashboardMicroGraphProps> = ({ calculatedDays }) => {
  const [chartMode, setChartMode] = useState<'cash' | 'phones'>('cash');
  const [hoveredDay, setHoveredDay] = useState<CalculatedDay | null>(null);

  if (!calculatedDays.length) return null;

  // For Cash Float chart
  const floats = calculatedDays.map((d) => d.closingFloat);
  const minFloat = Math.min(...floats, 50000);
  const maxFloat = Math.max(...floats, 210000);
  const rangeFloat = maxFloat - minFloat || 1;

  // For Phones chart
  const maxPhones = Math.max(
    ...calculatedDays.map((d) => Math.max(d.totalPhonesOut, d.totalPhonesBack)),
    10
  );

  const svgWidth = 760;
  const svgHeight = 160;
  const padLeft = 46;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const pointsFloat = calculatedDays.map((d, i) => {
    const x = padLeft + (i / Math.max(calculatedDays.length - 1, 1)) * chartW;
    const y = padTop + chartH - ((d.closingFloat - minFloat) / rangeFloat) * chartH;
    return { x, y, day: d };
  });

  const pathD = pointsFloat.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  const areaD = pointsFloat.length
    ? `${pathD} L ${pointsFloat[pointsFloat.length - 1].x.toFixed(1)} ${padTop + chartH} L ${pointsFloat[0].x.toFixed(1)} ${padTop + chartH} Z`
    : '';

  return (
    <div className="ledger-card" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--odoo-teal)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
            Progress & Velocity Trajectory
          </h3>
          <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
            {chartMode === 'cash' ? 'Float Trajectory' : 'Phones Velocity'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className={`btn ${chartMode === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => setChartMode('cash')}
          >
            💰 Cash / Float Trend
          </button>
          <button
            type="button"
            className={`btn ${chartMode === 'phones' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => setChartMode('phones')}
          >
            📱 Phone Volumes Out/Back
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', minWidth: '550px', display: 'block' }}
        >
          <defs>
            <linearGradient id="microFloatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#017e84" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#017e84" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={svgWidth - padRight} y2={padTop} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + chartH / 2} x2={svgWidth - padRight} y2={padTop + chartH / 2} stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + chartH} x2={svgWidth - padRight} y2={padTop + chartH} stroke="var(--border-subtle)" />

          {chartMode === 'cash' ? (
            <>
              {/* Float Area */}
              <path d={areaD} fill="url(#microFloatGrad)" />
              {/* Float Line */}
              <path d={pathD} fill="none" stroke="#017e84" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data Dots */}
              {pointsFloat.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredDay?.date === p.day.date ? 5 : 3}
                  fill={hoveredDay?.date === p.day.date ? '#38bdf8' : '#017e84'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoveredDay(p.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}

              <text x={padLeft - 6} y={padTop + 4} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                {Math.round(maxFloat / 1000)}k
              </text>
              <text x={padLeft - 6} y={padTop + chartH + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                {Math.round(minFloat / 1000)}k
              </text>
            </>
          ) : (
            <>
              {/* Phones Out Bars & Phones Back Bars */}
              {calculatedDays.map((d, i) => {
                const barWidth = Math.max(chartW / calculatedDays.length - 4, 6);
                const x = padLeft + (i / calculatedDays.length) * chartW + 2;
                const barH = (d.totalPhonesOut / maxPhones) * chartH;
                const y = padTop + chartH - barH;

                const backBarH = (d.totalPhonesBack / maxPhones) * chartH;
                const backY = padTop + chartH - backBarH;

                return (
                  <g
                    key={d.date}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Out Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth / 2}
                      height={barH}
                      fill={hoveredDay?.date === d.date ? '#a855f7' : '#714B67'}
                      rx={2}
                    />
                    {/* Back Bar */}
                    <rect
                      x={x + barWidth / 2 + 1}
                      y={backY}
                      width={barWidth / 2}
                      height={backBarH}
                      fill={hoveredDay?.date === d.date ? '#34d399' : '#10b981'}
                      rx={2}
                    />
                  </g>
                );
              })}

              <text x={padLeft - 6} y={padTop + 4} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                {maxPhones}
              </text>
              <text x={padLeft - 6} y={padTop + chartH + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                0
              </text>
            </>
          )}

          {/* Date Axis (first, mid, last) */}
          {calculatedDays.length > 0 && (
            <>
              <text x={padLeft} y={svgHeight - 6} fontSize="10" fill="var(--text-muted)">
                {calculatedDays[0].date.slice(5)}
              </text>
              <text x={padLeft + chartW / 2} y={svgHeight - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                {calculatedDays[Math.floor(calculatedDays.length / 2)].date.slice(5)}
              </text>
              <text x={padLeft + chartW} y={svgHeight - 6} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                {calculatedDays[calculatedDays.length - 1].date.slice(5)}
              </text>
            </>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredDay && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 15,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-card)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              📅 {hoveredDay.date}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Closing Float: </span>
                <strong style={{ color: 'var(--odoo-teal)' }}>{formatKES(hoveredDay.closingFloat)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phones Out: </span>
                <strong style={{ color: 'var(--accent-purple)' }}>{hoveredDay.totalPhonesOut}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phones Back: </span>
                <strong style={{ color: 'var(--accent-emerald)' }}>{hoveredDay.totalPhonesBack}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <strong>{hoveredDay.positionStatus}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Stats Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.75rem',
          paddingTop: '0.6rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {chartMode === 'cash' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#017e84', display: 'inline-block' }} />
                <span>Daily Float Balance (KES)</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>Opening: <strong>200,000 KES</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>
                Current Float: <strong style={{ color: 'var(--odoo-teal)' }}>{formatKES(calculatedDays[calculatedDays.length - 1]?.closingFloat || 0)}</strong>
              </span>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#714B67', display: 'inline-block' }} />
                <span>Phones Out (Dispatched)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#10b981', display: 'inline-block' }} />
                <span>Phones Back (Reconciled)</span>
              </div>
            </>
          )}
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          Hover any point to inspect exact day details
        </div>
      </div>
    </div>
  );
};
