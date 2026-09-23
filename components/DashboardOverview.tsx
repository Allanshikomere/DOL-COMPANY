'use client';

import React from 'react';
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
  Clock
} from 'lucide-react';
import { MonthSummary, PhoneTypeConfig, ExecutiveSummary, SamsungTrackerEntry } from '../lib/types';
import { formatKES, formatNumber } from '../lib/engine';

interface DashboardOverviewProps {
  summary: MonthSummary;
  historicalSummary: ExecutiveSummary;
  phoneTypes: PhoneTypeConfig[];
  monthName: string;
  samsungTracker?: SamsungTrackerEntry[];
  onOpenLedger: () => void;
  onOpenReconciliation: () => void;
  onOpenSamsung?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  historicalSummary,
  phoneTypes,
  monthName,
  samsungTracker = [],
  onOpenLedger,
  onOpenReconciliation,
  onOpenSamsung,
}) => {
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

        {/* Samsung Financing & Sales Tracker Overview Card */}
        <div className="ledger-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Samsung Sales Channel & Quick Float</h3>
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

      </div>
    </div>
  );
};
