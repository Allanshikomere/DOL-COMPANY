'use client';

import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  Search,
  BookOpen,
  Layers,
  Calculator,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DocumentationViewProps {
  onClose?: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = () => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  const handleCopyMarkdown = () => {
    fetch('/DOCUMENTATION.md')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load DOCUMENTATION.md');
        return res.text();
      })
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error('Could not copy:', err);
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ledger-card" style={{ padding: '1.5rem', maxWidth: '100%' }}>
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--odoo-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Comprehensive System Documentation & Financial Audit Ledger
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Workbook: TRACKER2 • Timeline: May 24 – Dec 31, 2026 • Currency: Kenyan Shillings (KES)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleCopyMarkdown}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copied ? 'Copied Markdown!' : 'Copy Code (.md)'}
          </button>

          <button
            className="btn btn-primary"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Printer size={14} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Navigation Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          className={`period-pill-btn ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
        >
          All Sections
        </button>
        <button
          className={`period-pill-btn ${activeSection === '1' ? 'active' : ''}`}
          onClick={() => setActiveSection('1')}
        >
          1. Executive Summary & Architecture
        </button>
        <button
          className={`period-pill-btn ${activeSection === '2' ? 'active' : ''}`}
          onClick={() => setActiveSection('2')}
        >
          2. Business Logic & Math Framework
        </button>
        <button
          className={`period-pill-btn ${activeSection === '3' ? 'active' : ''}`}
          onClick={() => setActiveSection('3')}
        >
          3. Tab Structure & Formulas
        </button>
        <button
          className={`period-pill-btn ${activeSection === '4' ? 'active' : ''}`}
          onClick={() => setActiveSection('4')}
        >
          4. Complete Numerical Data Records
        </button>
        <button
          className={`period-pill-btn ${activeSection === '5' ? 'active' : ''}`}
          onClick={() => setActiveSection('5')}
        >
          5. Daily SOP
        </button>
      </div>

      {/* Section 1: Executive Summary */}
      {(activeSection === 'all' || activeSection === '1') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)', marginBottom: '0.75rem' }}>
            1. Executive Summary & Architecture
          </h3>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            The system manages a multi-tier handset distribution, micro-financing, and sales reconciliation business across two distinct operational phases:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Phase 1: Collo-Financed Model (May 24 – Aug 31, 2026)
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>External capital from Collo</li>
                <li>Daily credit/debt tracking with running liability formulas</li>
                <li>Separation of Reinvested vs Settled repayments</li>
                <li>Tabs: <code>MAY - JUNE</code>, <code>JULY-AUGUST</code></li>
              </ul>
            </div>

            <div
              style={{
                background: 'var(--accent-emerald-dim)',
                border: '1px solid var(--accent-emerald)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                Phase 2: Self-Financed Float Model (Sep 1 – Dec 31, 2026)
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>Closed-loop self-sustaining float with initial capital: <strong>KES 200,000</strong></li>
                <li>Multi-device margin split (Type A, Type B, Type C Pop 20, Custom brands)</li>
                <li>Dedicated Samsung Sales Buffer sub-ledger (September only)</li>
                <li>Tabs: <code>SEPTEMBER</code>, <code>OCTOBER</code>, <code>NOVEMBER</code>, <code>DECEMBER</code></li>
              </ul>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-left">TAB NAME</th>
                  <th className="col-left">OPERATING SCOPE</th>
                  <th className="col-left">CATEGORY</th>
                  <th className="col-left">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-left"><code>DASHBOARD</code></td>
                  <td className="col-left">Portfolio-wide</td>
                  <td className="col-left"><span className="badge badge-info">Executive Reporting</span></td>
                  <td className="col-left">High-level KPI cards, monthly progression table, model comparison, and Samsung recovery metrics.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>SEPTEMBER</code></td>
                  <td className="col-left">Sep 1–30, 2026</td>
                  <td className="col-left"><span className="badge badge-success">Daily Trading Ledger</span></td>
                  <td className="col-left">30-day active float engine, 3 handset types, 2nd account tracking, reconciliation checks, and Samsung sub-ledger.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>OCTOBER</code></td>
                  <td className="col-left">Oct 1–31, 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Daily Trading Ledger</span></td>
                  <td className="col-left">Pre-built template linking closing float (KES 111,345) and unreconciled stock (17 units / KES 61,340) forward from September.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>NOVEMBER</code></td>
                  <td className="col-left">Nov 1–30, 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Daily Trading Ledger</span></td>
                  <td className="col-left">Pre-built template linking forward from October.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>DECEMBER</code></td>
                  <td className="col-left">Dec 1–31, 2026</td>
                  <td className="col-left"><span className="badge badge-neutral">Daily Trading Ledger</span></td>
                  <td className="col-left">Pre-built template linking forward from November and year-end reconciliation.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>MAY - JUNE</code></td>
                  <td className="col-left">May 24 – Jun 30, 2026</td>
                  <td className="col-left"><span className="badge badge-purple">External Debt Ledger</span></td>
                  <td className="col-left">Capital injections from Collo vs value of phones sold; tracks in-period repayments and full settlement.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>JULY-AUGUST</code></td>
                  <td className="col-left">Jul 4 – Aug 31, 2026</td>
                  <td className="col-left"><span className="badge badge-purple">External Debt Ledger</span></td>
                  <td className="col-left">Collo ledger continuation; tracks reinvested vs settled cash and post-period clearout.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>ALL MONTHS</code></td>
                  <td className="col-left">May 24 – Dec 31, 2026</td>
                  <td className="col-left"><span className="badge badge-info">Master Consolidation</span></td>
                  <td className="col-left">222-day continuous ledger, debt tie-out checks, audit holdback tracker, and period rollups.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>Samsung Tracker</code></td>
                  <td className="col-left">Interactive</td>
                  <td className="col-left"><span className="badge badge-warning">Visual Canvas App</span></td>
                  <td className="col-left">Dynamic interactive frontend workspace backed directly by SEPTEMBER!A1:AM68.</td>
                </tr>
                <tr>
                  <td className="col-left"><code>Sheet1</code></td>
                  <td className="col-left">Reference</td>
                  <td className="col-left"><span className="badge badge-neutral">Roadmap & Notes</span></td>
                  <td className="col-left">Enhancement checklist, UX suggestions, and number-formatting guides.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 2: Business Logic & Math */}
      {(activeSection === 'all' || activeSection === '2') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)', marginBottom: '0.75rem' }}>
            2. Business Logic & Mathematical Framework
          </h3>
          
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '1rem', marginBottom: '0.5rem' }}>
            2.1 Phase 1: Collo-Financed Operations (May – August)
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            External capital provided by financing partner Collo:
            <br />
            • <strong>Capital Inflow:</strong> Cash received from Collo.
            <br />
            • <strong>Capital Outflow:</strong> Phones issued for sale.
            <br />
            • <strong>Running Debt Formula:</strong> <code>Closing Balance = Opening Balance + Cash Received from Collo − Value of Phones Sold</code>
            <br />
            • <strong>Repayment Separation:</strong> Reinvested repayments are logged for visibility but do not reduce liability. Settled repayments formally clear the debt to KES 0.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
            2.2 Phase 2: Self-Financed Float Operations (September – December)
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Working capital float started at <strong>KES 200,000</strong> on September 1, 2026.
          </p>

          <div className="table-wrapper" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-left">DEVICE TYPE</th>
                  <th className="col-left">SPECIFICATION</th>
                  <th>DEPLOYED COST</th>
                  <th>CASH RETURNED</th>
                  <th>BASE PROFIT</th>
                  <th>2ND ACCOUNT SPREAD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-left"><strong>Type A</strong></td>
                  <td className="col-left">128GB Smartphone (Samsung A05/A06/A15)</td>
                  <td className="tabular-nums">KES 3,700</td>
                  <td className="tabular-nums">KES 3,800</td>
                  <td className="tabular-nums">KES 100</td>
                  <td className="tabular-nums">KES 0</td>
                </tr>
                <tr>
                  <td className="col-left"><strong>Type B</strong></td>
                  <td className="col-left">64GB Smartphone (Samsung A05/A06)</td>
                  <td className="tabular-nums">KES 3,530 / 3,570</td>
                  <td className="tabular-nums">KES 3,800</td>
                  <td className="tabular-nums">KES 100</td>
                  <td className="tabular-nums">KES 170 (or 130)</td>
                </tr>
                <tr>
                  <td className="col-left"><strong>Type C</strong></td>
                  <td className="col-left">Pop 20 64GB</td>
                  <td className="tabular-nums">KES 3,600</td>
                  <td className="tabular-nums">KES 3,700</td>
                  <td className="tabular-nums">KES 100</td>
                  <td className="tabular-nums">KES 0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="alert-box success">
            <ShieldCheck size={18} />
            <div>
              <strong>Float Neutrality & Asset Protection Principle:</strong>
              <div style={{ marginTop: '0.2rem', fontSize: '0.8rem' }}>
                <code>Total Capital Preserved = Closing Cash Float + Open Stock at Cost</code>.
                When all units reconcile, cash returns exactly to the initial float (less profit extracted).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Tab Structure & Formulas */}
      {(activeSection === 'all' || activeSection === '3') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)', marginBottom: '0.75rem' }}>
            3. Tab Structure & Formulas
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Formulas implemented in the engine exactly matching spreadsheet cell references:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Opening Used (L):</strong> <code>=IF(B3="", K3, B3)</code>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Cash Given Out (N):</strong> <code>=D3*$AI$3 + F3*$AI$7 + H3*$AI$9</code>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Cash Left in Hand (O):</strong> <code>=L3 + M3 - N3</code> (Rows 18–32 with Samsung: <code>=L18 + M18 - N18 - B39</code>)
            </div>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Cash Received Back (P):</strong> <code>=(E3+G3)*$AI$4 + I3*$AL$4</code>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Base Profit Taken (Q):</strong> <code>=V3*$AI$5</code> (Total Reconciled Units × 100)
            </div>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Closing Float (R):</strong> <code>=O18 + P18 - Q18 - AE18 + C39</code>
            </div>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <strong>Summary Block Checks:</strong>
              <div style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>
                • <strong>Float Reconciliation (AI27):</strong> <code>ROUND(AI11 + AI12 + AI13 - AI14 + AI15 - AI19 - AI20 - AI22 - B54 + C54, 2) = 0 ➔ OK</code>
                <br />
                • <strong>Unit Reconciliation (AI28):</strong> <code>ROUND(AI23 - AI24 - Y33, 2) = 0 ➔ OK</code>
                <br />
                • <strong>Total Portfolio Value Carried to Oct (AI40):</strong> <code>AI38 + AI34 = Cash 111,345 + Stock at Cost 61,340 = KES 172,685</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Complete Numerical Data Records */}
      {(activeSection === 'all' || activeSection === '4') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)', marginBottom: '0.75rem' }}>
            4. Complete Numerical Data Records
          </h3>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            4.2 Samsung Financing Sub-Ledger (September 16–30)
          </h4>
          <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-left">DATE</th>
                  <th>MONEY GIVEN OUT</th>
                  <th>EXPECTED RECEIVED BACK</th>
                  <th>NET DIFFERENCE</th>
                  <th className="col-left">NOTES / STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-left">16/09/2026</td>
                  <td className="tabular-nums">3,400</td>
                  <td className="tabular-nums">3,500</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>+100</td>
                  <td className="col-left">Fully recovered + margin</td>
                </tr>
                <tr>
                  <td className="col-left">17/09/2026</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">-</td>
                  <td className="col-left">No trading</td>
                </tr>
                <tr>
                  <td className="col-left">18/09/2026</td>
                  <td className="tabular-nums">9,100</td>
                  <td className="tabular-nums">10,500</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>+1,400</td>
                  <td className="col-left">Fully recovered + margin</td>
                </tr>
                <tr>
                  <td className="col-left">19/09/2026</td>
                  <td className="tabular-nums">10,300</td>
                  <td className="tabular-nums">11,100</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>+800</td>
                  <td className="col-left">Fully recovered + margin</td>
                </tr>
                <tr>
                  <td className="col-left">20/09/2026</td>
                  <td className="tabular-nums">7,000</td>
                  <td className="tabular-nums">7,000</td>
                  <td className="tabular-nums">-</td>
                  <td className="col-left">Capital recovered</td>
                </tr>
                <tr>
                  <td className="col-left">21/09/2026</td>
                  <td className="tabular-nums">9,800</td>
                  <td className="tabular-nums">10,500</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>+700</td>
                  <td className="col-left">Fully recovered + margin</td>
                </tr>
                <tr>
                  <td className="col-left">22/09/2026</td>
                  <td className="tabular-nums">3,900</td>
                  <td className="tabular-nums">3,500</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-rose)' }}>(400)</td>
                  <td className="col-left">Partial recovery</td>
                </tr>
                <tr>
                  <td className="col-left">23/09/2026</td>
                  <td className="tabular-nums">7,000</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-rose)' }}>(7,000)</td>
                  <td className="col-left">Pending return</td>
                </tr>
                <tr>
                  <td className="col-left">24–30/09</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">-</td>
                  <td className="col-left">Blank / pending entries</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="col-left">TOTAL</td>
                  <td className="tabular-nums">50,500</td>
                  <td className="tabular-nums">46,100</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>(4,400)</td>
                  <td className="col-left">KES 4,400 Pending Recovery</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            4.4 Master By-Period Debt Reconciliation (ALL MONTHS!J3:Q6)
          </h4>
          <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-left">PERIOD</th>
                  <th>CASH FROM COLLO</th>
                  <th>VALUE SOLD</th>
                  <th>GROSS NET</th>
                  <th>REINVESTED</th>
                  <th>SETTLED REPAYMENTS</th>
                  <th>CLOSING DEBT</th>
                  <th className="col-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-left"><strong>May – June</strong></td>
                  <td className="tabular-nums">2,221,600</td>
                  <td className="tabular-nums">2,407,800</td>
                  <td className="tabular-nums">(186,200)</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">186,200</td>
                  <td className="tabular-nums"><strong>0</strong></td>
                  <td className="col-left"><span className="badge badge-success">Settled in Full</span></td>
                </tr>
                <tr>
                  <td className="col-left"><strong>July – August</strong></td>
                  <td className="tabular-nums">3,984,100</td>
                  <td className="tabular-nums">4,217,400</td>
                  <td className="tabular-nums">(233,300)</td>
                  <td className="tabular-nums">160,400</td>
                  <td className="tabular-nums">233,300</td>
                  <td className="tabular-nums"><strong>0</strong></td>
                  <td className="col-left"><span className="badge badge-success">Settled in Full</span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="col-left">TOTAL COLLO ERA</td>
                  <td className="tabular-nums">6,205,700</td>
                  <td className="tabular-nums">6,625,200</td>
                  <td className="tabular-nums">(419,500)</td>
                  <td className="tabular-nums">160,400</td>
                  <td className="tabular-nums">419,500</td>
                  <td className="tabular-nums"><strong>0</strong></td>
                  <td className="col-left"><span className="badge badge-success">100% Reconciled</span></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            4.5 Executive Dashboard Multi-Month Progression (DASHBOARD!B8:L18)
          </h4>
          <div className="table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="col-left">MONTH</th>
                  <th className="col-left">MODEL</th>
                  <th>CASH OUT</th>
                  <th>CASH BACK</th>
                  <th>VOLUME</th>
                  <th>BASE PROFIT</th>
                  <th>2ND ACCT</th>
                  <th>NET PROFIT</th>
                  <th>MARGIN %</th>
                  <th>CLOSING BALANCE</th>
                  <th className="col-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-left"><strong>May 2026</strong></td>
                  <td className="col-left">Collo</td>
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
                <tr>
                  <td className="col-left"><strong>Jun 2026</strong></td>
                  <td className="col-left">Collo</td>
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
                <tr>
                  <td className="col-left"><strong>Jul 2026</strong></td>
                  <td className="col-left">Collo</td>
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
                <tr>
                  <td className="col-left"><strong>Aug 2026</strong></td>
                  <td className="col-left">Collo</td>
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
                <tr style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                  <td className="col-left"><strong>Sep 2026</strong></td>
                  <td className="col-left"><span className="badge badge-success">Self-Financed</span></td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>1,460,390</td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>1,474,400</td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>405</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>38,800</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>36,550</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>75,350</td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>5.2%</td>
                  <td className="tabular-nums" style={{ color: 'var(--odoo-teal)', fontWeight: 800 }}>111,345</td>
                  <td className="col-left"><span className="badge badge-warning">Active (64,400 open)</span></td>
                </tr>
                <tr>
                  <td className="col-left"><strong>Oct 2026</strong></td>
                  <td className="col-left">Self-Financed</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0.0%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-neutral">Pending Trading</span></td>
                </tr>
                <tr>
                  <td className="col-left"><strong>Nov 2026</strong></td>
                  <td className="col-left">Self-Financed</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0.0%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-neutral">Pending Trading</span></td>
                </tr>
                <tr>
                  <td className="col-left"><strong>Dec 2026</strong></td>
                  <td className="col-left">Self-Financed</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0</td>
                  <td className="tabular-nums">0.0%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-neutral">Pending Trading</span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="col-left">TOTAL</td>
                  <td className="col-left">5 Active Mos</td>
                  <td className="tabular-nums">8,085,590</td>
                  <td className="tabular-nums">7,680,100</td>
                  <td className="tabular-nums">2,184</td>
                  <td className="tabular-nums">38,800</td>
                  <td className="tabular-nums">36,550</td>
                  <td className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>75,350</td>
                  <td className="tabular-nums">0.9%</td>
                  <td className="tabular-nums">111,345</td>
                  <td className="col-left"><span className="badge badge-success">Fully Tied Out</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: SOP */}
      {(activeSection === 'all' || activeSection === '5') && (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--odoo-teal)', marginBottom: '0.75rem' }}>
            5. Daily Standard Operating Procedure (SOP)
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <strong style={{ color: 'var(--odoo-teal)', display: 'block', marginBottom: '0.5rem' }}>
                MORNING (Opening Float):
              </strong>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.6 }}>
                <li>Check Column K for expected opening cash.</li>
                <li>Physically count cash. If it matches, leave Column B blank.</li>
                <li>If physical cash differs, enter counted cash in Column B.</li>
                <li>Enter any capital injections (+) or owner draws (-) in Column C.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.5rem' }}>
                DURING THE DAY (Disbursement):
              </strong>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.6 }}>
                <li>Col D: Type A (128GB @ 3,700)</li>
                <li>Col F: Type B (64GB @ 3,530)</li>
                <li>Col H: Type C (Pop 20 @ 3,600)</li>
                <li>Cash out (Col N) and in hand (Col O) calculate automatically.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <strong style={{ color: 'var(--accent-emerald)', display: 'block', marginBottom: '0.5rem' }}>
                EVENING (Reconciliation & Close):
              </strong>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.6 }}>
                <li>Col E/G/I: Enter reconciled units returning cash (3,800 / 3,700).</li>
                <li>If Samsung sold, enter in Samsung Sub-Ledger rows 39–53.</li>
                <li>Check Column R for closing float.</li>
                <li>Verify audit cells AI27 ("Float ties") & AI28 ("Reconciliation ties") both read "OK".</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
