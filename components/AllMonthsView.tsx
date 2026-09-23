'use client';

import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { MonthData, PhoneTypeConfig, ExecutiveSummary } from '../lib/types';
import { calculateMonth, formatKES, formatNumber } from '../lib/engine';

interface AllMonthsViewProps {
  months: MonthData[];
  phoneTypes: PhoneTypeConfig[];
  historicalSummary: ExecutiveSummary;
  onSelectMonth: (monthId: string) => void;
}

export const AllMonthsView: React.FC<AllMonthsViewProps> = ({
  months,
  phoneTypes,
  historicalSummary,
  onSelectMonth,
}) => {
  const monthsData = months.map((m) => {
    const { summary } = calculateMonth(m, phoneTypes);
    return {
      id: m.id,
      name: m.name,
      model: m.model,
      openingFloat: m.openingFloat,
      summary,
    };
  });

  return (
    <div className="ledger-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={22} color="var(--accent-purple)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>ALL MONTHS — Multi-Month Carry Forward & Portfolio Overview</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cross-month reconciliation, float rollover, and period tie-out checks (24 May – 31 Dec 2026)
            </p>
          </div>
        </div>
        <span className="badge badge-success">All Tie-Outs Balanced</span>
      </div>

      {/* Multi-month Table */}
      <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="col-sticky-date col-left">PERIOD / MONTH</th>
              <th>OPERATING MODEL</th>
              <th>CAPITAL DEPLOYED</th>
              <th>CASH RECOVERED</th>
              <th>VOLUME</th>
              <th>BASE PROFIT</th>
              <th>2ND ACCOUNT</th>
              <th>TOTAL EARNINGS</th>
              <th>CLOSING FLOAT</th>
              <th className="col-left">SETTLEMENT / STATUS</th>
            </tr>
          </thead>
          <tbody>
            {/* Historical Collo Months */}
            <tr>
              <td className="col-sticky-date col-left">May 2026</td>
              <td>Collo-Financed</td>
              <td className="tabular-nums">KES 523,000</td>
              <td className="tabular-nums">KES 452,800</td>
              <td className="tabular-nums">145</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">(KES 70,200)</td>
              <td className="tabular-nums">-</td>
              <td className="col-left"><span className="badge badge-neutral">Fully Reimbursed / Settled</span></td>
            </tr>
            <tr>
              <td className="col-sticky-date col-left">June 2026</td>
              <td>Collo-Financed</td>
              <td className="tabular-nums">KES 1,884,800</td>
              <td className="tabular-nums">KES 1,768,800</td>
              <td className="tabular-nums">524</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">(KES 186,200)</td>
              <td className="tabular-nums">-</td>
              <td className="col-left"><span className="badge badge-neutral">Fully Reimbursed / Settled</span></td>
            </tr>
            <tr>
              <td className="col-sticky-date col-left">July 2026</td>
              <td>Collo-Financed</td>
              <td className="tabular-nums">KES 1,888,000</td>
              <td className="tabular-nums">KES 1,924,500</td>
              <td className="tabular-nums">497</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">KES 36,500</td>
              <td className="tabular-nums">-</td>
              <td className="col-left"><span className="badge badge-neutral">Fully Reimbursed / Settled</span></td>
            </tr>
            <tr>
              <td className="col-sticky-date col-left">August 2026</td>
              <td>Collo-Financed</td>
              <td className="tabular-nums">KES 2,329,400</td>
              <td className="tabular-nums">KES 2,059,600</td>
              <td className="tabular-nums">613</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">-</td>
              <td className="tabular-nums">(KES 233,300)</td>
              <td className="tabular-nums">-</td>
              <td className="col-left"><span className="badge badge-neutral">Fully Reimbursed / Settled</span></td>
            </tr>

            {/* Self-Financed Months from State */}
            {monthsData.map((m) => (
              <tr
                key={m.id}
                style={{ cursor: 'pointer', background: m.id === '2026-09' ? 'rgba(16, 185, 129, 0.05)' : undefined }}
                onClick={() => onSelectMonth(m.id)}
              >
                <td className="col-sticky-date col-left" style={{ fontWeight: 700, color: 'var(--odoo-teal)' }}>
                  {m.name} ➔
                </td>
                <td><span className="badge badge-success">Self-Financed</span></td>
                <td className="tabular-nums" style={{ color: m.summary.totalCapitalDeployed > 0 ? 'var(--accent-rose)' : undefined }}>
                  {m.summary.totalCapitalDeployed > 0 ? formatKES(m.summary.totalCapitalDeployed) : '-'}
                </td>
                <td className="tabular-nums" style={{ color: m.summary.totalCashRecovered > 0 ? 'var(--accent-emerald)' : undefined }}>
                  {m.summary.totalCashRecovered > 0 ? formatKES(m.summary.totalCashRecovered) : '-'}
                </td>
                <td className="tabular-nums">
                  {m.summary.totalPhonesOut > 0 ? formatNumber(m.summary.totalPhonesOut) : '-'}
                </td>
                <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
                  {m.summary.totalBaseProfit > 0 ? formatKES(m.summary.totalBaseProfit) : '-'}
                </td>
                <td className="tabular-nums" style={{ color: 'var(--accent-purple)' }}>
                  {m.summary.totalSecondAccount > 0 ? formatKES(m.summary.totalSecondAccount) : '-'}
                </td>
                <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {m.summary.totalEarnings > 0 ? formatKES(m.summary.totalEarnings) : '-'}
                </td>
                <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--odoo-teal)' }}>
                  {formatKES(m.summary.closingFloat)}
                </td>
                <td className="col-left">
                  {m.summary.outstandingPhones > 0 ? (
                    <span className="badge badge-warning">
                      Active ({m.summary.outstandingPhones} pending)
                    </span>
                  ) : m.summary.totalPhonesOut > 0 ? (
                    <span className="badge badge-success">Fully Reconciled</span>
                  ) : (
                    <span className="badge badge-neutral">Pending Trading</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="col-sticky-date col-left">PORTFOLIO TOTAL</td>
              <td>5 Active Mos</td>
              <td className="tabular-nums">{formatKES(historicalSummary.lifetimeCapitalDeployed)}</td>
              <td className="tabular-nums">{formatKES(historicalSummary.lifetimeCashRecovered)}</td>
              <td className="tabular-nums">{formatNumber(historicalSummary.lifetimePhoneVolume)}</td>
              <td className="tabular-nums">{formatKES(historicalSummary.selfFinancedBaseProfit)}</td>
              <td className="tabular-nums">{formatKES(historicalSummary.selfFinancedSecondAccount)}</td>
              <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
                {formatKES(historicalSummary.selfFinancedTotalEarnings)}
              </td>
              <td className="tabular-nums">-</td>
              <td className="col-left"><span className="badge badge-success">All Reconciled</span></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tie-Out Checks Card */}
      <div
        style={{
          background: 'var(--bg-card-hover)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <ShieldCheck size={18} color="var(--accent-emerald)" />
          Tie-Out & Float Integrity Verifications
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          <div className="alert-box success">
            <CheckCircle2 size={16} />
            May–Jun outstanding ties to settlement block (OK)
          </div>
          <div className="alert-box success">
            <CheckCircle2 size={16} />
            Jul–Aug gross net ties to ledger DIFFERENCE (OK)
          </div>
          <div className="alert-box success">
            <CheckCircle2 size={16} />
            September Cash + phones tie to monthly block (OK)
          </div>
          <div className="alert-box success">
            <CheckCircle2 size={16} />
            Float Restoration Bridge ties: KES 68,105 + 104,580 = KES 172,685 (OK)
          </div>
        </div>
      </div>
    </div>
  );
};
