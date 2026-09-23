'use client';

import React from 'react';
import {
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  DollarSign
} from 'lucide-react';
import { MonthSummary, PhoneTypeConfig, CalculatedDay, SamsungTrackerEntry } from '../lib/types';
import { formatKES, formatNumber } from '../lib/engine';

interface ReconciliationPanelProps {
  summary: MonthSummary;
  phoneTypes: PhoneTypeConfig[];
  calculatedDays: CalculatedDay[];
  samsungTracker?: SamsungTrackerEntry[];
  onClose: () => void;
}

export const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({
  summary,
  phoneTypes,
  calculatedDays,
  samsungTracker = [],
  onClose,
}) => {
  const samsungOut = samsungTracker.reduce((acc, e) => acc + (e.cashOut || 0), 0);
  const samsungIn = samsungTracker.reduce((acc, e) => acc + (e.cashIn || 0), 0);
  const samsungPending = Math.max(0, samsungOut - samsungIn);
  const totalAssetsWithSamsung = summary.floatOnceReconciled + samsungPending;
  const typeA = phoneTypes.find((p) => p.id === 'type-a') || {
    id: 'type-a',
    cost: 3700,
    returnCash: 3800,
  };
  const typeB = phoneTypes.find((p) => p.id === 'type-b') || {
    id: 'type-b',
    cost: 3570,
    returnCash: 3800,
  };
  const typeC = phoneTypes.find((p) => p.id === 'type-c') || {
    id: 'type-c',
    cost: 3600,
    returnCash: 3700,
  };

  const latestDay = calculatedDays[calculatedDays.length - 1];
  const unrecA = latestDay?.unreconciledByType['type-a'] || 0;
  const unrecB = latestDay?.unreconciledByType['type-b'] || 0;
  const unrecC = latestDay?.unreconciledByType['type-c'] || 0;

  // Filter days that still have cash owed (Column AD > 0)
  const daysWithOwedCash = calculatedDays.filter((d) => d.cashStillOwedFromDate > 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 840 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock color="var(--accent-amber)" size={22} />
            <div>
              <h3>Reconciliation & Float Recovery Simulation</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tracking open inventory, expected cash returns, and float restoration
              </p>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Top KPI Cards for Stock vs Return */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div
              style={{
                background: 'var(--bg-card-hover)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Total Phones Out
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                {summary.outstandingPhones} Units
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Awaiting company reconciliation
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card-hover)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Cost Locked in Stock
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatKES(summary.outstandingValueAtCost)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Capital currently deployed in open units
              </div>
            </div>

            <div
              style={{
                background: 'var(--accent-blue-dim)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Gross Cash Due Back
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--odoo-teal)' }}>
                {formatKES(summary.outstandingCashToCome)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Paid at 3,800 per unit upon return
              </div>
            </div>
          </div>

          {/* Breakdown by Phone Model */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Open Inventory Breakdown by Model
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}
            >
              {/* Type A */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Type A (128GB)</strong>
                  <span className="badge badge-info">{unrecA} units</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Cost: {formatKES(unrecA * typeA.cost)} ({formatKES(typeA.cost)}/ea)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--odoo-teal)', fontWeight: 600 }}>
                  Return: {formatKES(unrecA * typeA.returnCash)} ({formatKES(typeA.returnCash)}/ea)
                </div>
              </div>

              {/* Type B */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Type B (64GB)</strong>
                  <span className="badge badge-purple">{unrecB} units</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Cost: {formatKES(unrecB * typeB.cost)} ({formatKES(typeB.cost)}/ea)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  Return: {formatKES(unrecB * typeB.returnCash)} (incl. 130 spread)
                </div>
              </div>

              {/* Type C */}
              <div
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Type C (Pop 20)</strong>
                  <span className="badge badge-neutral">{unrecC} units</span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Cost: {formatKES(unrecC * typeC.cost)} ({formatKES(typeC.cost)}/ea)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  Return: {formatKES(unrecC * typeC.returnCash)}
                </div>
              </div>
            </div>
          </div>

          {/* Float Recovery Simulation Bridge */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 78, 59, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 color="var(--accent-emerald)" size={18} />
              <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                Float Restoration Bridge:
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '0.75rem',
                textAlign: 'center',
                padding: '0.75rem 0',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Cash in Hand</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {formatKES(summary.closingFloat)}
                </div>
              </div>

              <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.2rem' }}>
                +
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Principal Cost Recovered</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {formatKES(summary.outstandingValueAtCost)}
                </div>
              </div>

              {samsungPending > 0 && (
                <>
                  <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.2rem' }}>
                    +
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Samsung Pending Float</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {formatKES(samsungPending)}
                    </div>
                  </div>
                </>
              )}

              <div style={{ borderLeft: '1px solid var(--border-card)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Assets When Settled</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--odoo-teal)' }}>
                  {formatKES(totalAssetsWithSamsung)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              * When the remaining {summary.outstandingPhones} phones are returned, KES {formatNumber(summary.outstandingPhones * 100)} base profit is taken as earnings, and KES {formatNumber(unrecB * 130)} moves to the 2nd account, leaving your float completely whole at {formatKES(summary.floatOnceReconciled)}.
            </div>
          </div>

          {/* FIFO Ageing Breakdown */}
          {daysWithOwedCash.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                FIFO Ageing: Cash Still Owed by Dispatch Date
              </h4>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-card)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1.5fr',
                    padding: '0.5rem 0.8rem',
                    background: 'var(--bg-card-hover)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span>DATE</span>
                  <span style={{ textAlign: 'right' }}>PHONES OUT</span>
                  <span style={{ textAlign: 'right' }}>AMOUNT OWED</span>
                  <span style={{ textAlign: 'right' }}>STATUS</span>
                </div>

                {daysWithOwedCash.map((d) => (
                  <div
                    key={d.date}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1.5fr',
                      padding: '0.6rem 0.8rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      alignItems: 'center',
                    }}
                  >
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{d.date}</span>
                    <span className="tabular-nums" style={{ textAlign: 'right' }}>{d.totalPhonesOut}</span>
                    <span className="tabular-nums" style={{ textAlign: 'right', color: 'var(--odoo-teal)', fontWeight: 700 }}>
                      {formatKES(d.cashStillOwedFromDate)}
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <span className="badge badge-warning">Awaiting return</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
